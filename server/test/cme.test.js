'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');

let server;
let url;

test.before(async () => {
  const dataDir = makeTmpDataDir();
  server = await startServer(dataDir);
  url = baseUrl(server);
});

test.after(() => {
  server.close();
});

const json = (method, body) => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

test('POST /api/cme/query returns fixture docs with legacy fields intact', async () => {
  const res = await fetch(`${url}/api/cme/query`, json('POST', { l: 335700, t: 175500, r: 336100, b: 175700 }));
  assert.equal(res.status, 200);
  const data = await res.json();
  const ids = data.map((d) => d.id).sort((a, b) => a - b);
  assert.deepEqual(ids, [-3059630597, 30596, 30597]);
  const node = data.find((d) => d.id === 30596);
  assert.equal(typeof node.cmobject, 'string');
  assert.ok('x0' in node && 'y0' in node && 'x1' in node && 'y1' in node);
});

test('GET /api/cme/id/:id returns a doc', async () => {
  const res = await fetch(`${url}/api/cme/id/30596`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.id, 30596);
  assert.equal(body.title, 'unbeweglich');
});

test('GET /api/cme/id/:id returns null for unknown id', async () => {
  const res = await fetch(`${url}/api/cme/id/424242`);
  assert.equal(res.status, 200);
  assert.equal(await res.json(), null);
});

test('GET /api/cme/title/:title regex search is case-insensitive', async () => {
  const res = await fetch(`${url}/api/cme/title/homo`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.some((d) => d.title === 'HOMO'));
});

test('POST /api/cme inserts and GET /api/cme/maxid reflects it', async () => {
  const res = await fetch(`${url}/api/cme`, json('POST', {
    id: 99999, title: 'new node', x0: 0, y0: 0, x1: 10, y1: 10,
    prio: 0, types: ['a', 'a', '0'], cat: [], coor: { x: 0, y: 0 },
    cmobject: '{}', cdate: Date.now(), state: '', prep: '', prep1: '',
  }));
  assert.equal(res.status, 200);
  const inserted = await res.json();
  assert.equal(inserted.id, 99999);

  const maxidRes = await fetch(`${url}/api/cme/maxid?gt=90000`);
  const { maxid } = await maxidRes.json();
  assert.equal(maxid, 99999);
});

test('PUT /api/cme updates fields and bumps vdate', async () => {
  const before = await (await fetch(`${url}/api/cme/id/5338`)).json();
  const res = await fetch(`${url}/api/cme`, json('PUT', {
    ...before,
    prio: before.prio + 1,
  }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data.prio, before.prio + 1);
  assert.ok(body.data.vdate > before.vdate);
  assert.deepEqual(body.catChanged, []);
});

test('PUT /api/cme with unknown id returns data: null', async () => {
  const res = await fetch(`${url}/api/cme`, json('PUT', { id: 8888888, title: 'x' }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data, null);
});

test('DELETE /api/cme/:id removes the doc', async () => {
  const res = await fetch(`${url}/api/cme/7462`, { method: 'DELETE' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.id, 7462);

  const after = await (await fetch(`${url}/api/cme/id/7462`)).json();
  assert.equal(after, null);
});

test('POST /api/cme/children returns selection arrays', async () => {
  const root = await (await fetch(`${url}/api/cme/id/30596`)).json();
  const res = await fetch(`${url}/api/cme/children`, json('POST', root));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok('selCMEoArray' in body);
  assert.ok('selCMElArray' in body);
  assert.ok('selarray' in body);
  assert.ok('selCMElArrayBorder' in body);
  assert.deepEqual(body.selCMEoArray.slice().sort((a, b) => a - b), [30596, 30597]);
  assert.deepEqual(body.selCMElArray, [-3059630597]);
  assert.deepEqual(body.selCMElArrayBorder, []);
});

test('POST /api/cme/area returns selection arrays for a viewport', async () => {
  const res = await fetch(`${url}/api/cme/area`, json('POST', { l: 335700, t: 175500, r: 336100, b: 175700 }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok('selCMEoArray' in body);
  assert.ok('selCMElArray' in body);
  assert.ok('selarray' in body);
  assert.ok('selCMElArrayBorder' in body);
  const oIds = body.selCMEoArray.map((d) => d.id).sort((a, b) => a - b);
  assert.deepEqual(oIds, [30596, 30597]);
  assert.equal(body.selCMElArray.length, 1);
  assert.equal(body.selCMElArray[0].id, -3059630597);
});

test('POST /api/cme/area resolves a border-crossing line via the legacy id1 parse', async () => {
  const res = await fetch(`${url}/api/cme/area`, json('POST', { l: 335800, t: 175590, r: 335900, b: 175600 }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.selCMElArrayBorder.length, 1);
  assert.equal(body.selCMElArrayBorder[0].id, -3059630597);
  assert.equal(body.selarray.length, 1);
  assert.equal(body.selarray[0].id, 30597);
});

// ---- database-file protection ----

test('POST /api/db/delete is refused by default (database files are never deleted)', async () => {
  const res = await fetch(`${url}/api/db/delete`, json('POST', {}));
  assert.equal(res.status, 403);
  const body = await res.json();
  assert.equal(body.error.code, 'db_wipe_disabled');
});

test('POST /api/db/save refuses to overwrite live data files', async () => {
  for (const file of ['data/quizes.json', 'data/settings.json', 'data/templates.json']) {
    const res = await fetch(`${url}/api/db/save`, json('POST', { file }));
    assert.equal(res.status, 400, file);
    const body = await res.json();
    assert.match(body.error.message, /refusing to overwrite/);
  }
});

test('POST /api/db/save backs up an existing export before overwriting it', async () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const file = 'e2e-tmp-export-test.json';
  const abs = path.join(process.cwd(), file);
  try {
    const first = await fetch(`${url}/api/db/save`, json('POST', { file }));
    assert.equal(first.status, 200);
    const second = await fetch(`${url}/api/db/save`, json('POST', { file }));
    assert.equal(second.status, 200);
    const backups = fs.readdirSync(path.join(process.env.COGNIMAP_DATA_DIR, 'backups'))
      .filter((f) => f.startsWith(file));
    assert.ok(backups.length >= 1, 'expected a backup of the overwritten export');
  } finally {
    fs.rmSync(abs, { force: true });
  }
});

// ---- undo / redo ----

test('undo restores a change and redo reapplies it', async () => {
  const doc = await (await fetch(`${url}/api/cme/id/30596`)).json();
  const originalTitle = doc.title;
  doc.title = 'undo-redo-test';
  const put = await fetch(`${url}/api/cme`, json('PUT', doc));
  assert.equal(put.status, 200);

  const undo = await (await fetch(`${url}/api/cme/undo`, json('POST', {}))).json();
  assert.equal(undo.data.title, originalTitle);
  let now = await (await fetch(`${url}/api/cme/id/30596`)).json();
  assert.equal(now.title, originalTitle);

  const redo = await (await fetch(`${url}/api/cme/redo`, json('POST', {}))).json();
  assert.equal(redo.data.title, 'undo-redo-test');
  now = await (await fetch(`${url}/api/cme/id/30596`)).json();
  assert.equal(now.title, 'undo-redo-test');

  // undo again to leave the fixture element roughly as found
  await fetch(`${url}/api/cme/undo`, json('POST', {}));
});

test('undo of a deletion restores; redo deletes again', async () => {
  const doc = await (await fetch(`${url}/api/cme/id/30597`)).json();
  assert.ok(doc && doc.id === 30597);
  const del = await (await fetch(`${url}/api/cme/30597`, { method: 'DELETE' })).json();
  assert.equal(del.success, true);

  await fetch(`${url}/api/cme/undo`, json('POST', {}));
  let now = await (await fetch(`${url}/api/cme/id/30597`)).json();
  assert.ok(now && now.id === 30597, 'undo should restore the deleted element');

  const redo = await (await fetch(`${url}/api/cme/redo`, json('POST', {}))).json();
  assert.equal(redo.deletedId, 30597);
  now = await (await fetch(`${url}/api/cme/id/30597`)).json();
  assert.equal(now, null);

  // restore for other tests
  await fetch(`${url}/api/cme/undo`, json('POST', {}));
});
