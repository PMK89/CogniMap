'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const Datastore = require('@seald-io/nedb');
const crypto = require('node:crypto');
const { exportCanvas, importCanvas } = require('../lib/interchange/json-canvas');
const { ROOT, DATA_DIR, BACKUP_DIR, resolveInside, ensureDir } = require('../lib/paths');
const { ApiError, badRequest, notFound, asyncRoute } = require('../lib/errors');
const { validators } = require('../lib/validate');
const { QuizManager } = require('../lib/quiz');

/**
 * Concept-map element (CME) database API — replaces the Electron
 * dbprocess.js hidden window. Faithful port of its handlers onto NeDB's
 * promise API. Concept-map documents keep their legacy shape
 * (id, title, coor, x0..y1, prio, types, cat, cmobject (JSON string),
 * cdate, vdate, state, prep, prep1).
 */
function createCmeRouter(options = {}) {
  const router = express.Router();
  const dataDir = options.dataDir || DATA_DIR;
  const db = new Datastore({
    filename: options.dbPath || path.join(dataDir, 'cme.db'),
    autoload: true,
  });
  const quizman = new QuizManager(dataDir);
  const datahistory = [];
  const redohistory = [];
  let ratingUndo = null;

  // Startup self-repair: types[0] === 'q1' marks an element as part of the
  // CURRENTLY RUNNING quiz session, which lives in server memory. After a
  // restart no such session exists, so any persisted 'q1' is stale and
  // would overlay the map in every mode. Reset them to dormant 'q'.
  // The db file is backed up before the first repair write.
  const ready = (async () => {
    try {
      const stale = await db.findAsync({ 'types.0': 'q1' });
      if (stale.length === 0) return;
      const dbFile = options.dbPath || path.join(dataDir, 'cme.db');
      if (fs.existsSync(dbFile)) {
        ensureDir(path.join(dataDir, 'backups'));
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        fs.copyFileSync(dbFile, path.join(dataDir, 'backups', `cme.db.${stamp}.bak`));
      }
      for (const doc of stale) {
        doc.types[0] = 'q';
        await db.updateAsync({ _id: doc._id }, doc, {});
      }
      console.log(`[cme] startup repair: reset ${stale.length} stale active-quiz (q1) elements to dormant (q)`);
    } catch (err) {
      console.error('[cme] startup quiz repair failed:', err.message);
      throw err;
    }
  })();
  // Requests must not race startup overlay repair.
  router.use((req, res, next) => ready.then(() => next(), next));

  // Serialize mutations so concurrent review/import requests cannot interleave
  // their read/validate/write stages. Reads remain available.
  let writes = Promise.resolve();
  router.use((req, res, next) => {
    if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return next();
    const previous = writes;
    writes = new Promise(resolve => { res.once('finish', resolve); res.once('close', resolve); });
    previous.then(() => next(), next);
  });

  function pushHistory(doc) {
    if (datahistory.length > 1000) datahistory.shift();
    datahistory.push(doc);
    // a new change invalidates the redo branch
    redohistory.length = 0;
  }

  /** quiz side-effect shared by newCME/changeCME (ported verbatim) */
  function quizSideEffect(arg, fn) {
    if (arg.types && arg.types[0] === 'q') {
      try {
        const cmo = JSON.parse(arg.cmobject);
        if (cmo.style && cmo.style.object &&
            cmo.style.object.weight > -1 && cmo.style.object.str) {
          const dif = cmo.style.object.weight;
          const int = Number(cmo.style.object.str);
          if (typeof dif === 'number' && typeof int === 'number' && dif >= 1.3) {
            quizman[fn](arg.id, dif, int, arg.cat);
          }
        }
      } catch (err) {
        console.warn('[cme] quiz side-effect skipped:', err.message);
      }
    }
  }

  const viewportQuery = (arg) => {
    const l = parseInt(arg.l, 10);
    const t = parseInt(arg.t, 10);
    const r = parseInt(arg.r, 10);
    const b = parseInt(arg.b, 10);
    if ([l, t, r, b].some(Number.isNaN)) throw badRequest('viewport requires numeric l,t,r,b');
    return {
      $or: [
        { $and: [{ x0: { $gt: l, $lt: r } }, { y0: { $gt: t, $lt: b } }] },
        { $and: [{ x1: { $gt: l, $lt: r } }, { y1: { $gt: t, $lt: b } }] },
      ],
    };
  };

  // Canvas import is deliberately additive. Native IDs are never remapped
  // behind the user's back: conflicts must be resolved in a separate map.
  async function canvasPreview(canvas) {
    const existing = await db.findAsync({}, { id: 1 });
    const ids = new Set(existing.map(d => d.id));
    const internalIds = new Set(existing.map(d => d._id));
    const firstId = existing.reduce((max, d) => Math.max(max, Math.abs(d.id)), 0) + 1;
    let documents;
    try { documents = importCanvas(canvas, firstId); }
    catch (err) { throw badRequest(err.message); }
    const conflicts = documents.filter(d => ids.has(d.id) || (d._id && internalIds.has(d._id))).map(d => d.id);
    const token = crypto.createHash('sha256').update(JSON.stringify([canvas, existing.map(d => [d.id, d._id]).sort((a, b) => a[0] - b[0])])).digest('hex');
    return { documents, conflicts, token };
  }

  router.get('/canvas/export', asyncRoute(async (req, res) => {
    let documents = await db.findAsync({});
    if (req.query.ids) {
      const ids = new Set(String(req.query.ids).split(',').map(Number));
      documents = documents.filter(d => ids.has(d.id));
    }
    const canvas = exportCanvas(documents);
    quizman.load();
    const ids = new Set(documents.map(d => d.id));
    canvas['org.cognimap'].quizes = quizman.quizes.filter(q => ids.has(q.id));
    res.set('Content-Disposition', 'attachment; filename="cognimap.canvas"');
    res.json(canvas);
  }));
  router.post('/canvas/preview', asyncRoute(async (req, res) => {
    const preview = await canvasPreview((req.body || {}).canvas);
    res.json({ count: preview.documents.length, conflicts: preview.conflicts, token: preview.token,
      titles: preview.documents.filter(d => d.id > 0).slice(0, 20).map(d => d.title),
      warnings: ['File references are preserved; copy referenced assets separately.', 'Native ID collisions are rejected; existing content is never replaced.'] });
  }));
  router.post('/canvas/import', asyncRoute(async (req, res) => {
    const preview = await canvasPreview((req.body || {}).canvas);
    if (preview.token !== req.body.token || preview.conflicts.length) throw new ApiError(409, 'import_conflict', 'Preview is stale or IDs already exist; preview again or use a separate map');
    const scheduling = req.body.canvas['org.cognimap'] && req.body.canvas['org.cognimap'].quizes || [];
    quizman.load();
    const existingQuizIds = new Set(quizman.quizes.map(q => q.id));
    const importedIds = new Set(preview.documents.map(d => d.id));
    if (!Array.isArray(scheduling) || scheduling.some(q => !q || !importedIds.has(q.id) || existingQuizIds.has(q.id) || !Number.isFinite(q.update) || !Number.isFinite(q.difficulty) || !Number.isFinite(q.interval))) throw badRequest('Invalid or conflicting quiz scheduling metadata');
    const documents = preview.documents;
    // NeDB array insertion validates the whole batch before inserting it.
    await db.insertAsync(documents);
    if (scheduling.length) { quizman.quizes.push(...scheduling); quizman.save(); }
    res.status(201).json({ inserted: documents.length });
  }));

  // ---- element queries ----

  // old channel: loadCME -> loadedCME
  router.post('/cme/query', asyncRoute(async (req, res) => {
    const data = await db.findAsync(viewportQuery(req.body || {}));
    res.json(data);
  }));

  // Full-map graph load for the 3D workspace. Returns EVERY document with a
  // light projection: the 3D scene needs geometry, type, title and links,
  // never the heavy pre-rendered `prep` SVG — dropping it keeps the 41k-node
  // payload manageable. Independent of the 2D viewport so the 3D view shows
  // the whole knowledge map, not just what the 2D canvas has lazy-loaded.
  router.get('/cme/graph', asyncRoute(async (req, res) => {
    const data = await db.findAsync({}, {
      prep: 0, cmpicture: 0, thumb: 0,
    });
    res.json(data);
  }));

  // old channel: getCME
  router.get('/cme/id/:id', asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw badRequest('id must be numeric');
    const data = await db.findOneAsync({ id });
    res.json(data); // null when not found — matches old undefined returnValue
  }));

  router.get('/cme/search', asyncRoute(async (req, res) => {
    const { searchNodes } = require('../lib/search');
    const docs = await db.findAsync({ id: { $gt: 0 } }, { id: 1, title: 1, coor: 1, types: 1 });
    res.json(searchNodes(docs, String(req.query.q || '').slice(0, 200), req.query.type));
  }));

  // old channel: getCMETitle — case-insensitive regex search
  router.get('/cme/title/:title', asyncRoute(async (req, res) => {
    let regextitle;
    try {
      regextitle = new RegExp(req.params.title, 'i');
    } catch (err) {
      throw badRequest('invalid title pattern');
    }
    const data = await db.findAsync({ title: { $regex: regextitle } });
    res.json(data);
  }));

  // old channel: getAllPrio
  router.get('/cme/prio/:prio', asyncRoute(async (req, res) => {
    const prio = Number(req.params.prio);
    if (Number.isNaN(prio)) throw badRequest('prio must be numeric');
    const data = await db.findAsync({ prio });
    res.json(data);
  }));

  // old channel: getSince -> changedSince
  router.get('/cme/since/:ts', asyncRoute(async (req, res) => {
    const ts = Number(req.params.ts);
    if (Number.isNaN(ts)) throw badRequest('ts must be numeric');
    const data = await db.findAsync({ vdate: { $gt: ts } });
    res.json(data);
  }));

  // old channel: getMaxID -> maxID
  router.get('/cme/maxid', asyncRoute(async (req, res) => {
    const gt = Number(req.query.gt || 0);
    const data = await db.findAsync({ id: { $gt: gt } });
    data.sort((a, b) => b.id - a.id);
    res.json({ maxid: data.length > 0 ? data[0].id : gt });
  }));

  // ---- element mutations ----

  // old channel: newCME
  router.post('/cme', asyncRoute(async (req, res) => {
    const arg = req.body;
    if (!validators.cme(arg)) throw badRequest('invalid element payload', validators.cme.errors);
    quizSideEffect(arg, 'makeQuiz');
    delete arg._id; // never trust client _id on insert
    const inserted = await db.insertAsync(arg);
    res.json(inserted);
  }));

  // old channel: changeCME -> changedCME (+ category rename side effect)
  router.put('/cme', asyncRoute(async (req, res) => {
    const arg = req.body;
    if (!validators.cme(arg)) throw badRequest('invalid element payload', validators.cme.errors);
    quizSideEffect(arg, 'changeQuiz');
    const data = await db.findOneAsync({ id: arg.id });
    if (!data) {
      // legacy parity: dbprocess.js silently ignored changes to unknown ids
      res.json({ data: null, catChanged: [] });
      return;
    }
    // record undo history only for meaningful changes — the app constantly
    // PUTs pure UI-state flips (state/prep/vdate) that would drown out
    // real edits in the undo buffer
    const MEANINGFUL = ['coor', 'x0', 'y0', 'x1', 'y1', 'prio', 'types', 'cat', 'cmobject', 'title'];
    if (MEANINGFUL.some((k) => JSON.stringify(data[k]) !== JSON.stringify(arg[k]))) {
      pushHistory(JSON.parse(JSON.stringify(data)));
    }

    let catChanged = [];
    if (data.title !== arg.title) {
      catChanged = await findCatChildren(data, data.title, arg.title);
    }
    data.coor = arg.coor;
    data.x0 = arg.x0;
    data.y0 = arg.y0;
    data.x1 = arg.x1;
    data.y1 = arg.y1;
    data.prio = arg.prio;
    data.types = arg.types;
    data.cat = arg.cat;
    data.cmobject = arg.cmobject;
    data.cdate = arg.cdate;
    data.vdate = Date.now();
    data.title = arg.title;
    data.state = arg.state;
    data.prep = arg.prep;
    data.prep1 = arg.prep1;
    await db.updateAsync({ id: arg.id }, data, { upsert: true });
    res.json({ data, catChanged });
  }));

  // old channel: delCME -> deletedCME
  router.delete('/cme/:id', asyncRoute(async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) throw badRequest('id must be numeric');
    const data = await db.findOneAsync({ id });
    if (!data) {
      res.json({ error: true, message: 'CME not found', id });
      return;
    }
    if (data.types && (data.types[0] === 'q' || data.types[0] === 'q1')) {
      quizman.deleteQuiz(data.id);
    }
    data.state = 'del';
    pushHistory(data);
    await db.removeAsync({ id }, {});
    res.json({ success: true, id, data });
  }));

  // undo — restore the most recent pre-change snapshot from the history
  // buffer (dbprocess.js kept the same buffer but never exposed retrieval)
  router.post('/cme/undo', asyncRoute(async (req, res) => {
    const entry = datahistory.pop();
    if (!entry) {
      res.json({ data: null, message: 'history empty' });
      return;
    }
    const doc = JSON.parse(JSON.stringify(entry));
    const wasDeleted = doc.state === 'del';
    if (wasDeleted) doc.state = '';
    // capture the pre-undo state of this element for redo
    const current = await db.findOneAsync({ id: doc.id });
    if (redohistory.length > 1000) redohistory.shift();
    redohistory.push(current
      ? JSON.parse(JSON.stringify(current))
      : { id: doc.id, __wasAbsent: true });
    delete doc._id;
    await db.updateAsync({ id: doc.id }, doc, { upsert: true });
    res.json({ data: doc, wasDeleted });
  }));

  // redo — reapply the change most recently reverted by undo
  router.post('/cme/redo', asyncRoute(async (req, res) => {
    const entry = redohistory.pop();
    if (!entry) {
      res.json({ data: null, message: 'redo history empty' });
      return;
    }
    // put the pre-redo state back onto the undo stack (without clearing
    // the remaining redo branch)
    const current = await db.findOneAsync({ id: entry.id });
    if (current) {
      if (datahistory.length > 1000) datahistory.shift();
      datahistory.push(entry.__wasAbsent
        ? Object.assign(JSON.parse(JSON.stringify(current)), { state: 'del' })
        : JSON.parse(JSON.stringify(current)));
    }
    if (entry.__wasAbsent) {
      // the element did not exist before the undo — redo deletes it again
      await db.removeAsync({ id: entry.id }, {});
      res.json({ data: null, deletedId: entry.id });
      return;
    }
    const doc = JSON.parse(JSON.stringify(entry));
    delete doc._id;
    await db.updateAsync({ id: doc.id }, doc, { upsert: true });
    res.json({ data: doc });
  }));

  // ---- selection traversals ----

  /**
   * old channel: findChildren -> selectedChildren
   * Deterministic BFS replacement for the setTimeout-race version in
   * dbprocess.js — same classification rules and quirks:
   *  - only objects (id >= 1) are traversed
   *  - a links array with length <= 1 is NOT iterated (legacy quirk)
   *  - root links with start === false become border links
   *  - link.weight === 0 -> border, otherwise selected; only weight !== 0
   *    target objects are recursed into
   */
  router.post('/cme/children', asyncRoute(async (req, res) => {
    const root = req.body;
    if (!validators.cme(root)) throw badRequest('invalid element payload', validators.cme.errors);
    const selCMEoArray = [];
    const selCMElArray = [];
    const selCMElArrayBorder = [];
    const cmeArray = [];

    async function selectLinks(cme0) {
      if (!cme0 || typeof cme0.id !== 'number' || cme0.id < 1) return;
      if (selCMEoArray.indexOf(cme0.id) !== -1) return;
      cmeArray.push(cme0);
      let cmobject;
      try {
        cmobject = typeof cme0.cmobject === 'string' ? JSON.parse(cme0.cmobject) : cme0.cmobject;
      } catch (err) {
        return;
      }
      if (!cmobject || !cmobject.links) {
        selCMEoArray.push(cme0.id);
        return;
      }
      selCMEoArray.push(cme0.id);
      if (cmobject.links.length <= 1) return; // legacy quirk preserved
      for (const link of cmobject.links) {
        if (!link) continue;
        if (cme0.id === root.id && link.start === false) {
          const data = await db.findOneAsync({ id: link.id });
          if (data) {
            selCMElArrayBorder.push(data.id);
            cmeArray.push(data);
          }
        } else {
          if (link.id !== 0 && selCMElArray.indexOf(link.id) === -1) {
            const data = await db.findOneAsync({ id: link.id });
            if (data) {
              if (link.weight === 0) selCMElArrayBorder.push(data.id);
              else selCMElArray.push(data.id);
              cmeArray.push(data);
            }
          }
          if (selCMEoArray.indexOf(link.targetId) === -1 && link.weight !== 0) {
            const target = await db.findOneAsync({ id: link.targetId });
            if (target) await selectLinks(target);
          }
        }
      }
    }

    await selectLinks(root);
    res.json({
      selCMEoArray,
      selCMElArray,
      selarray: cmeArray,
      selCMElArrayBorder,
      minimap: false,
    });
  }));

  // old channel: findArea -> selectedChildren (minimap: true)
  router.post('/cme/area', asyncRoute(async (req, res) => {
    const arg = req.body || {};
    const data = await db.findAsync(viewportQuery(arg));
    const l = parseInt(arg.l, 10);
    const t = parseInt(arg.t, 10);
    const r = parseInt(arg.r, 10);
    const b = parseInt(arg.b, 10);
    const ids = [];
    const selCMEoArray = [];
    const selCMElArray = [];
    const selCMElArrayBorder = [];
    for (const data0 of data) {
      if (!data0) continue;
      if (data0.id >= 1) {
        selCMEoArray.push(data0);
      } else if (data0.id <= -1) {
        // legacy substring parsing of the serialized cmobject to find the
        // partner object id of a border-crossing line
        if (l < data0.x0 && data0.x0 < r && t < data0.y0 && data0.y0 < b) {
          if (l < data0.x1 && data0.x1 < r && t < data0.y1 && data0.y1 < b) {
            selCMElArray.push(data0);
          } else {
            selCMElArrayBorder.push(data0);
            const pos = data0.cmobject.indexOf('id1');
            let id = data0.cmobject.slice(pos + 5, pos + 22);
            id = parseInt(id.slice(0, id.indexOf(',')), 10);
            ids.push(id);
          }
        } else if (l < data0.x1 && data0.x1 < r && t < data0.y1 && data0.y1 < b) {
          selCMElArrayBorder.push(data0);
          const pos = data0.cmobject.indexOf('id0');
          let id = data0.cmobject.slice(pos + 5, pos + 22);
          id = parseInt(id.slice(0, id.indexOf(',')), 10);
          ids.push(id);
        }
      }
    }
    const cmeArray = await db.findAsync({ id: { $in: ids } });
    res.json({
      selCMEoArray,
      selCMElArray,
      selarray: cmeArray,
      selCMElArrayBorder,
      minimap: true,
    });
  }));

  /**
   * old function: findCatChildren — when an element is renamed, walk its
   * link graph and rename matching category entries on children.
   * Returns the changed documents (old code broadcast them as changedCME).
   */
  async function findCatChildren(arg, title0, title1) {
    const selCMEoArray = [];
    const cmeArray = [];
    const catl = arg.cat ? arg.cat.length : 0;

    async function selectLinks(cme0) {
      if (!cme0 || typeof cme0.id !== 'number' || cme0.id < 1) return;
      if (selCMEoArray.indexOf(cme0.id) !== -1) return;
      // legacy quirk preserved: the comparison result of the LAST category
      // index wins (iscat is overwritten each iteration)
      let iscat = false;
      for (let i = 0; i < catl; i++) {
        if (arg.cat[i] && cme0.cat && cme0.cat[i]) {
          iscat = arg.cat[i] === cme0.cat[i] || title0 === cme0.cat[i];
        } else {
          iscat = false;
        }
      }
      if (!iscat) return;
      const catpos = cme0.cat.indexOf(title0);
      if (catpos === -1) return;
      cme0.cat[catpos] = title1;
      await db.updateAsync({ _id: cme0._id }, cme0, {});
      cmeArray.push(cme0);
      let cmobject;
      try {
        cmobject = typeof cme0.cmobject === 'string' ? JSON.parse(cme0.cmobject) : cme0.cmobject;
      } catch (err) {
        return;
      }
      if (!cmobject || !cmobject.links) return;
      selCMEoArray.push(cme0.id);
      if (cmobject.links.length <= 1) return; // legacy quirk preserved
      for (const link of cmobject.links) {
        if (!link) continue;
        if (selCMEoArray.indexOf(link.targetId) === -1) {
          const target = await db.findOneAsync({ id: link.targetId });
          if (target) await selectLinks(target);
        }
      }
    }

    await selectLinks(arg);
    return cmeArray;
  }

  // ---- minimap ----

  // old channel: loadMM -> loadedMM
  router.get('/minimap', (req, res) => {
    const file = path.join(dataDir, 'minimap.json');
    if (!fs.existsSync(file)) {
      res.json(null);
      return;
    }
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')));
  });

  // old channel: saveMM
  router.put('/minimap', (req, res) => {
    const file = path.join(dataDir, 'minimap.json');
    fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  });

  // ---- database import/export ----

  // live data files that no API is ever allowed to delete or overwrite
  const PROTECTED_FILES = [
    'cme.db', 'settings.json', 'colors.json', 'buttons.json',
    'templates.json', 'spechars.json', 'quizes.json', 'minimap.json',
  ];

  // old channel: saveDb — export all elements (sorted by cdate) to a JSON file
  router.post('/db/save', asyncRoute(async (req, res) => {
    const file = String((req.body || {}).file || '');
    if (!file.endsWith('.json')) throw badRequest('export file must end with .json');
    const abs = resolveInside(ROOT, file.replace(/^\.\//, '').replace(/^\/+/, ''));
    if (PROTECTED_FILES.indexOf(path.basename(abs)) !== -1) {
      throw badRequest('refusing to overwrite a live data file: ' + path.basename(abs));
    }
    // never silently clobber an existing export either
    if (fs.existsSync(abs)) {
      ensureDir(BACKUP_DIR);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(abs, path.join(BACKUP_DIR, path.basename(abs) + '.' + stamp + '.bak'));
    }
    const data = await db.findAsync({});
    data.sort((a, b) => (a.cdate || 0) - (b.cdate || 0));
    ensureDir(path.dirname(abs));
    fs.writeFileSync(abs, JSON.stringify(data.filter(Boolean), null, 2));
    res.json({ status: 'database saved to ' + file });
  }));

  // old channel: loadDb — import elements from a JSON file
  router.post('/db/load', asyncRoute(async (req, res) => {
    const file = String((req.body || {}).file || '');
    const abs = resolveInside(ROOT, file.replace(/^\.\//, '').replace(/^\/+/, ''));
    if (!fs.existsSync(abs)) throw notFound('import file not found: ' + file);
    const docs = JSON.parse(fs.readFileSync(abs, 'utf8'));
    if (!Array.isArray(docs)) throw badRequest('import file must contain a JSON array');
    let inserted = 0;
    for (const doc of docs) {
      if (!doc) continue;
      try {
        await db.insertAsync(doc);
        inserted++;
      } catch (err) {
        // duplicate _id etc. — old code logged and continued
        console.warn('[db/load] skipped doc:', err.message);
      }
    }
    res.json({ status: 'database loaded', inserted });
  }));

  // old channel: deleteDb — wiping the element database is DISABLED by
  // default: database files must never be deleted. The legacy menu action
  // can only be re-enabled explicitly (COGNIMAP_ALLOW_DB_WIPE=1), and even
  // then the db file is backed up first and only emptied, never removed.
  router.post('/db/delete', asyncRoute(async (req, res) => {
    if (process.env.COGNIMAP_ALLOW_DB_WIPE !== '1') {
      throw new ApiError(403, 'db_wipe_disabled',
        'Deleting the database is disabled to protect user data. ' +
        'Set COGNIMAP_ALLOW_DB_WIPE=1 to allow it (a backup is still taken).');
    }
    const dbFile = options.dbPath || path.join(dataDir, 'cme.db');
    if (fs.existsSync(dbFile)) {
      ensureDir(BACKUP_DIR);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(dbFile, path.join(BACKUP_DIR, `cme.db.${stamp}.bak`));
    }
    await db.removeAsync({}, { multi: true });
    res.json({ status: 'database deleted' });
  }));

  // old channel: searchDb — its body is commented out in dbprocess.js
  router.post('/db/search', (req, res) => {
    res.json({ status: 'noop' });
  });

  // ---- quiz ----

  const quizResponse = () => ({
    catlist: quizman.quizcat,
    timelist: quizman.quiztime,
    quizes: quizman.quizcmes,
  });

  /**
   * old function: getOverdueQuizes — sequentially mark each due element as
   * an active quiz (types[0]='q1'), persist, and collect it for the client.
   */
  async function collectOverdueQuizes(overduearray) {
    for (const overduequiz of overduearray) {
      if (!overduequiz) continue;
      const quizobj = await db.findOneAsync({ id: overduequiz.id });
      if (!quizobj) continue;
      quizobj.types = quizobj.types || [];
      quizobj.types[0] = 'q1';
      try {
        const cmo = JSON.parse(quizobj.cmobject);
        if (cmo && cmo.style && cmo.style.object) {
          cmo.style.object.str = String(overduequiz.interval);
          cmo.style.object.weight = overduequiz.dif;
          quizobj.cmobject = JSON.stringify(cmo);
        }
      } catch (err) {
        console.warn('[quiz] cmobject parse failed for', overduequiz.id, err.message);
      }
      quizman.quizcmes.push(quizobj);
      await db.updateAsync(
        { id: overduequiz.id },
        { $set: { types: quizobj.types, cmobject: quizobj.cmobject } },
        {}
      );
    }
    quizman.quizclick = 0;
  }

  async function clearQuizCovers() {
    ratingUndo = null;
    // Query persistence, not only the current queue: a previous filter or
    // interrupted request may have left covers outside that queue.
    const active = await db.findAsync({ 'types.0': 'q1' });
    for (const doc of active) {
      const types = doc.types.slice();
      types[0] = 'q';
      await db.updateAsync({ _id: doc._id }, { $set: { types } }, {});
    }
    quizman.quizcmes = [];
  }

  // old channel: loadQuizes -> loadedQuizes
  router.post('/quiz/load', asyncRoute(async (req, res) => {
    const limit = Number((req.body || {}).limit || 42);
    quizman.load();
    const today0 = quizman.today + quizman.quizclick;
    const overduearray = [];
    quizman.quizcat = [];
    quizman.quiztime = [];
    await clearQuizCovers();
    for (const quiz of quizman.quizes) {
      if (!quiz) continue;
      if (quiz.cat.length > 3) {
        quiz.cat = quiz.cat.slice(0, 3);
      } else {
        const cat = quiz.cat.slice();
        for (let i = 0; i < 3 - quiz.cat.length; i++) cat.push('none');
        quiz.cat = cat;
      }
      quizman.quizcat.push(quiz.cat.slice());
      const quizcatlen = quizman.quizcat.length;
      if (today0 >= quiz.update) {
        if (quizcatlen > 0) quizman.quizcat[quizcatlen - 1].push(quiz.id);
        overduearray.push({
          id: quiz.id,
          od: today0 - quiz.update,
          interval: quiz.interval,
          dif: quiz.difficulty,
        });
      } else {
        const dueday = quiz.update - today0;
        quizman.quiztime[dueday] = (quizman.quiztime[dueday] || 0) + 1;
      }
    }
    if (overduearray.length > 0) {
      overduearray.sort((a, b) => b.od - a.od);
      overduearray.splice(limit);
    }
    await collectOverdueQuizes(overduearray);
    res.json(quizResponse());
  }));

  // old channel: loadQuizesbyCat -> loadedQuizes
  router.post('/quiz/bycat', asyncRoute(async (req, res) => {
    const arg = (req.body || {}).params || [];
    if (!Array.isArray(arg)) throw badRequest('params must be an array');
    quizman.load();
    const today0 = quizman.today;
    await clearQuizCovers();
    const overduearray = [];
    for (const quiz of quizman.quizes) {
      if (!quiz) continue;
      let isshown = today0 >= quiz.update || Boolean(arg[0]);
      if (arg[1] && isshown) isshown = arg[1] === quiz.cat[0];
      if (arg[2] && isshown) isshown = arg[2] === quiz.cat[1];
      if (arg[3] && isshown) isshown = arg[3] === quiz.cat[2];
      if (isshown) {
        overduearray.push({
          id: quiz.id,
          od: today0 - quiz.update,
          interval: quiz.interval,
          dif: quiz.difficulty,
        });
      }
    }
    if (overduearray.length > 0) {
      overduearray.sort((a, b) => b.od - a.od);
      quizman.quizcmes = [];
      if (arg.length < 3 && overduearray.length > 100) overduearray.splice(100);
      await collectOverdueQuizes(overduearray);
    }
    res.json(quizResponse());
  }));

  // old channel: unQuiz -> loadedQuizes
  router.post('/quiz/unquiz', asyncRoute(async (req, res) => {
    await clearQuizCovers();
    res.json({ quizes: quizman.quizcmes });
  }));

  // old channel: answerQuiz -> loadedQuizes
  router.post('/quiz/answer', asyncRoute(async (req, res) => {
    const arg = req.body || {};
    if (!validators.quizAnswer(arg)) {
      throw badRequest('invalid quiz answer', validators.quizAnswer.errors);
    }
    quizman.load();
    const pos = quizman.quizes.findIndex((i) => i.id === arg.id);
    if (pos === -1) {
      res.json({ quizes: quizman.quizcmes, unchanged: true });
      return;
    }
    const pos0 = quizman.quizcmes.findIndex((i) => i.id === arg.id);
    if (pos0 === -1) {
      res.json({ quizes: quizman.quizcmes, unchanged: true });
      return;
    }
    const data = quizman.quizcmes[pos0];
    let cmo;
    try { cmo = JSON.parse(data.cmobject); }
    catch (err) { throw badRequest('The quiz cover has malformed content; repair it before rating'); }
    if (!cmo || !cmo.style || !cmo.style.object) throw badRequest('The quiz cover is missing scheduling style');
    const previous = { schedules: JSON.parse(JSON.stringify(quizman.quizes)), queue: JSON.parse(JSON.stringify(quizman.quizcmes)), id: arg.id };
    const calc = quizman.calculate(quizman.quizes[pos], arg.scale, quizman.today);
    cmo.style.object.str = String(calc.interval);
    cmo.style.object.weight = calc.difficulty;
    const updated = { ...data, types: data.types.slice(), cmobject: JSON.stringify(cmo) };
    updated.types[0] = arg.scale < 4 ? 'q1' : 'q';
    try { await db.updateAsync({ _id: data._id }, updated, {}); }
    catch (err) { quizman.quizcmes = previous.queue; throw err; }
    quizman.quizes[pos].difficulty = calc.difficulty;
    quizman.quizes[pos].interval = calc.interval;
    quizman.quizes[pos].update = calc.update;
    quizman.quizcmes.splice(pos0, 1);
    // Retried covers must remain active and carry the updated scheduling style.
    quizman.quizcmes = quizman.quizcmes.map(doc => doc.id === arg.id ? updated : doc);
    ratingUndo = previous;
    ratingUndo.graded = JSON.parse(JSON.stringify(quizman.quizes[pos]));
    quizman.save();
    res.json({ quizes: quizman.quizcmes });
  }));

  router.post('/quiz/undo', asyncRoute(async (req, res) => {
    if (!ratingUndo) return res.json({ quizes: quizman.quizcmes, unchanged: true });
    const previous = ratingUndo;
    const cover = previous.queue.find(d => d.id === previous.id);
    const currentSchedule = quizman.quizes.find(q => q.id === previous.id);
    if (JSON.stringify(currentSchedule) !== JSON.stringify(previous.graded)) throw new ApiError(409, 'quiz_changed', 'This schedule was edited after rating; undo would overwrite that edit');
    const current = await db.findOneAsync({ id: previous.id });
    if (!current) throw new ApiError(409, 'quiz_changed', 'The reviewed cover was deleted; undo is no longer available');
    // Restore only scheduling style and active state; preserve intervening edits.
    const cmo = JSON.parse(current.cmobject);
    const priorCmo = JSON.parse(cover.cmobject);
    cmo.style.object.str = priorCmo.style.object.str;
    cmo.style.object.weight = priorCmo.style.object.weight;
    const types = current.types.slice(); types[0] = 'q1';
    await db.updateAsync({ id: previous.id }, { $set: { types, cmobject: JSON.stringify(cmo) } }, {});
    const priorSchedule = previous.schedules.find(q => q.id === previous.id);
    quizman.quizes = quizman.quizes.map(q => q.id === previous.id ? priorSchedule : q);
    quizman.quizcmes = previous.queue;
    quizman.save();
    ratingUndo = null;
    res.json({ quizes: quizman.quizcmes });
  }));

  return router;
}

module.exports = { createCmeRouter };
