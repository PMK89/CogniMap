'use strict';
// Read-only: decode NeDB append records without opening/compacting the database.
const fs = require('node:fs');
const { performance } = require('node:perf_hooks');
const core = require('../src/app/graph3d/graph3d-core');
const file = process.argv[2];
if (!file) throw new Error('Usage: node scripts/benchmark-root.js /path/to/cme.db');
const records = new Map();
for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const d = JSON.parse(line);
  if (d.$$deleted) records.delete(d._id);
  else if (d._id) records.set(d._id, d);
}
const docs = Array.from(records.values());
console.log('| Layout | Nodes | Edges | Structural | Cross | Milliseconds | Heap delta MiB |');
console.log('|---|---:|---:|---:|---:|---:|---:|');
for (const preset of ['2d-parity', 'cognitive-tree', 'root-network']) {
  if (global.gc) global.gc();
  const heap = process.memoryUsage().heapUsed, start = performance.now();
  const layout = core.computeLayout(docs, preset);
  const ms = performance.now() - start;
  console.log(`| ${preset} | ${layout.positions.size} | ${layout.graph.edges.length} | ${layout.graph.edges.filter(e => !e.cross).length} | ${layout.graph.edges.filter(e => e.cross).length} | ${ms.toFixed(1)} | ${((process.memoryUsage().heapUsed - heap) / 1048576).toFixed(1)} |`);
}
