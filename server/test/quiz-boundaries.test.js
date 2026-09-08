'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');

const post = (url, route, body) => fetch(url + route, { method: 'POST',
  headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const schedulesOf = dir => JSON.parse(fs.readFileSync(path.join(dir, 'quizes.json'), 'utf8'));

test('historical schedules without categories still start a session', async () => {
  const dir = makeTmpDataDir();
  const file = path.join(dir, 'quizes.json');
  const schedules = schedulesOf(dir);
  delete schedules[0].cat;   // written before categories existed
  schedules[1].cat = null;   // and one stored as null
  fs.writeFileSync(file, JSON.stringify(schedules));
  const server = await startServer(dir, { dataDir: dir });
  const url = baseUrl(server);
  try {
    const loaded = await post(url, '/api/quiz/load', {});
    assert.equal(loaded.status, 200);
    const body = await loaded.json();
    assert.equal(body.quizes.length, schedules.length);
    assert.ok(body.catlist.every(cat => Array.isArray(cat) && cat.length >= 3));
    // A category filter must not throw on those records either.
    const filtered = await post(url, '/api/quiz/bycat', { params: [true, 'Chemie'] });
    assert.equal(filtered.status, 200);
    assert.ok((await filtered.json()).quizes.every(d => d.types[0] === 'q1'));
  } finally { server.close(); }
});

test('an expired checkpoint falls back to a fresh session instead of resuming', async () => {
  const dir = makeTmpDataDir();
  let server = await startServer(dir, { dataDir: dir });
  let url = baseUrl(server);
  try {
    const loaded = await (await post(url, '/api/quiz/load', {})).json();
    await post(url, '/api/quiz/answer', { id: loaded.quizes[0].id, scale: 5 });
    await new Promise(resolve => server.close(resolve));
    // Backdate the checkpoint: the session belongs to a day that has passed.
    const file = path.join(dir, 'quiz-session.json');
    const state = JSON.parse(fs.readFileSync(file, 'utf8'));
    fs.writeFileSync(file, JSON.stringify({ ...state, day: state.day - 1 }));
    server = await startServer(dir, { dataDir: dir }); url = baseUrl(server);
    const resumed = await (await post(url, '/api/quiz/load', { resume: true })).json();
    assert.equal(resumed.progress.resumed, false);
    assert.equal(resumed.progress.reviewed, 0);
    // The cover rated yesterday is no longer due, so it is not queued again.
    assert.equal(resumed.quizes.some(q => q.id === loaded.quizes[0].id), false);
  } finally { server.close(); }
});

test('a restart after undo resumes the restored cover and progress', async () => {
  const dir = makeTmpDataDir();
  let server = await startServer(dir, { dataDir: dir });
  let url = baseUrl(server);
  try {
    const loaded = await (await post(url, '/api/quiz/load', {})).json();
    const target = loaded.quizes[0];
    await post(url, '/api/quiz/answer', { id: target.id, scale: 5 });
    assert.equal((await post(url, '/api/quiz/undo', {})).status, 200);
    const schedules = schedulesOf(dir);
    await new Promise(resolve => server.close(resolve));
    server = await startServer(dir, { dataDir: dir }); url = baseUrl(server);
    const resumed = await (await post(url, '/api/quiz/load', { resume: true })).json();
    assert.equal(resumed.progress.resumed, true);
    assert.equal(resumed.progress.reviewed, 0);
    assert.ok(resumed.quizes.some(q => q.id === target.id));
    assert.ok(resumed.quizes.every(q => q.types[0] === 'q1'));
    // Undo persisted the restored schedule, so the restart sees it unchanged.
    assert.deepEqual(schedulesOf(dir), schedules);
  } finally { server.close(); }
});
