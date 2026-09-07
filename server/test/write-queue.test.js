'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');
let server, url;
test.before(async () => { server = await startServer(makeTmpDataDir()); url = baseUrl(server); });
test.after(() => server.close());

test('a paused large write response does not block the next persisted operation', async () => {
  const doc = await (await fetch(url + '/api/cme/id/37513')).json();
  doc.prep = 'x'.repeat(8 * 1024 * 1024);
  const body = JSON.stringify(doc);
  let request, response;
  try {
    response = await new Promise((resolve, reject) => {
      request = http.request(url + '/api/cme', { method: 'PUT', headers: {
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
      } }, resolve);
      request.on('error', reject);
      request.end(body);
    });
    response.pause();
    assert.equal(response.statusCode, 200);
    const next = await fetch(url + '/api/quiz/load', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(next.status, 200);
    assert.ok(Array.isArray((await next.json()).quizes));
  } finally {
    if (response) response.destroy();
    if (request) request.destroy();
  }
});
