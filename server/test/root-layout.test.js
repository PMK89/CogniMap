'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../../src/app/graph3d/graph3d-core');
function tree(n, chain = false) {
  const docs = Array.from({ length: n }, (_, i) => ({ id: i + 1, title: 'node', types: ['a'], coor: { x: i * 20, y: 0 }, x0: i * 20, x1: i * 20 + 80, y0: 0, y1: 40, cmobject: { links: [] } }));
  for (let i = 1; i < n; i++) { const p = chain ? i - 1 : Math.floor((i - 1) / 5); docs[p].cmobject.links.push({ id: -i, targetId: i + 1, start: true, weight: 1 }); }
  return docs;
}
test('root-network is an additional deterministic 3D preset that preserves input', () => {
  assert.ok(core.LAYOUT_PRESETS.includes('root-network'));
  const docs = tree(500), before = JSON.stringify(docs);
  const a = core.computeLayout(docs, 'root-network');
  const b = core.computeLayout(docs.slice().reverse(), 'root-network');
  assert.deepEqual(a.positions, b.positions);
  assert.equal(JSON.stringify(docs), before);
  const points = Array.from(a.positions.values());
  for (const axis of ['x', 'y', 'z']) assert.ok(Math.max(...points.map(p => p[axis])) - Math.min(...points.map(p => p[axis])) > 100);
});
test('deep 41k-node chains do not overflow the stack', () => {
  const { positions } = core.computeLayout(tree(41000, true), 'root-network');
  assert.equal(positions.size, 41000);
  for (const p of positions.values()) assert.ok([p.x, p.y, p.z].every(Number.isFinite));
});
test('adding a leaf preserves distant major branch positions', () => {
  const docs = tree(500);
  const before = core.computeLayout(docs, 'root-network').positions;
  docs.push({ id: 501, types: ['a'], cmobject: { links: [] } });
  docs[499].cmobject.links.push({ id: -501, targetId: 501, start: true, weight: 1 });
  const after = core.computeLayout(docs, 'root-network').positions;
  const a = before.get(2), b = after.get(2);
  assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 10);
});

test('parallel links select one stable structural spanning edge', () => {
  const docs = [
    { id: 1, types: ['a'], cmobject: { links: [
      { id: -10, targetId: 2, start: true, weight: 1 },
      { id: -20, targetId: 2, start: true, weight: 1 },
    ] } },
    { id: 2, types: ['a'], cmobject: { links: [] } },
  ];
  const graph = core.buildGraph(docs);
  core.deriveHierarchy(graph);
  const structural = graph.edges.filter((edge) => edge.structural).map((edge) => edge.linkId);
  const cross = graph.edges.filter((edge) => edge.cross).map((edge) => edge.linkId);
  assert.deepEqual(structural, [-20]);
  assert.deepEqual(cross, [-10]);
});
