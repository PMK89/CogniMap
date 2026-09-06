'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');
test('restart resumes remaining queue and progress without rescheduling unanswered covers', async () => {
  const dir = makeTmpDataDir(); let server = await startServer(dir), url = baseUrl(server);
  const post = (route, body) => fetch(url + route, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
  try {
    const loaded = await post('/api/quiz/load', {});
    const answered = await post('/api/quiz/answer', { id: loaded.quizes[0].id, scale: 5 });
    const remaining = answered.quizes.map(q => q.id);
    await new Promise(resolve => server.close(resolve));
    server = await startServer(dir); url = baseUrl(server);
    const resumed = await post('/api/quiz/load', { resume: true });
    assert.deepEqual(resumed.quizes.map(q => q.id), remaining);
    assert.equal(resumed.progress.reviewed, 1);
    assert.equal(resumed.progress.resumed, true);
    assert.ok(resumed.quizes.every(q => q.types[0] === 'q1'));
  } finally { server.close(); }
});
