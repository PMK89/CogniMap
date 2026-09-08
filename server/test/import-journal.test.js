'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Datastore = require('@seald-io/nedb');
const { ImportJournal } = require('../lib/interchange/import-journal');
const { QuizManager } = require('../lib/quiz');

const JOURNAL = 'canvas-import-journal.json';

/** Disposable data directory: one NeDB file and one quizes.json per test. */
function makeDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cognimap-journal-'));
  fs.writeFileSync(path.join(dir, 'quizes.json'), JSON.stringify([{ id: 5, cat: [], update: 10, difficulty: 2.5, interval: 1 }]));
  return dir;
}
const openDb = dir => new Datastore({ filename: path.join(dir, 'cme.db'), autoload: true });
const quizFor = dir => new QuizManager(dir);
const doc = (id, extra = {}) => ({ id, title: 't' + id, types: ['a', 'a', 'b'], coor: { x: 0, y: 0 },
  x0: 0, y0: 0, x1: 10, y1: 10, cat: [], prio: 1, cdate: 0, vdate: 0, state: '', prep: '', prep1: '',
  cmobject: '{}', ...extra });
const schedule = id => ({ id, cat: [], update: 100, difficulty: 2.5, interval: 3 });

test('successful import persists documents and schedules and removes the intent', async () => {
  const dir = makeDir();
  const db = openDb(dir);
  const quizman = quizFor(dir);
  const unrelated = doc(1, { _id: 'pre-existing' });
  await db.insertAsync([unrelated]);
  const journal = new ImportJournal(dir);
  await journal.begin([doc(10), doc(11, { _id: 'given-id' })], [schedule(10)], db, quizman);
  const persisted = await db.findAsync({});
  assert.equal(persisted.length, 3);
  assert.deepEqual(persisted.find(d => d._id === 'pre-existing'), unrelated);
  assert.equal(typeof persisted.find(d => d.id === 10)._id, 'string');
  assert.equal(persisted.find(d => d.id === 11)._id, 'given-id');
  assert.deepEqual(quizman.quizes.map(q => q.id), [5, 10]);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'quizes.json'), 'utf8')).map(q => q.id), [5, 10]);
  assert.equal(fs.existsSync(path.join(dir, JOURNAL)), false);
});

test('no journal means recovery is a no-op', async () => {
  const dir = makeDir();
  const journal = new ImportJournal(dir);
  assert.equal(journal.exists(), false);
  assert.deepEqual(await journal.recover(openDb(dir), quizFor(dir)), { recovered: false });
});

test('recovery resumes an intent written before any insertion', async () => {
  const dir = makeDir();
  fs.writeFileSync(path.join(dir, JOURNAL), JSON.stringify({ version: 1,
    documents: [doc(20, { _id: 'a20' }), doc(21, { _id: 'a21' })], schedules: [schedule(20)] }));
  const db = openDb(dir);
  const quizman = quizFor(dir);
  const result = await new ImportJournal(dir).recover(db, quizman);
  assert.deepEqual(result, { recovered: true, documents: 2, schedules: 1 });
  assert.deepEqual((await db.findAsync({})).map(d => d.id).sort((a, b) => a - b), [20, 21]);
  assert.deepEqual(quizman.quizes.map(q => q.id), [5, 20]);
  assert.equal(fs.existsSync(path.join(dir, JOURNAL)), false);
});

test('recovery inserts only documents missing after a partial insertion', async () => {
  const dir = makeDir();
  const intended = [doc(30, { _id: 'a30' }), doc(31, { _id: 'a31' })];
  fs.writeFileSync(path.join(dir, JOURNAL), JSON.stringify({ version: 1, documents: intended, schedules: [schedule(31)] }));
  const db = openDb(dir);
  await db.insertAsync([intended[0]]);
  const quizman = quizFor(dir);
  assert.deepEqual(await new ImportJournal(dir).recover(db, quizman), { recovered: true, documents: 1, schedules: 1 });
  const persisted = await db.findAsync({});
  assert.equal(persisted.length, 2);
  assert.equal(persisted.filter(d => d.id === 30).length, 1);
});

test('recovery after schedule persistence only clears the completed intent', async () => {
  const dir = makeDir();
  const intended = [doc(40, { _id: 'a40' })];
  fs.writeFileSync(path.join(dir, JOURNAL), JSON.stringify({ version: 1, documents: intended, schedules: [schedule(40)] }));
  const db = openDb(dir);
  await db.insertAsync(intended);
  fs.writeFileSync(path.join(dir, 'quizes.json'), JSON.stringify([{ id: 5, cat: [], update: 10, difficulty: 2.5, interval: 1 }, schedule(40)]));
  const quizman = quizFor(dir);
  assert.deepEqual(await new ImportJournal(dir).recover(db, quizman), { recovered: true, documents: 0, schedules: 0 });
  assert.equal((await db.findAsync({})).length, 1);
  assert.deepEqual(quizman.quizes.map(q => q.id), [5, 40]);
  assert.equal(fs.existsSync(path.join(dir, JOURNAL)), false);
});

test('repeated recovery of the same intent is idempotent', async () => {
  const dir = makeDir();
  const intent = { version: 1, documents: [doc(50, { _id: 'a50' })], schedules: [schedule(50)] };
  const db = openDb(dir);
  const quizman = quizFor(dir);
  for (let i = 0; i < 3; i++) {
    fs.writeFileSync(path.join(dir, JOURNAL), JSON.stringify(intent));
    await new ImportJournal(dir).recover(db, quizman);
  }
  assert.equal((await db.findAsync({ id: 50 })).length, 1);
  assert.deepEqual(quizman.quizes.filter(q => q.id === 50).length, 1);
});

test('a conflicting native ID stops recovery before any write', async () => {
  const dir = makeDir();
  fs.writeFileSync(path.join(dir, JOURNAL), JSON.stringify({ version: 1,
    documents: [doc(60, { _id: 'a60' }), doc(61, { _id: 'a61' })], schedules: [] }));
  const db = openDb(dir);
  await db.insertAsync([doc(60, { _id: 'other', title: 'different' })]);
  await assert.rejects(new ImportJournal(dir).recover(db, quizFor(dir)), /conflict/i);
  assert.equal((await db.findAsync({ id: 61 })).length, 0);
  assert.ok(fs.existsSync(path.join(dir, JOURNAL)));
});

test('a conflicting internal ID stops recovery before any write', async () => {
  const dir = makeDir();
  fs.writeFileSync(path.join(dir, JOURNAL), JSON.stringify({ version: 1,
    documents: [doc(70, { _id: 'shared' }), doc(71, { _id: 'a71' })], schedules: [] }));
  const db = openDb(dir);
  await db.insertAsync([doc(999, { _id: 'shared' })]);
  await assert.rejects(new ImportJournal(dir).recover(db, quizFor(dir)), /conflict/i);
  assert.equal((await db.findAsync({ id: 71 })).length, 0);
});

test('a conflicting existing schedule stops recovery before any write', async () => {
  const dir = makeDir();
  fs.writeFileSync(path.join(dir, JOURNAL), JSON.stringify({ version: 1,
    documents: [doc(80, { _id: 'a80' })], schedules: [{ ...schedule(5), interval: 9 }] }));
  const db = openDb(dir);
  await assert.rejects(new ImportJournal(dir).recover(db, quizFor(dir)), /conflict/i);
  assert.equal((await db.findAsync({})).length, 0);
  assert.ok(fs.existsSync(path.join(dir, JOURNAL)));
});

test('a malformed or future-version journal is retained and reported', async () => {
  for (const content of ['{not json', JSON.stringify({ version: 2, documents: [], schedules: [] }),
    JSON.stringify({ version: 1, documents: 'x', schedules: [] }),
    JSON.stringify({ version: 1, documents: [doc(90)], schedules: [] })]) {
    const dir = makeDir();
    fs.writeFileSync(path.join(dir, JOURNAL), content);
    await assert.rejects(new ImportJournal(dir).recover(openDb(dir), quizFor(dir)));
    assert.equal(fs.readFileSync(path.join(dir, JOURNAL), 'utf8'), content);
  }
});

test('duplicate identities inside one import are rejected before writing intent', async () => {
  const dir = makeDir();
  const db = openDb(dir);
  const journal = new ImportJournal(dir);
  for (const args of [[[doc(100, { _id: 'x' }), doc(100, { _id: 'y' })], []],
    [[doc(101, { _id: 'z' }), doc(102, { _id: 'z' })], []],
    [[doc(103, { _id: 'w' })], [schedule(103), schedule(103)]]]) {
    await assert.rejects(journal.begin(args[0], args[1], db, quizFor(dir)), /duplicate/i);
    assert.equal(journal.exists(), false);
    assert.equal((await db.findAsync({})).length, 0);
  }
});

test('an existing pending journal blocks a new import', async () => {
  const dir = makeDir();
  fs.writeFileSync(path.join(dir, JOURNAL), JSON.stringify({ version: 1, documents: [], schedules: [] }));
  await assert.rejects(new ImportJournal(dir).begin([doc(110)], [], openDb(dir), quizFor(dir)), /pending/i);
});

test('a failed document insertion retains the intent and the retry completes it', async () => {
  const dir = makeDir();
  const db = openDb(dir);
  const quizman = quizFor(dir);
  const journal = new ImportJournal(dir);
  const original = db.insertAsync.bind(db);
  db.insertAsync = () => Promise.reject(new Error('injected insert failure'));
  await assert.rejects(journal.begin([doc(120, { _id: 'a120' })], [schedule(120)], db, quizman), /injected insert failure/);
  assert.ok(journal.exists());
  assert.deepEqual(quizman.quizes.map(q => q.id), [5]);
  db.insertAsync = original;
  assert.deepEqual(await journal.recover(db, quizman), { recovered: true, documents: 1, schedules: 1 });
  assert.equal(journal.exists(), false);
});

test('a failed schedule save retains the intent and restores in-memory schedules', async () => {
  const dir = makeDir();
  const db = openDb(dir);
  const quizman = quizFor(dir);
  const journal = new ImportJournal(dir);
  quizman.load();
  const before = quizman.quizes.slice();
  quizman.save = () => { throw new Error('injected schedule write failure'); };
  await assert.rejects(journal.begin([doc(130, { _id: 'a130' })], [schedule(130)], db, quizman), /injected schedule write failure/);
  assert.ok(journal.exists());
  assert.deepEqual(quizman.quizes, before);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'quizes.json'), 'utf8')).map(q => q.id), [5]);
  delete quizman.save;
  assert.deepEqual(await journal.recover(db, quizman), { recovered: true, documents: 0, schedules: 1 });
  assert.deepEqual(quizman.quizes.map(q => q.id), [5, 130]);
  assert.equal(journal.exists(), false);
});

test('an interrupted intent write is not committed intent', async () => {
  const dir = makeDir();
  fs.writeFileSync(path.join(dir, JOURNAL + '.writing'), '{partial');
  const journal = new ImportJournal(dir);
  assert.equal(journal.exists(), false);
  await journal.begin([doc(140, { _id: 'a140' })], [], openDb(dir), quizFor(dir));
  assert.equal(journal.exists(), false);
});
