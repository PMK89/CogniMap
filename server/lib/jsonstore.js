'use strict';

const fs = require('fs');
const path = require('path');
const { DATA_DIR, BACKUP_DIR, resolveInside, ensureDir } = require('./paths');

/**
 * JSON-file backed store for the small config documents
 * (settings.json, colors.json, buttons.json, templates.json, spechars.json).
 *
 * Behavior preserved from settingsController.js, plus:
 *  - a timestamped backup of the on-disk file is created before the first
 *    write of each server run (never silently destroys user data)
 *  - writes are atomic (write to temp file, then rename)
 */
class JsonStore {
  /**
   * @param {string} filename file name inside the data directory, e.g. "settings.json"
   */
  constructor(filename) {
    this.file = resolveInside(DATA_DIR, filename);
    this.name = filename;
    this._data = undefined;
    this._backedUp = false;
  }

  /** Lazily load and cache the file contents. */
  load() {
    if (this._data === undefined) {
      const raw = fs.readFileSync(this.file, 'utf8');
      this._data = JSON.parse(raw);
    }
    return this._data;
  }

  /** Replace the whole document and persist. */
  save(data) {
    this._data = data;
    this._backupOnce();
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, this.file);
  }

  _backupOnce() {
    if (this._backedUp || !fs.existsSync(this.file)) return;
    ensureDir(BACKUP_DIR);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = path.join(BACKUP_DIR, `${this.name}.${stamp}.bak`);
    fs.copyFileSync(this.file, dest);
    this._backedUp = true;
  }
}

module.exports = { JsonStore };
