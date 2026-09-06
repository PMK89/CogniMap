'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../../src/app/graph3d/graph3d-core');

/** minimal legacy-doc factory */
const node = (id, x, y, links) => ({
  id,
  coor: { x, y },
  cmobject: JSON.stringify({ links: links || [], content: [], meta: [], style: {} }),
});
const link = (from, to, opts) => Object.assign({
  id: -Number(String(from) + String(to)),
  targetId: to,
  weight: 1,
  start: true,
  con: 'e',
}, opts || {});

// A: 1 -> 2 -> 3, 1 -> 4, cycle 3 -> 1, weak 4 -> 2; B: disconnected 10 - 11
const FIXTURE = [
  node(1, 0, 0, [link(1, 2), link(1, 4)]),
  // the reciprocal entry carries the SAME link id as the forward entry
  // (this is how the legacy app stores both endpoints of one link)
  node(2, 100, 0, [{ id: -12, targetId: 1, weight: 1, start: false, con: 'e' }, link(2, 3)]),
  node(3, 200, 0, [link(3, 1, { targetId: 1 })]),
  node(4, 0, 100, [link(4, 2, { targetId: 2, weight: 0 })]),
  node(10, 1000, 1000, [link(10, 11)]),
  node(11, 1100, 1000, []),
];

test('buildGraph collects unique edges from node metadata', () => {
  const g = core.buildGraph(FIXTURE);
  assert.equal(g.nodes.size, 6);
  // 1-2, 1-4, 2-3, 3-1, 4-2(weak), 10-11
  assert.equal(g.edges.length, 6);
});

test('connected components are detected and ordered deterministically', () => {
  const g = core.buildGraph(FIXTURE);
  const comps = core.connectedComponents(g);
  assert.equal(comps.length, 2);
  assert.deepEqual(comps[0], [1, 2, 3, 4]);
  assert.deepEqual(comps[1], [10, 11]);
});

test('hierarchy derivation keeps every link and classifies cycles as cross-links', () => {
  const g = core.buildGraph(FIXTURE);
  const h = core.deriveHierarchy(g);
  assert.deepEqual(h.roots.length, 2);
  // node 1 has the highest strong out-degree in component A
  assert.equal(h.roots[0], 1);
  assert.equal(h.depth.get(1), 0);
  assert.equal(h.depth.get(2), 1);
  assert.equal(h.depth.get(3), 2);
  // the cycle-closing edge 3 -> 1 must be a cross-link
  const back = g.edges.find((e) => e.source === 3 && e.target === 1);
  assert.equal(back.cross, true);
  // the weak edge is always a cross-link
  const weak = g.edges.find((e) => e.weight === 0);
  assert.equal(weak.cross, true);
  // tree edges are structural
  const tree = g.edges.find((e) => e.source === 1 && e.target === 2);
  assert.equal(tree.structural, true);
  // no edge lost
  assert.equal(g.edges.length, 6);
});

test('every layout preset is deterministic and covers all nodes', () => {
  for (const preset of core.LAYOUT_PRESETS) {
    const a = core.computeLayout(FIXTURE, preset);
    const b = core.computeLayout(FIXTURE, preset);
    assert.equal(a.positions.size, 6, preset);
    for (const [id, p] of a.positions) {
      const q = b.positions.get(id);
      assert.ok(Math.abs(p.x - q.x) < 1e-9 && Math.abs(p.y - q.y) < 1e-9 && Math.abs(p.z - q.z) < 1e-9,
        `${preset} not deterministic for node ${id}`);
      assert.ok(isFinite(p.x) && isFinite(p.y) && isFinite(p.z), `${preset} produced non-finite position`);
    }
  }
});

test('legacy planar preset preserves 2D arrangement on one plane', () => {
  const { positions } = core.computeLayout(FIXTURE, 'legacy-planar');
  for (const [, p] of positions) assert.equal(p.y, 0);
  const p1 = positions.get(1);
  const p2 = positions.get(2);
  assert.ok(p2.x > p1.x, 'x order preserved');
});

test('manual position overrides win', () => {
  const { positions } = core.computeLayout(FIXTURE, 'spherical', { 3: { x: 1, y: 2, z: 3 } });
  assert.deepEqual(positions.get(3), { x: 1, y: 2, z: 3 });
});

test('disconnected components stay separated', () => {
  const { positions } = core.computeLayout(FIXTURE, 'compact-clusters');
  const a = positions.get(1);
  const b = positions.get(10);
  const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  assert.ok(d > 40, 'components too close: ' + d);
});

test('sheetSize preserves the 2D aspect ratio even when clamped', () => {
  // a big diagram: 600 x 300 px
  const big = core.sheetSize({ x0: 0, x1: 600, y0: 0, y1: 300 });
  assert.ok(Math.abs(big.w / big.h - 2) < 0.01, 'aspect preserved: ' + (big.w / big.h));
  assert.ok(Math.max(big.w, big.h) <= 36.01, 'clamped uniformly');
  // a small note: 100 x 26 px
  const small = core.sheetSize({ x0: 0, x1: 100, y0: 0, y1: 26 });
  assert.ok(big.w > small.w * 2.5, 'big diagrams stay visibly larger than notes');
});

test('size-aware relaxation gives large sheets more room than small ones', () => {
  const mk = () => new Map([[1, { x: 0, y: 0, z: 0 }], [2, { x: 1, y: 0, z: 0 }]]);
  const small = mk();
  core.relaxCollisions(small, 10, 4, new Map([[1, 4], [2, 4]]));
  const big = mk();
  core.relaxCollisions(big, 10, 4, new Map([[1, 20], [2, 20]]));
  const dist = (m) => {
    const a = m.get(1); const b = m.get(2);
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  };
  assert.ok(dist(small) >= 7.9, 'small pair separated: ' + dist(small));
  assert.ok(dist(big) >= 30, 'big pair claims more space: ' + dist(big));
  assert.ok(dist(big) > dist(small) * 2, 'radius drives the spacing');
});

test('collision relaxation separates identical positions deterministically', () => {
  const pos = new Map([[1, { x: 0, y: 0, z: 0 }], [2, { x: 0, y: 0, z: 0 }]]);
  core.relaxCollisions(pos, 10, 4);
  const a = pos.get(1);
  const b = pos.get(2);
  const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  assert.ok(d > 4, 'not separated: ' + d);
  // determinism
  const pos2 = new Map([[1, { x: 0, y: 0, z: 0 }], [2, { x: 0, y: 0, z: 0 }]]);
  core.relaxCollisions(pos2, 10, 4);
  assert.deepEqual(pos.get(1), pos2.get(1));
});

test('incremental insertion: adding a node keeps existing tree positions stable', () => {
  const before = core.computeLayout(FIXTURE, 'layered-depth').positions;
  const extended = FIXTURE.concat([node(12, 1200, 1000, [])]);
  // give node 11 a link to the new node
  const after = core.computeLayout(extended, 'layered-depth').positions;
  // all previously existing nodes keep their positions (layered-depth is
  // anchored to persisted 2D coordinates, so insertion is local)
  for (const id of [1, 2, 3, 4, 10]) {
    const a = before.get(id);
    const b = after.get(id);
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 7, 'node ' + id + ' moved');
  }
});

test('overlay elements (quiz covers, markings) are excluded from the 3D graph', () => {
  const cover = node(20, 100, 0, [{ id: 0, targetId: 2, weight: -1, con: 'e', start: false }]);
  cover.types = ['q', 'a', 'b'];
  const mark = node(21, 0, 0, [{ id: 0, targetId: 1, weight: -1, con: 'e', start: false }]);
  mark.types = ['m'];
  // the covered node carries the reciprocal pseudo-link
  const covered = node(2, 100, 0, [
    { id: -12, targetId: 1, weight: 1, start: false, con: 'e' },
    link(2, 3),
    { id: 0, targetId: 20, weight: -1, con: 'e', start: true },
  ]);
  const docs = FIXTURE.map((d) => (d.id === 2 ? covered : d)).concat([cover, mark]);
  const g = core.buildGraph(docs);
  // overlays are not nodes and their pseudo-links are not edges
  assert.equal(g.nodes.has(20), false);
  assert.equal(g.nodes.has(21), false);
  assert.equal(g.nodes.size, 6);
  assert.equal(g.edges.length, 6);
  assert.ok(g.edges.every((e) => e.linkId !== 0), 'no pseudo id-0 edges');
  // layouts still cover exactly the real nodes
  const { positions } = core.computeLayout(docs, 'cognitive-tree');
  assert.equal(positions.size, 6);
});

test('2d-parity is the default-listed preset and reproduces 2D coordinates EXACTLY', () => {
  assert.equal(core.LAYOUT_PRESETS[0], '2d-parity');
  assert.deepEqual(core.LAYOUT_PRESETS, ['2d-parity', 'layered-2.5d', 'cognitive-tree', 'root-network', 'force-3d']);
  const { positions } = core.computeLayout(FIXTURE, '2d-parity');
  for (const d of FIXTURE) {
    const p = positions.get(d.id);
    // exact normalized coordinates — no relaxation, no synthetic layout
    assert.equal(p.x, d.coor.x * core.SCALE, 'x parity for ' + d.id);
    assert.equal(p.z, d.coor.y * core.SCALE, 'z parity for ' + d.id);
    assert.equal(p.y, 0, 'flat plane for ' + d.id);
  }
});

test('layered-2.5d keeps exact X/Z parity and lifts by hierarchy depth only', () => {
  const { positions, hierarchy } = core.computeLayout(FIXTURE, 'layered-2.5d');
  for (const d of FIXTURE) {
    const p = positions.get(d.id);
    assert.equal(p.x, d.coor.x * core.SCALE, 'x parity for ' + d.id);
    assert.equal(p.z, d.coor.y * core.SCALE, 'z parity for ' + d.id);
    assert.equal(p.y, -(hierarchy.depth.get(d.id) || 0) * 14, 'depth-only Z for ' + d.id);
  }
});

test('legacy saved presets still resolve (spherical, layered-depth, ...)', () => {
  for (const legacy of ['legacy-planar', 'layered-depth', 'radial-tree', 'spherical', 'organic', 'compact-clusters']) {
    const { positions } = core.computeLayout(FIXTURE, legacy);
    assert.equal(positions.size, 6, legacy + ' resolves');
  }
});

test('cognitive-tree anchors roots to real 2D centers and preserves bearings', () => {
  const { positions, hierarchy, graph } = core.computeLayout(FIXTURE, 'cognitive-tree');
  // root of component A is node 1
  const root = hierarchy.roots[0];
  assert.equal(root, 1);
  const rp = positions.get(root);
  // component A nodes are around x 0..200, y 0..100 (2D) -> scaled center
  assert.ok(Math.abs(rp.x - (75 * core.SCALE)) < 40, 'root x near 2D center');
  // near height 0 (collision relaxation may nudge it slightly)
  assert.ok(Math.abs(rp.y) < 8, 'root near height 0: ' + rp.y);
  // bearing preservation: node 2 lies east of node 1 in 2D -> stays east in 3D
  const p2 = positions.get(2);
  assert.ok(p2.x > rp.x, 'child keeps its real-world direction from the parent');
  // children of the same parent are separated
  const p4 = positions.get(4);
  const d = Math.hypot(p2.x - p4.x, p2.y - p4.y, p2.z - p4.z);
  assert.ok(d > 5, 'siblings separated: ' + d);
});

test('cognitive-tree keeps disconnected components apart and covers all nodes', () => {
  const { positions } = core.computeLayout(FIXTURE, 'cognitive-tree');
  assert.equal(positions.size, 6);
  const a = positions.get(1);
  const b = positions.get(10);
  assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) > 15, 'components separated');
});
