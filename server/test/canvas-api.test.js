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
