'use strict';

// JSON Canvas 1.0: https://jsoncanvas.org/spec/1.0/
// Pure adapter. Native documents remain authoritative and are never mutated.
const crypto = require('node:crypto');
const NS = 'org.cognimap';
const clone = value => JSON.parse(JSON.stringify(value));
const parse = doc => typeof doc.cmobject === 'string' ? JSON.parse(doc.cmobject) : (doc.cmobject || {});
const digest = canvas => crypto.createHash('sha256').update(JSON.stringify([canvas.nodes || [], canvas.edges || []])).digest('hex');
const color = value => typeof value === 'string' && /^(#[0-9a-f]{6}|[1-6])$/i.test(value) ? value : undefined;

function validate(canvas) {
  if (!canvas || typeof canvas !== 'object' || Array.isArray(canvas)) throw new Error('Canvas must be an object');
  const nodes = canvas.nodes || [], edges = canvas.edges || [];
  if (!Array.isArray(nodes) || !Array.isArray(edges)) throw new Error('nodes and edges must be arrays');
  const ids = new Set();
  for (const n of nodes) {
    if (!n || typeof n.id !== 'string' || !n.id || ids.has(n.id)) throw new Error('Missing or duplicate node ID');
    ids.add(n.id);
    if (!['text', 'file', 'link', 'group'].includes(n.type)) throw new Error('Unsupported node type');
    if (!['x', 'y', 'width', 'height'].every(k => Number.isSafeInteger(n[k])) || n.width <= 0 || n.height <= 0) throw new Error('Invalid Canvas geometry');
    const field = { text: 'text', file: 'file', link: 'url' }[n.type];
    if (field && typeof n[field] !== 'string') throw new Error('Missing ' + field);
  }
  const edgeIds = new Set();
  for (const e of edges) {
    if (!e || typeof e.id !== 'string' || !e.id || edgeIds.has(e.id)) throw new Error('Missing or duplicate edge ID');
    edgeIds.add(e.id);
    if (!ids.has(e.fromNode) || !ids.has(e.toNode)) throw new Error('Unknown edge endpoint');
    for (const key of ['fromEnd', 'toEnd']) if (e[key] !== undefined && !['none', 'arrow'].includes(e[key])) throw new Error('Invalid edge end');
    for (const key of ['fromSide', 'toSide']) if (e[key] !== undefined && !['top', 'right', 'bottom', 'left'].includes(e[key])) throw new Error('Invalid edge side');
  }
}

function validateNative(docs) {
  if (!Array.isArray(docs)) throw new Error('Native documents must be an array');
  const ids = new Set();
  const internalIds = new Set();
  for (const doc of docs) {
    if (!doc || !Number.isInteger(doc.id) || ids.has(doc.id)) throw new Error('Invalid or duplicate native ID');
    ids.add(doc.id);
    if (doc._id !== undefined) {
      if (typeof doc._id !== 'string' || internalIds.has(doc._id)) throw new Error('Invalid or duplicate native database ID');
      internalIds.add(doc._id);
    }
  }
}

function exportCanvas(documents) {
  validateNative(documents);
  const nodes = [], edges = [];
  const byId = new Map(documents.map(d => [d.id, d]));
  const ids = new Set(documents.filter(d => d.id > 0).map(d => String(d.id)));
  for (const doc of documents) {
    let cmo;
    try { cmo = parse(doc); } catch (_) { cmo = {}; }
    if (doc.id > 0) {
      const saved = doc.canvasSource;
      const n = saved ? clone(saved) : { type: 'text', text: doc.title || '' };
      Object.assign(n, { id: String(doc.id), x: Math.round(doc.x0 || 0), y: Math.round(doc.y0 || 0),
        width: Math.max(1, Math.round((doc.x1 - doc.x0) || 160)), height: Math.max(1, Math.round((doc.y1 - doc.y0) || 80)) });
      const nativeColor = color(cmo.style && cmo.style.object && cmo.style.object.color0);
      if (nativeColor) n.color = nativeColor;
      if (!saved) {
        const content = cmo.content || [];
        const text = content.filter(c => c && ['text', 'LateX', 'latex'].includes(c.cat)).map(c => c.cat === 'text' ? (c.info || '') : '$$\n' + (c.info || '') + '\n$$');
        if (text.length) n.text += '\n\n' + text.join('\n\n');
        const file = content.find(c => c && c.cat === 'png' && typeof c.object === 'string' && !c.object.includes('<'));
        const web = (cmo.meta || []).find(m => m && m.type === 'link' && typeof m.path === 'string');
        if (file && !n.text) { n.type = 'file'; n.file = file.object; delete n.text; }
        else if (web && !n.text) { n.type = 'link'; n.url = web.path; delete n.text; }
        else {
          if (file) n.text += '\n\n![](' + file.object + ')';
          if (web) n.text += '\n\n[' + (web.name || web.path) + '](' + web.path + ')';
        }
      }
      nodes.push(n);
    } else if (ids.has(String(cmo.id0)) && ids.has(String(cmo.id1))) {
      const source = byId.get(cmo.id0);
      let link;
      try { link = (parse(source).links || []).find(l => l.id === doc.id); } catch (_) { /* metadata preserved below */ }
      const reverse = link && link.start === false;
      const e = Object.assign({}, doc.canvasSource || {}, { id: String(doc.id), fromNode: String(reverse ? cmo.id1 : cmo.id0),
        toNode: String(reverse ? cmo.id0 : cmo.id1), fromEnd: 'none', toEnd: link && link.start !== undefined ? 'arrow' : 'none' });
      if (doc.canvasSource) { e.fromEnd = doc.canvasSource.fromEnd || 'none'; e.toEnd = doc.canvasSource.toEnd || 'arrow'; }
      if (color(cmo.color0)) e.color = cmo.color0;
      if (doc.title) e.label = doc.title;
      edges.push(e);
    }
  }
  const canvas = { nodes, edges };
  canvas[NS] = { version: 1, projectionHash: digest(canvas), documents: clone(documents) };
  return canvas;
}

function importCanvas(canvas, firstId = 1, occupiedIds = []) {
  validate(canvas);
  if (canvas[NS]) {
    const native = canvas[NS];
    if (native.version !== 1) throw new Error('Unsupported CogniMap metadata version');
    validateNative(native.documents);
    if (native.projectionHash !== digest(canvas)) throw new Error('Canvas projection was edited; remove org.cognimap metadata to import edited cards as new content, or restore the original export for lossless recovery');
    return clone(native.documents);
  }
  const docs = [], ids = new Map();
  let next = firstId;
  const occupied = new Set(occupiedIds);
  const allocate = negative => {
    while (occupied.has(negative ? -next : next)) next++;
    if (!Number.isSafeInteger(next)) throw new Error('Cannot allocate a safe new node ID');
    const id = negative ? -next++ : next++;
    occupied.add(id);
    return id;
  };
  const palette = { '1': '#ef4444', '2': '#f97316', '3': '#eab308', '4': '#22c55e', '5': '#06b6d4', '6': '#a855f7' };
  for (const n of canvas.nodes || []) {
    const id = allocate(false);
    ids.set(n.id, id);
    const title = n.text || n.label || n.file || n.url || 'Group';
    const cmo = { content: [], meta: [], links: [], style: {
      title: { size: 14, font: 'sans-serif', color: '#20242c', deco: '', class_array: [] },
      object: { color0: palette[n.color] || color(n.color) || '#ffffff', color1: '#64748b', trans: 1, weight: 1, str: '', num_array: [], class_array: [] }
    } };
    if (n.type === 'file' || n.type === 'link') cmo.meta.push({ type: n.type === 'link' ? 'link' : /\.pdf$/i.test(n.file) ? 'pdf' : /\.(png|jpe?g|svg|gif|webp)$/i.test(n.file) ? 'picture' : /\.(mp3|wav|ogg)$/i.test(n.file) ? 'audio' : /\.(mp4|webm)$/i.test(n.file) ? 'videos' : 'txt', path: n.file || n.url, name: title });
    docs.push({ id, title, types: ['a', 'a', 'b'], coor: { x: n.x, y: n.y }, x0: n.x, y0: n.y, x1: n.x + n.width, y1: n.y + n.height,
      cat: [], prio: 1, cdate: 0, vdate: 0, state: '', prep: '', prep1: '', cmobject: cmo, canvasSource: clone(n) });
  }
  const byId = new Map(docs.map(d => [d.id, d]));
  for (const e of canvas.edges || []) {
    const id = allocate(true), id0 = ids.get(e.fromNode), id1 = ids.get(e.toNode);
    const a = byId.get(id0), b = byId.get(id1);
    a.cmobject.links.push({ id, targetId: id1, title: e.label || '', weight: 1, con: '', start: true });
    b.cmobject.links.push({ id, targetId: id0, title: e.label || '', weight: 1, con: '', start: false });
    docs.push({ id, title: e.label || '', types: ['l', 'c', '0'], coor: clone(a.coor), x0: a.x0, y0: a.y0, x1: b.x0, y1: b.y0,
      cat: [], prio: 1, cdate: 0, vdate: 0, state: '', prep: '', prep1: '', canvasSource: clone(e),
      cmobject: { id0, id1, color0: palette[e.color] || color(e.color) || '#64748b', color1: '#64748b', size0: 1, size1: 2, trans: 1, end: e.toEnd === 'none' ? '' : 'arrow', property: [], str: '', numArray: [] } });
  }
  for (const doc of docs) doc.cmobject = JSON.stringify(doc.cmobject);
  return docs;
}
module.exports = { exportCanvas, importCanvas, validate };
