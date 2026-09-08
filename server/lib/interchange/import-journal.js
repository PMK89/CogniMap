'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');

// Optional, versioned Canvas import intent. Native documents and quizes.json
// remain authoritative: the journal only records what a running import still
// owes them, so an interrupted process can roll the same writes forward.
// This is process-restart recovery, not a cross-file ACID transaction.
const VERSION = 1;

const conflict = message => new Error('Canvas import recovery conflict: ' + message);

function assertUnique(values, what) {
  if (new Set(values).size !== values.length) throw new Error('Duplicate ' + what + ' in one Canvas import');
}

/** The intent is only trustworthy as a whole; a damaged one is never guessed at. */
function readIntent(file) {
  const intent = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!intent || intent.version !== VERSION) throw new Error('Unsupported Canvas import journal version');
  if (!Array.isArray(intent.documents) || !Array.isArray(intent.schedules)) throw new Error('Malformed Canvas import journal');
  for (const doc of intent.documents) {
    if (!doc || !Number.isInteger(doc.id) || typeof doc._id !== 'string' || !doc._id) throw new Error('Malformed Canvas import journal document');
  }
  for (const entry of intent.schedules) {
    if (!entry || !Number.isInteger(entry.id)) throw new Error('Malformed Canvas import journal schedule');
  }
  assertUnique(intent.documents.map(d => d.id), 'document ID');
  assertUnique(intent.documents.map(d => d._id), 'database ID');
  assertUnique(intent.schedules.map(q => q.id), 'schedule ID');
  return intent;
}

class ImportJournal {
  /** @param {string} dataDir directory holding cme.db and quizes.json */
  constructor(dataDir) {
    this.file = path.join(dataDir, 'canvas-import-journal.json');
  }

  /** True while an import may have persisted only part of its records. */
  exists() {
    return fs.existsSync(this.file);
  }

  /**
   * Record the complete intent, then apply it. Documents are given their
   * database identity up front so a retry inserts the same records rather
   * than duplicates.
   */
  async begin(documents, scheduling, db, quizman) {
    if (this.exists()) throw new Error('A previous Canvas import is still pending recovery');
    const intended = documents.map(doc => (doc._id ? { ...doc } : { ...doc, _id: crypto.randomUUID() }));
    assertUnique(intended.map(d => d.id), 'document ID');
    assertUnique(intended.map(d => d._id), 'database ID');
    assertUnique(scheduling.map(q => q && q.id), 'schedule ID');
    const temporary = this.file + '.writing';
    fs.writeFileSync(temporary, JSON.stringify({ version: VERSION, documents: intended, schedules: scheduling }));
    // Rename is the commit point: a partial .writing file is not intent.
    fs.renameSync(temporary, this.file);
    return this.recover(db, quizman);
  }

  /**
   * Roll a recorded intent forward. Records that already match are left
   * alone; records that exist but differ stop recovery without overwriting
   * anything. Unrelated documents and schedules are never touched.
   */
  async recover(db, quizman) {
    if (!this.exists()) return { recovered: false };
    const intent = readIntent(this.file);

    const persisted = await db.findAsync({});
    const byId = new Map(persisted.map(doc => [doc.id, doc]));
    const byInternalId = new Map(persisted.map(doc => [doc._id, doc]));
    const missingDocuments = [];
    for (const wanted of intent.documents) {
      const sameId = byId.get(wanted.id);
      const sameInternalId = byInternalId.get(wanted._id);
      if (sameId && sameInternalId && sameId !== sameInternalId) {
        throw conflict(`document ${wanted.id} and database ID ${wanted._id} belong to different records`);
      }
      const existing = sameId || sameInternalId;
      if (!existing) missingDocuments.push(wanted);
      else if (!isDeepStrictEqual(existing, wanted)) throw conflict(`document ${wanted.id} differs from the recorded import`);
    }

    quizman.load();
    const scheduleById = new Map(quizman.quizes.map(entry => [entry.id, entry]));
    const missingSchedules = [];
    for (const wanted of intent.schedules) {
      const existing = scheduleById.get(wanted.id);
      if (!existing) missingSchedules.push(wanted);
      else if (!isDeepStrictEqual(existing, wanted)) throw conflict(`schedule ${wanted.id} differs from the recorded import`);
    }

    if (missingDocuments.length) await db.insertAsync(missingDocuments);
    if (missingSchedules.length) {
      const snapshot = quizman.quizes.slice();
      quizman.quizes.push(...missingSchedules);
      try {
        quizman.save();
      } catch (err) {
        // Keep memory consistent with the file so a retry sees the truth.
        quizman.quizes = snapshot;
        throw err;
      }
    }
    // Both halves are persisted: the intent is discharged.
    fs.rmSync(this.file, { force: true });
    return { recovered: true, documents: missingDocuments.length, schedules: missingSchedules.length };
  }
}

module.exports = { ImportJournal };
