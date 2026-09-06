'use strict';
const fs = require('node:fs');
const path = require('node:path');

// Optional, versioned session state; native schedules remain authoritative.
class ReviewCheckpoint {
  constructor(dataDir) { this.file = path.join(dataDir, 'quiz-session.json'); }
  load(day) {
    if (!fs.existsSync(this.file)) return null;
    try {
      const state = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      if (state.version !== 1 || state.day !== day || !Array.isArray(state.ids) || !state.ids.every(Number.isSafeInteger) || !Number.isInteger(state.reviewed) || state.reviewed < 0) return null;
      return state;
    } catch (err) {
      // A checkpoint is expendable; preserve the damaged file for diagnosis.
      console.warn('[quiz] unreadable review checkpoint; due schedules remain available:', err.message);
      return null;
    }
  }
  save(state) {
    const temporary = this.file + '.writing';
    fs.writeFileSync(temporary, JSON.stringify({ ...state, version: 1 }));
    fs.renameSync(temporary, this.file);
  }
}
module.exports = { ReviewCheckpoint };
