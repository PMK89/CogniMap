'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');
test('rating undo preserves a later edit to another quiz schedule', async () => {
  const dir = makeTmpDataDir(), server = await startServer(dir), url = baseUrl(server);
  const post = (route, body) => fetch(url + route, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  try {
    const { quizes } = await (await post('/api/quiz/load', {})).json();
    const first = quizes[0], other = quizes[1];
    await post('/api/quiz/answer', { id: first.id, scale: 5 });
    const cmobject = JSON.parse(other.cmobject);
    cmobject.style.object.weight = 3.5;
    cmobject.style.object.str = '9';
    const updated = { ...other, types: ['q'].concat(other.types.slice(1)), cmobject: JSON.stringify(cmobject) };
    await fetch(url + '/api/cme', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(updated) });
    const before = JSON.parse(fs.readFileSync(path.join(dir, 'quizes.json'), 'utf8')).find(q => q.id === other.id);
    assert.equal(before.interval, 9);
    assert.equal((await post('/api/quiz/undo', {})).status, 200);
    const after = JSON.parse(fs.readFileSync(path.join(dir, 'quizes.json'), 'utf8')).find(q => q.id === other.id);
    assert.deepEqual(after, before);
  } finally { server.close(); }
});
