'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');

let server;
let url;
let dataDir;

test.before(async () => {
  dataDir = makeTmpDataDir();
  server = await startServer(dataDir);
  url = baseUrl(server);
});

test.after(() => {
  server.close();
});

test('GET /api/settings/:id returns the settings doc', async () => {
  const res = await fetch(`${url}/api/settings/1`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.id, 1);
  assert.equal(body.mode, 'view');
  assert.ok(body.cmap);
  assert.ok(body.coor);
});

test('GET /api/settings/:id 400 on non-integer id', async () => {
  const res = await fetch(`${url}/api/settings/abc`);
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'bad_request');
});

test('PUT /api/settings without id returns structured 400', async () => {
  const res = await fetch(`${url}/api/settings`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: 'view' }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'bad_request');
  assert.ok(body.error.message);
});

test('PUT /api/settings normalizes a non view/quizing mode to edit', async () => {
  const res = await fetch(`${url}/api/settings`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 1, mode: 'something-else' }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.mode, 'edit');
});

test('PUT /api/settings preserves view and quizing modes', async () => {
  let res = await fetch(`${url}/api/settings`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 1, mode: 'view' }),
  });
  assert.equal((await res.json()).mode, 'view');

  res = await fetch(`${url}/api/settings`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 1, mode: 'quizing' }),
  });
  assert.equal((await res.json()).mode, 'quizing');
});

test('PUT /api/settings creates a backup file', async () => {
  const backupDir = path.join(dataDir, 'backups');
  await fetch(`${url}/api/settings`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 1, mode: 'view' }),
  });
  assert.ok(fs.existsSync(backupDir));
  const files = fs.readdirSync(backupDir).filter((f) => f.startsWith('settings.json.'));
  assert.ok(files.length > 0);
});

test('GET /api/colors returns fixture colors', async () => {
  const res = await fetch(`${url}/api/colors`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.ok(body.length >= 2);
});

test('POST /api/colors assigns maxid + 1', async () => {
  const before = await (await fetch(`${url}/api/colors`)).json();
  const maxid = Math.max(...before.map((c) => c.id));
  const res = await fetch(`${url}/api/colors`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cat: 'tbobject0', name: 'new', colors: ['#000000'] }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  const added = body.find((c) => c.name === 'new');
  assert.ok(added);
  assert.equal(added.id, maxid + 1);
});

test('GET /api/buttons returns fixture buttons', async () => {
  const res = await fetch(`${url}/api/buttons`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.ok(body.length >= 2);
});

test('GET /api/templates returns fixture templates', async () => {
  const res = await fetch(`${url}/api/templates`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body));
  assert.ok(body.length >= 2);
});

test('POST /api/templates duplicate id returns 409', async () => {
  const templates = await (await fetch(`${url}/api/templates`)).json();
  const existingId = templates[0].id;
  const res = await fetch(`${url}/api/templates`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: existingId, name: 'dup' }),
  });
  assert.equal(res.status, 409);
  const body = await res.json();
  assert.equal(body.error.code, 'conflict');
});

test('POST /api/templates with a new id succeeds', async () => {
  const res = await fetch(`${url}/api/templates`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 999999, name: 'brand-new' }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'saved');
});

test('GET /api/spechars returns fixture categories', async () => {
  const res = await fetch(`${url}/api/spechars`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(typeof body, 'object');
  assert.ok(Object.keys(body).length >= 2);
});

test('PUT /api/spechars replaces the document', async () => {
  const replacement = { custom: { chars0: ['a', 'b'] } };
  const res = await fetch(`${url}/api/spechars`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(replacement),
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'changeSpeChars' });

  const after = await (await fetch(`${url}/api/spechars`)).json();
  assert.deepEqual(after, replacement);
});
