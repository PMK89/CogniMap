'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { DATA_DIR, BACKUP_DIR, ensureDir } = require('../lib/paths');
const { badRequest } = require('../lib/errors');

/**
 * Versioned 3D visualization state — stored in its own file
 * (data/viz3d.json) so the legacy concept-map data is never touched:
 * legacy maps load with defaults, no migration required, and removing
 * the file simply resets the 3D view ("reset visualization").
 *
 * Schema v1: { version, preset, positions{id:{x,y,z}}, shapes{id},
 *             locked{id}, camera, viewpoints[], scenePreset }
 */
function createViz3dRouter() {
  const router = express.Router();
  const file = path.join(DATA_DIR, 'viz3d.json');
  let backedUp = false;

  const DEFAULT = {
    version: 1,
    preset: 'cognitive-tree',
    positions: {},
    shapes: {},
    locked: {},
    camera: null,
    viewpoints: [],
    scenePreset: 'neutral',
  };

  router.get('/viz3d', (req, res) => {
    if (!fs.existsSync(file)) {
      res.json(DEFAULT);
      return;
    }
    try {
      res.json(Object.assign({}, DEFAULT, JSON.parse(fs.readFileSync(file, 'utf8'))));
    } catch (err) {
      // corrupted visualization state: recover with defaults, keep the
      // broken file aside for diagnosis
      try {
        ensureDir(BACKUP_DIR);
        fs.copyFileSync(file, path.join(BACKUP_DIR, 'viz3d.json.corrupt-' + Date.now()));
      } catch (e) { /* best effort */ }
      res.json(DEFAULT);
    }
  });

  router.put('/viz3d', (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || typeof body.version !== 'number') {
      throw badRequest('viz3d state requires a numeric version');
    }
    if (!backedUp && fs.existsSync(file)) {
      ensureDir(BACKUP_DIR);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(file, path.join(BACKUP_DIR, `viz3d.json.${stamp}.bak`));
      backedUp = true;
    }
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(body, null, 2));
    fs.renameSync(tmp, file);
    res.json({ ok: true });
  });

  // reset visualization (recoverable: file is backed up first)
  router.delete('/viz3d', (req, res) => {
    if (fs.existsSync(file)) {
      ensureDir(BACKUP_DIR);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(file, path.join(BACKUP_DIR, `viz3d.json.${stamp}.bak`));
      fs.unlinkSync(file);
    }
    res.json({ ok: true, state: DEFAULT });
  });

  return router;
}

module.exports = { createViz3dRouter };
