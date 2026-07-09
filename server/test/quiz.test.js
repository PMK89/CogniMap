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
