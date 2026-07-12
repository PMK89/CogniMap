'use strict';

/**
 * Dry-run "migration" for the 3D visualization.
 *
 * The 3D view stores its state in a separate versioned file
 * (data/viz3d.json) and never mutates concept-map data, so no real
 * migration is required. This script reports what the 3D view will do
 * with the current database: node/edge counts, hierarchy shape,
 * structural/cross split and layout timings — without writing anything.
 *
 * Usage: node scripts/migrate3d-dry-run.js [preset]
 */

const path = require('path');
const Datastore = require('@seald-io/nedb');
const core = require('../src/app/graph3d/graph3d-core');

const preset = process.argv[2] || 'layered-depth';
const dataDir = process.env.COGNIMAP_DATA_DIR || path.join(__dirname, '..', 'data');
const db = new Datastore({ filename: path.join(dataDir, 'cme.db'), autoload: true });

db.findAsync({}).then((docs) => {
  console.log('DRY RUN — no files will be written');
  console.log('database:', path.join(dataDir, 'cme.db'), '| documents:', docs.length);
  const graph = core.buildGraph(docs);
  const h = core.deriveHierarchy(graph);
  const cross = graph.edges.filter((e) => e.cross).length;
  console.log('nodes:', graph.nodes.size, '| edges:', graph.edges.length,
    '| structural:', graph.edges.length - cross, '| cross-links:', cross);
  console.log('connected components:', h.components.length);
  let maxDepth = 0;
  h.depth.forEach((d) => { if (d > maxDepth) maxDepth = d; });
  console.log('max hierarchy depth:', maxDepth);
  const t = Date.now();
  const { positions } = core.computeLayout(docs, preset);
  console.log(`layout '${preset}':`, Date.now() - t, 'ms for', positions.size, 'positions');
  console.log('every original link is preserved; hierarchy derivation is deterministic.');
  console.log('to reset the 3D state later: DELETE /api/viz3d (a backup is taken first).');
  process.exit(0);
});
