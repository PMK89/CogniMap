'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');

let server;
let url;

test.before(async () => {
  const dataDir = makeTmpDataDir();
  server = await startServer(dataDir);
  url = baseUrl(server);
});

test.after(() => {
  server.close();
});

const json = (method, body) => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

test('POST /api/media/mathjax renders an svg for a simple expression', async () => {
  const res = await fetch(`${url}/api/media/mathjax`, json('POST', { tex: 'x^2' }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(typeof body.svg, 'string');
  assert.ok(body.svg.includes('<svg'));
});

test('POST /api/media/mathjax with an invalid payload returns 400', async () => {
  const res = await fetch(`${url}/api/media/mathjax`, json('POST', { tex: 42 }));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'bad_request');
});

test('POST /api/assets/list returns a nested folder listing', async () => {
  const res = await fetch(`${url}/api/assets/list`, json('POST', { prefix: '/src/', folders: ['widgets'] }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.ok(body.length >= 1);
  assert.equal(body[0].name, 'widgets');
  assert.ok('files' in body[0]);
  assert.ok('folders' in body[0]);
});

test('POST /api/db/load blocks path traversal', async () => {
  const res = await fetch(`${url}/api/db/load`, json('POST', { file: '../../etc/passwd' }));
  assert.ok(res.status >= 400 && res.status < 500);
});

test('GET /files/src/.. traversal does not leak files outside the served root', async () => {
  // %2e%2e survives URL normalization (unlike a literal "..", which fetch's
  // URL parser would collapse before the request is even sent), so this
  // actually exercises express.static's own traversal guard.
  const res = await fetch(`${url}/files/src/%2e%2e/%2e%2e/etc/passwd`, { redirect: 'manual' });
  assert.ok(res.status >= 400, `expected a 4xx response, got ${res.status}`);
});

test('media filenames containing cognimap are not mistaken for legacy checkout prefixes', async () => {
  const response = await fetch(`${url}/api/media/open`, json('POST', { type: 'txt', path: '/src/assets/styles/cognimap.css' }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).url, '/files/src/assets/styles/cognimap.css');
});
