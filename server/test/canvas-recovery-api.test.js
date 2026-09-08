'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeTmpDataDir, startServer, baseUrl } = require('./helpers');
const { exportCanvas } = require('../lib/interchange/json-canvas');
const { QuizManager } = require('../lib/quiz');

test('failed Canvas schedule persistence blocks graph writes and recovers on restart', async () => {
  const dir = makeTmpDataDir();
  let server = await startServer(dir);
  let url = baseUrl(server);
  const post = (route, body) => fetch(url + route, { method: 'POST',
    headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const originalSave = QuizManager.prototype.save;
  try {
    const baseline = await (await fetch(url + '/api/canvas/export')).json();
    const source = baseline['org.cognimap'].documents.find(d => d.id > 0);
    const document = { ...source, id: 800000123, _id: 'recovery-api-native-id', types: ['q'] };
    const canvas = exportCanvas([document]);
    const schedule = { id: document.id, update: 20000, difficulty: 2.5, interval: 7 };
    canvas['org.cognimap'].quizes = [schedule];
    const preview = await (await post('/api/canvas/preview', { canvas })).json();
    QuizManager.prototype.save = function () { throw new Error('injected schedule write failure'); };
    assert.equal((await post('/api/canvas/import', { canvas, token: preview.token })).status, 500);
    QuizManager.prototype.save = originalSave;
    const blocked = await fetch(url + '/api/cme/graph');
    assert.equal(blocked.status, 503);
    assert.equal((await blocked.json()).error.code, 'import_recovery_required');
    assert.equal((await post('/api/canvas/import', { canvas, token: preview.token })).status, 503);
    assert.ok(fs.existsSync(path.join(dir, 'canvas-import-journal.json')));
    await new Promise(resolve => server.close(resolve));
    server = await startServer(dir); url = baseUrl(server);
    const exported = await (await fetch(url + '/api/canvas/export')).json();
    const documents = exported['org.cognimap'].documents;
    assert.deepEqual(documents.find(d => d.id === document.id), document);
    for (const existing of baseline['org.cognimap'].documents) {
      assert.deepEqual(documents.find(d => d._id === existing._id), existing);
    }
    assert.deepEqual(exported['org.cognimap'].quizes.find(q => q.id === document.id), schedule);
    assert.equal(documents.filter(d => d.id === document.id).length, 1);
    assert.equal(fs.existsSync(path.join(dir, 'canvas-import-journal.json')), false);
  } finally {
    QuizManager.prototype.save = originalSave;
    await new Promise(resolve => server.close(resolve));
  }
});

test('corrupt recovery intent is retained and prevents graph requests at startup', async () => {
  const dir = makeTmpDataDir();
  const file = path.join(dir, 'canvas-import-journal.json');
  fs.writeFileSync(file, '{interrupted invalid JSON');
  const server = await startServer(dir, { dataDir: dir });
  try {
    // Give startup failure time to occur before any request; it must remain handled.
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal((await fetch(baseUrl(server) + '/api/cme/graph')).status, 500);
    assert.equal(fs.readFileSync(file, 'utf8'), '{interrupted invalid JSON');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
