'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { QuizManager } = require('../lib/quiz');

function manager(t, entries) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cognimap-schedule-'));
  fs.writeFileSync(path.join(dir, 'quizes.json'), JSON.stringify(entries));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return new QuizManager(dir);
}

test('deleting the last historical quiz persists an empty schedule after restart', t => {
  const m = manager(t, [{ id: 7, interval: 2, difficulty: 2.5, update: 100, cat: [] }]);
  m.deleteQuiz(7);
  const restored = new QuizManager(path.dirname(m.file));
  restored.load();
  assert.deepEqual(restored.quizes, []);
  assert.equal(fs.readdirSync(path.join(path.dirname(m.file), 'backups')).length, 1);
});

test('failed recall without an active queue still produces a finite next due date', t => {
  const m = manager(t, []);
  const result = m.calculate({ id: 7, interval: 2, difficulty: 2.5 }, 1, 100);
  assert.equal(result.update, 101);
  assert.equal(result.interval, 1);
  assert.equal(result.difficulty, 2.5);
});

test('legacy successful recall and in-session retry math remains unchanged', t => {
  const m = manager(t, []);
  const word = { id: 7, interval: 2, difficulty: 2.5 };
  assert.deepEqual(m.calculate(word, 5, 100), { difficulty: 2.6, interval: 3, update: 106, word: 7 });
  m.quizcmes = [{ id: 7 }];
  assert.equal(m.calculate(word, 1, 100).update, 0);
  assert.equal(m.quizcmes.length, 2);
});
