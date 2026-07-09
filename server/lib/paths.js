'use strict';

const path = require('path');
const fs = require('fs');

/**
 * Central, safe path resolution. All filesystem access from API routes must
 * go through resolveInside() so requests can never escape their root
 * directory (path traversal protection).
 */

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = process.env.COGNIMAP_DATA_DIR
  ? path.resolve(process.env.COGNIMAP_DATA_DIR)
  : path.join(ROOT, 'data');
const ASSETS_DIR = path.join(ROOT, 'src', 'assets');
const DIST_DIR = path.join(ROOT, 'dist');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

/**
 * Resolve `relative` inside `root`, throwing if the result escapes root.
 * @param {string} root absolute base directory
 * @param {string} relative untrusted relative path
 * @returns {string} absolute path guaranteed to be inside root
 */
function resolveInside(root, relative) {
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    const err = new Error('Path escapes allowed directory');
    err.status = 400;
    err.code = 'path_traversal';
    throw err;
  }
  return resolved;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = { ROOT, DATA_DIR, ASSETS_DIR, DIST_DIR, BACKUP_DIR, resolveInside, ensureDir };
