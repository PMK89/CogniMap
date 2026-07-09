'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { ROOT, resolveInside } = require('../lib/paths');
const { badRequest } = require('../lib/errors');

/**
 * Asset browsing API — replaces the Electron 'readAssetFiles' and
 * 'loadFile' channels from mediaprocess.js.
 */
function createAssetsRouter() {
  const router = express.Router();

  // old channel: readAssetFiles — recursively list folders under <prefix>/assets/
  // Preserves the legacy response shape including the quirky quoting of
  // names containing spaces, which the navigator widget's parser expects.
  router.post('/list', (req, res) => {
    const arg = req.body || {};
    if (!arg.prefix || !Array.isArray(arg.folders) || arg.folders.length === 0) {
      throw badRequest('list requires prefix and a non-empty folders array');
    }
    const filearray = [];

    function iterateDirectories(folders) {
      for (const entry of folders) {
        const folder = { name: entry.name, files: [], folders: [] };
        let dir;
        try {
          dir = fs.readdirSync(entry.path);
        } catch (err) {
          continue; // missing folder: skip, like the old code effectively did
        }
        for (let name of dir) {
          const elementpath = entry.path + '/' + name;
          let stats;
          try {
            stats = fs.statSync(elementpath);
          } catch (err) {
            continue;
          }
          if (stats.isDirectory()) {
            if (name.indexOf(' ') !== -1) name = '"' + name + '"';
            folder.folders.push({ name, path: elementpath });
          } else if (stats.isFile()) {
            if (name.indexOf(' ') !== -1) {
              name = '"' + name;
              if (name.indexOf('.') !== -1) name = name.replace('.', '".');
              else name += '"';
            }
            folder.files.push({ name, path: elementpath });
          }
        }
        filearray.push(folder);
        if (folder.folders.length > 0) iterateDirectories(folder.folders);
      }
    }

    const prefix = String(arg.prefix);
    const startarray = arg.folders.map((f) => ({
      name: String(f),
      // same base as the old code (__dirname + prefix + 'assets/' + folder),
      // but traversal-safe
      path: resolveInside(ROOT, path.join('.' + prefix, 'assets', String(f))),
    }));
    iterateDirectories(startarray);
    res.json(filearray);
  });

  // old channel: loadFile — normalize a picked file path to an assets/ relative path
  router.post('/resolve', (req, res) => {
    const arg = req.body || {};
    const file = String(arg.path || '');
    const pos = file.indexOf('assets/');
    if (pos !== -1) {
      res.json({ path: file.slice(pos) });
    } else {
      res.json({ path: 'please choose a file insite your /assets/!' });
    }
  });

  return router;
}

module.exports = { createAssetsRouter };
