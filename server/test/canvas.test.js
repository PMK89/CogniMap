'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { exportCanvas, importCanvas } = require('../lib/interchange/json-canvas');
const docs = fs.readFileSync(path.join(__dirname, 'fixtures/data/cme.db'), 'utf8').trim().split('\n').map(JSON.parse);

test('historical scientific documents round-trip exactly, including overlays and connector metadata', () => {
  const original = JSON.stringify(docs);
  const canvas = exportCanvas(docs);
  assert.ok(canvas.nodes.length > 0);
  assert.deepEqual(importCanvas(JSON.parse(JSON.stringify(canvas))), docs);
  assert.equal(JSON.stringify(docs), original);
});

test('plain Canvas imports all card types and directed edges without losing extension fields', () => {
  const canvas = { nodes: [
    { id: 'text', type: 'text', text: '$E=mc^2$', x: 10, y: 20, width: 100, height: 50, custom: { a: 1 } },
    { id: 'file', type: 'file', file: 'media/molecule.svg', x: 200, y: 20, width: 80, height: 80 },
    { id: 'link', type: 'link', url: 'https://example.org', x: 400, y: 20, width: 80, height: 80 },
    { id: 'group', type: 'group', label: 'STEM', x: 0, y: 0, width: 600, height: 200 },
  ], edges: [{ id: 'edge', fromNode: 'text', toNode: 'file', label: 'explains', fromEnd: 'none', toEnd: 'arrow' }] };
  const native = importCanvas(canvas);
  assert.equal(native.length, 5);
  assert.deepEqual(exportCanvas(native).nodes.map(n => n.type), ['text', 'file', 'link', 'group']);
  assert.deepEqual(exportCanvas(native).nodes[0].custom, { a: 1 });
  assert.equal(JSON.parse(native[0].cmobject).links[0].targetId, native[1].id);
});

test('invalid Canvas rejects duplicate IDs, dangling edges and non-finite geometry', () => {
  const node = { id: 'a', type: 'text', text: '', x: 0, y: 0, width: 10, height: 10 };
  assert.throws(() => importCanvas({ nodes: [node, node] }), /duplicate/i);
  assert.throws(() => importCanvas({ nodes: [node], edges: [{ id: 'x', fromNode: 'a', toNode: 'missing' }] }), /endpoint/i);
  assert.throws(() => importCanvas({ nodes: [{ ...node, x: Infinity }] }), /geometry/i);
});

test('native metadata with duplicate IDs or an unsupported version is rejected', () => {
  const canvas = exportCanvas(docs);
  canvas['org.cognimap'].version = 99;
  assert.throws(() => importCanvas(canvas), /version/i);
});

test('file and web references project as Canvas files and links', () => {
  const base = { id: 1, title: '', x0: 0, y0: 0, x1: 100, y1: 80 };
  const canvas = exportCanvas([
    { ...base, cmobject: JSON.stringify({ content: [{ cat: 'png', object: 'media/structure.png' }] }) },
    { ...base, id: 2, cmobject: JSON.stringify({ meta: [{ type: 'link', path: 'https://example.org', name: 'Reference' }] }) }
  ]);
  assert.equal(canvas.nodes[0].type, 'file');
  assert.equal(canvas.nodes[0].file, 'media/structure.png');
  assert.equal(canvas.nodes[1].type, 'link');
});

test('plain Canvas preserves arrows at both endpoints on re-export', () => {
  const node = id => ({ id, type: 'text', text: id, x: 0, y: 0, width: 100, height: 80 });
  const source = { nodes: [node('a'), node('b')], edges: [{ id: 'e', fromNode: 'a', toNode: 'b', fromEnd: 'arrow', toEnd: 'none' }] };
  const edge = exportCanvas(importCanvas(source)).edges[0];
  assert.equal(edge.fromEnd, 'arrow');
  assert.equal(edge.toEnd, 'none');
});

test('mixed text and image cards keep authored text in their interoperable projection', () => {
  const canvas = exportCanvas([{ id: 1, title: 'Important notes', cmobject: { content: [{ cat: 'text', info: 'do not lose' }, { cat: 'png', object: 'media/a.png' }] } }]);
  assert.equal(canvas.nodes[0].type, 'text');
  assert.ok(canvas.nodes[0].text.includes('do not lose'));
  assert.ok(canvas.nodes[0].text.includes('media/a.png'));
});
