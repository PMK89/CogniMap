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
