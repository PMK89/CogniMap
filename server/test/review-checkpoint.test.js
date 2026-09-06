'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { ReviewCheckpoint } = require('../lib/review-checkpoint');
test('checkpoint survives restart, expires next day and rejects unknown versions', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cognimap-checkpoint-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  new ReviewCheckpoint(dir).save({ day: 100, ids: [1, 3, 1], reviewed: 2 });
  assert.deepEqual(new ReviewCheckpoint(dir).load(100).ids, [1, 3, 1]);
  assert.equal(new ReviewCheckpoint(dir).load(101), null);
  fs.writeFileSync(path.join(dir, 'quiz-session.json'), JSON.stringify({ version: 99, day: 100, ids: [1], reviewed: 2 }));
  assert.equal(new ReviewCheckpoint(dir).load(100), null);
});
