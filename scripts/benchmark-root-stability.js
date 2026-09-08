'use strict';

const core = require('../src/app/graph3d/graph3d-core');

function tree(n, chain) {
  const docs = Array.from({ length: n }, (_, i) => ({
    id: i + 1, title: 'node', types: ['a'], coor: { x: i * 20, y: 0 },
    x0: i * 20, x1: i * 20 + 80, y0: 0, y1: 40, cmobject: { links: [] },
  }));
  for (let i = 1; i < n; i++) {
    const p = chain ? i - 1 : Math.floor((i - 1) / 5);
    docs[p].cmobject.links.push({ id: -i, targetId: i + 1, start: true, weight: 1 });
  }
  return docs;
}

function timed(docs) {
  const start = process.hrtime.bigint();
  const result = core.computeLayout(docs, 'root-network');
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  return { result, ms };
}

function displacement(a, b) {
  const values = [];
  for (const [id, p] of a.positions) {
    const q = b.positions.get(id);
    if (!q) continue;
    values.push(Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z));
  }
  values.sort((x, y) => x - y);
  const percentile = (p) => values.length ? values[Math.min(values.length - 1, Math.floor(values.length * p))] : 0;
  return { shared: values.length, median: percentile(.5), p95: percentile(.95), max: values.length ? values[values.length - 1] : 0 };
}

function parentChanges(a, b) {
  let changed = 0;
  for (const [id, parent] of a.hierarchy.parentOf) if (b.hierarchy.parentOf.get(id) !== parent) changed++;
  return changed;
}

function scenario(name, baseDocs, base, mutate) {
  const changedDocs = baseDocs.map((d) => ({ ...d, cmobject: { ...d.cmobject, links: (d.cmobject.links || []).map((l) => ({ ...l })) } }));
  const mutation = mutate(changedDocs) || {};
  const changed = timed(changedDocs);
  const addedEdge = mutation.linkId === undefined ? undefined : changed.result.graph.edges.find((e) => e.linkId === mutation.linkId);
  return {
    name,
    nodes: changed.result.positions.size,
    layoutMs: { baseline: base.ms, changed: changed.ms },
    displacement: displacement(base.result, changed.result),
    hierarchyParentChanges: parentChanges(base.result, changed.result),
    structuralEdges: changed.result.graph.edges.filter((e) => e.structural).length,
    crossEdges: changed.result.graph.edges.filter((e) => e.cross).length,
    mutation,
    addedEdge: addedEdge && { linkId: addedEdge.linkId, source: addedEdge.source, target: addedEdge.target, weight: addedEdge.weight, cross: addedEdge.cross, structural: addedEdge.structural },
  };
}

function main() {
  const args = process.argv.slice(2);
  const flag = args.findIndex((x) => x === '--nodes');
  const arg = args.find((x) => /^--nodes=/.test(x));
  const raw = arg ? arg.slice('--nodes='.length) : (flag >= 0 ? args[flag + 1] : '2000');
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 20 || n > 50000) throw new Error('--nodes must be an integer from 20 through 50000');
  const baseDocs = tree(n);
  const baseline = timed(baseDocs);
  const reversed = timed(baseDocs.slice().reverse());
  const permutation = displacement(baseline.result, reversed.result);
  const permutationEqual = permutation.shared === n && permutation.median === 0 && permutation.p95 === 0 && permutation.max === 0;
  if (!permutationEqual) throw new Error('reversed input changed root-network positions');
  const leaves = [];
  for (const [id, kids] of baseline.result.hierarchy.childrenOf) if (!kids.length) leaves.push(id);
  const branchOf = (id) => {
    let cur = id;
    while (baseline.result.hierarchy.parentOf.has(cur)) {
      const parent = baseline.result.hierarchy.parentOf.get(cur);
      if (baseline.result.hierarchy.roots.includes(parent)) return cur;
      cur = parent;
    }
    return cur;
  };
  const firstLeaf = leaves[0];
  const secondLeaf = leaves.find((id) => branchOf(id) !== branchOf(firstLeaf));
  if (secondLeaf === undefined) throw new Error('fixture did not produce leaves in distinct root branches');
  const semanticCrossLink = scenario('add-semantic-cross-link', baseDocs, baseline, (docs) => {
    docs[firstLeaf - 1].cmobject.links.push({ id: -9000001, targetId: secondLeaf, start: true, weight: 0 });
    return { linkId: -9000001, source: firstLeaf, target: secondLeaf, weight: 0 };
  });
  semanticCrossLink.addedLinkClassification = semanticCrossLink.crossEdges > baseline.result.graph.edges.filter((e) => e.cross).length ? 'cross' : 'unchanged';
  if (!semanticCrossLink.addedEdge || !semanticCrossLink.addedEdge.cross || semanticCrossLink.addedEdge.structural || semanticCrossLink.addedEdge.weight !== 0) throw new Error('semantic cross-link was not classified exactly');
  if (semanticCrossLink.hierarchyParentChanges !== 0) throw new Error('semantic cross-link changed hierarchy parents');
  const addLeaf = scenario('add-leaf', baseDocs, baseline, (docs) => {
    const id = n + 1;
    docs.push({ id, title: 'leaf', types: ['a'], cmobject: { links: [] } });
    docs[n - 1].cmobject.links.push({ id: -id, targetId: id, start: true, weight: 1 });
  });
  const disconnected = scenario('add-disconnected-component', baseDocs, baseline, (docs) => {
    docs.push({ id: n + 1, title: 'component', types: ['a'], cmobject: { links: [{ id: -8000001, targetId: n + 2, start: true, weight: 1 }] } });
    docs.push({ id: n + 2, title: 'component', types: ['a'], cmobject: { links: [] } });
  });
  process.stdout.write(JSON.stringify({ nodes: n, baselineLayoutMs: baseline.ms, permutation, permutationEqual, scenarios: [addLeaf, semanticCrossLink, disconnected] }) + '\n');
}

main();
