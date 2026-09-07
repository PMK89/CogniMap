'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');
let server, url;
test.before(async () => {
  server = await startServer(makeTmpDataDir(), { bodyLimit: '1kb', canvasBodyLimit: '8kb' });
  url = baseUrl(server);
});
test.after(() => server.close());
test('Canvas has a separate bounded payload budget without enlarging ordinary writes', async () => {
  const body = JSON.stringify({ canvas: { nodes: [{ id: 'a', type: 'text', text: 'x'.repeat(2048), x: 0, y: 0, width: 100, height: 80 }] } });
  const post = (route, payload) => fetch(url + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
  assert.equal((await post('/api/canvas/preview', body)).status, 200);
  assert.equal((await post('/api/cme', body)).status, 413);
  assert.equal((await post('/api/canvas/preview', JSON.stringify({ text: 'x'.repeat(9000) }))).status, 413);
});
