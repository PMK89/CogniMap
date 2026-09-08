'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');
let server, url;
test.before(async () => { server = await startServer(makeTmpDataDir()); url = baseUrl(server); });
test.after(() => server.close());
const post = (route, body) => fetch(url + route, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const canvas = { nodes: [{ id: 'new', type: 'text', text: 'Imported test', x: 0, y: 0, width: 100, height: 50 }] };
test('Canvas preview is read-only; insertion requires the exact preview token', async () => {
  const before = await (await fetch(url + '/api/cme/graph')).json();
  const preview = await (await post('/api/canvas/preview', { canvas })).json();
  assert.equal(preview.count, 1);
  assert.equal((await (await fetch(url + '/api/cme/graph')).json()).length, before.length);
  assert.equal((await post('/api/canvas/import', { canvas, token: 'wrong' })).status, 409);
  const imported = await post('/api/canvas/import', { canvas, token: preview.token });
  assert.equal(imported.status, 201);
  assert.equal((await (await fetch(url + '/api/cme/graph')).json()).length, before.length + 1);
});
test('lossless exports cannot overwrite existing IDs', async () => {
  const exported = await (await fetch(url + '/api/canvas/export')).json();
  const preview = await (await post('/api/canvas/preview', { canvas: exported })).json();
  assert.ok(preview.conflicts.length > 0);
  assert.equal((await post('/api/canvas/import', { canvas: exported, token: preview.token })).status, 409);
});

test('native imports preserve NeDB identity and preview internal-ID collisions', async () => {
  const { exportCanvas } = require('../lib/interchange/json-canvas');
  const existing = (await (await fetch(url + '/api/cme/graph')).json())[0];
  const conflicting = exportCanvas([{ ...existing, id: 800000001 }]);
  const conflict = await (await post('/api/canvas/preview', { canvas: conflicting })).json();
  assert.deepEqual(conflict.conflicts, [800000001]);
  const native = { ...existing, id: 800000002, _id: 'canvas-preserved-identity' };
  const exported = exportCanvas([native]);
  const preview = await (await post('/api/canvas/preview', { canvas: exported })).json();
  assert.equal((await post('/api/canvas/import', { canvas: exported, token: preview.token })).status, 201);
  const restored = await (await fetch(url + '/api/cme/id/800000002')).json();
  assert.equal(restored._id, native._id);
});

test('duplicate imported schedules are rejected before inserting documents', async () => {
  const { exportCanvas } = require('../lib/interchange/json-canvas');
  const existing = (await (await fetch(url + '/api/cme/graph')).json())[0];
  const native = { ...existing, id: 800000003, _id: 'canvas-duplicate-schedule' };
  const exported = exportCanvas([native]);
  const schedule = { id: native.id, update: 20000, difficulty: 2.5, interval: 7 };
  exported['org.cognimap'].quizes = [schedule, { ...schedule }];
  const preview = await (await post('/api/canvas/preview', { canvas: exported })).json();
  assert.equal((await post('/api/canvas/import', { canvas: exported, token: preview.token })).status, 400);
  // A rejected import writes nothing, so it must not block the map either.
  const graph = await fetch(url + '/api/cme/graph');
  assert.equal(graph.status, 200);
  assert.equal((await graph.json()).some(d => d.id === native.id), false);
});
