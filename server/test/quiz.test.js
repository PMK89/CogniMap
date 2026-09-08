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

const json = (method, body) => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

test('POST /api/quiz/load returns catlist/timelist/quizes and marks overdue elements q1', async () => {
  const res = await fetch(`${url}/api/quiz/load`, json('POST', {}));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok('catlist' in body);
  assert.ok('timelist' in body);
  assert.ok('quizes' in body);
  assert.ok(Array.isArray(body.quizes));
  // all 3 fixture quizes.json entries have `update` far in the past
  assert.equal(body.quizes.length, 3);
  for (const q of body.quizes) {
    assert.equal(q.types[0], 'q1');
  }
});

test('POST /api/quiz/answer with scale 5 updates quizes.json and returns remaining quizes', async () => {
  const quizesBefore = JSON.parse(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8'));
  const target = quizesBefore.find((q) => q.id === 12121);

  const loadRes = await fetch(`${url}/api/quiz/load`, json('POST', {}));
  const loaded = await loadRes.json();
  const remainingBefore = loaded.quizes.length;

  const res = await fetch(`${url}/api/quiz/answer`, json('POST', { id: 12121, scale: 5 }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.quizes.length, remainingBefore - 1);
  assert.ok(!body.quizes.some((q) => q.id === 12121));

  const quizesAfter = JSON.parse(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8'));
  const updated = quizesAfter.find((q) => q.id === 12121);
  // SM2-variant math from server/lib/quiz.js calculate(): scale=5 >= 3
  const expectedDifficulty = Math.max(target.difficulty + (0.1 - 0 * (0.08 + 0 * 0.02)), 1.3);
  assert.equal(updated.interval, target.interval + 1);
  assert.ok(Math.abs(updated.difficulty - expectedDifficulty) < 1e-9);
  assert.ok(updated.difficulty > target.difficulty);
});

test('POST /api/quiz/answer with an invalid scale returns 400', async () => {
  const res = await fetch(`${url}/api/quiz/answer`, json('POST', { id: 12122, scale: 7 }));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'bad_request');
});

test('replacing a queue clears covers excluded by the new limit', async () => {
  await fetch(`${url}/api/quiz/load`, json('POST', { limit: 42 }));
  const response = await fetch(`${url}/api/quiz/load`, json('POST', { limit: 1 }));
  const { quizes } = await response.json();
  const graph = await (await fetch(`${url}/api/cme/graph`)).json();
  assert.deepEqual(graph.filter(d => d.types[0] === 'q1').map(d => d.id).sort(), quizes.map(d => d.id).sort());
});

test('empty category results clear the previous session and preserve cover geometry', async () => {
  const loaded = await (await fetch(`${url}/api/quiz/load`, json('POST', {}))).json();
  const before = loaded.quizes.map(d => ({ id: d.id, coor: d.coor, x0: d.x0, y0: d.y0, x1: d.x1, y1: d.y1 }));
  const response = await fetch(`${url}/api/quiz/bycat`, json('POST', { params: [true, 'nonexistent-test-category'] }));
  assert.deepEqual((await response.json()).quizes, []);
  for (const expected of before) {
    const doc = await (await fetch(`${url}/api/cme/id/${expected.id}`)).json();
    assert.equal(doc.types[0], 'q');
    for (const key of Object.keys(expected)) assert.deepEqual(doc[key], expected[key]);
  }
});

test('rating undo restores scheduling and the active cover without changing geometry', async () => {
  const loaded = await (await fetch(`${url}/api/quiz/load`, json('POST', {}))).json();
  const target = loaded.quizes[0];
  const before = JSON.parse(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8'));
  await fetch(`${url}/api/quiz/answer`, json('POST', { id: target.id, scale: 5 }));
  const undone = await fetch(`${url}/api/quiz/undo`, json('POST', {}));
  assert.equal(undone.status, 200);
  assert.ok((await undone.json()).quizes.some(d => d.id === target.id));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8')), before);
  const doc = await (await fetch(`${url}/api/cme/id/${target.id}`)).json();
  assert.equal(doc.types[0], 'q1');
  assert.deepEqual(doc.coor, target.coor);
});

test('a malformed cover cannot partially update its recall schedule', async () => {
  const loaded = await (await fetch(`${url}/api/quiz/load`, json('POST', {}))).json();
  const target = loaded.quizes[0];
  const broken = { ...target, cmobject: '{invalid' };
  await fetch(`${url}/api/cme`, json('PUT', broken));
  await fetch(`${url}/api/quiz/load`, json('POST', {}));
  const before = fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8');
  const response = await fetch(`${url}/api/quiz/answer`, json('POST', { id: target.id, scale: 5 }));
  assert.equal(response.status, 400);
  assert.equal(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8'), before);
});

/** An earlier test deliberately corrupts one cover; never pick that one. */
const healthy = quizes => quizes.find(d => { try { JSON.parse(d.cmobject); return true; } catch (_) { return false; } });

test('rating a cover keeps edits made after the session loaded', async () => {
  const loaded = await (await fetch(`${url}/api/quiz/load`, json('POST', {}))).json();
  const target = healthy(loaded.quizes);
  const edited = { ...target, title: target.title + ' edited during review',
    x0: target.x0 + 4321, x1: target.x1 + 4321, coor: { ...target.coor, x: target.coor.x + 4321 } };
  await fetch(`${url}/api/cme`, json('PUT', edited));
  const before = await (await fetch(`${url}/api/cme/id/${target.id}`)).json();
  assert.equal((await fetch(`${url}/api/quiz/answer`, json('POST', { id: target.id, scale: 5 }))).status, 200);
  const after = await (await fetch(`${url}/api/cme/id/${target.id}`)).json();
  assert.equal(after.title, before.title);
  for (const key of ['coor', 'x0', 'y0', 'x1', 'y1']) assert.deepEqual(after[key], before[key]);
  // Rating still owns the cover state and its scheduling style.
  assert.equal(after.types[0], 'q');
  const schedule = JSON.parse(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8')).find(q => q.id === target.id);
  assert.equal(JSON.parse(after.cmobject).style.object.str, String(schedule.interval));
});

test('rating an element outside the current queue never touches its schedule', async () => {
  await fetch(`${url}/api/quiz/load`, json('POST', { limit: 1 }));
  const { quizes } = await (await fetch(`${url}/api/quiz/load`, json('POST', { limit: 1 }))).json();
  const schedules = JSON.parse(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8'));
  const outside = schedules.find(q => !quizes.some(d => d.id === q.id));
  const before = fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8');
  const response = await fetch(`${url}/api/quiz/answer`, json('POST', { id: outside.id, scale: 5 }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).unchanged, true);
  assert.equal(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8'), before);
});

test('a second rating of the same cover from a stale tab changes nothing', async () => {
  // params[0] forces every cover into the queue regardless of its due date.
  const { quizes } = await (await fetch(`${url}/api/quiz/bycat`, json('POST', { params: [true] }))).json();
  const target = healthy(quizes);
  await fetch(`${url}/api/quiz/answer`, json('POST', { id: target.id, scale: 5 }));
  const before = fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8');
  const response = await fetch(`${url}/api/quiz/answer`, json('POST', { id: target.id, scale: 5 }));
  assert.equal((await response.json()).unchanged, true);
  assert.equal(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8'), before);
});

test('rating a cover deleted during the session changes nothing', async () => {
  const { quizes } = await (await fetch(`${url}/api/quiz/bycat`, json('POST', { params: [true] }))).json();
  const target = healthy(quizes.slice().reverse());
  await fetch(`${url}/api/cme/${target.id}`, { method: 'DELETE' });
  const before = fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8');
  const response = await fetch(`${url}/api/quiz/answer`, json('POST', { id: target.id, scale: 5 }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).unchanged, true);
  assert.equal(fs.readFileSync(path.join(dataDir, 'quizes.json'), 'utf8'), before);
});
