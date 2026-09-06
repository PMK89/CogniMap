'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { ROOT, resolveInside, ensureDir } = require('../lib/paths');
const { badRequest, notFound } = require('../lib/errors');
const { validators } = require('../lib/validate');

/**
 * Media APIs — replaces the Electron mediaprocess.js hidden window.
 *
 * Differences from the Electron version (documented in docs/MIGRATION.md):
 *  - 'openBrowser' used shell.openExternal / spawned VLC / kolourpaint.
 *    The browser build instead returns a URL that the client opens in a
 *    new tab; audio/video play in the browser's native player.
 *  - clipboard access happens client-side (Clipboard API); pasted images
 *    are uploaded through POST /clipboard-image.
 */
function createMediaRouter() {
  const router = express.Router();

  const IMAGE_DIRS = [
    path.join(ROOT, 'src', 'assets', 'images'),
    path.join(ROOT, 'dist', 'assets', 'images'),
  ];

  // old channel: openBrowser — resolve a content reference to an openable URL
  router.post('/open', (req, res) => {
    const arg = req.body || {};
    if (!arg.type || !arg.path) throw badRequest('open requires type and path');
    const type = String(arg.type);
    let relPath = String(arg.path);

    if (type === 'link') {
      // external URL: pass through untouched, client opens it
      res.json({ action: 'open-url', url: relPath, status: 'Opened site: ' + relPath });
      return;
    }

    // legacy payloads may contain absolute paths that embed .../cognimap/...
    const cognimappos = relPath.indexOf('/cognimap/');
    if (cognimappos > -1) relPath = relPath.slice(cognimappos + 9);
    // strip a leading slash so resolveInside treats it as relative
    relPath = relPath.replace(/^\/+/, '');
    // serve from the app's own static tree; verify it exists in src or dist
    const srcAbs = resolveInside(ROOT, relPath);
    if (!fs.existsSync(srcAbs)) throw notFound('file not found: ' + relPath);

    // client-side URL: files under src/ and dist/ are exposed via /files/
    const url = '/files/' + relPath.split(path.sep).join('/');
    switch (type) {
      case 'pdf':
      case 'txt':
      case 'audio':
      case 'videos':
      case 'picture':
        res.json({ action: 'open-url', url, status: `Opened ${type}: ` + url });
        return;
      default:
        throw badRequest('Can not open: ' + relPath + ' unknown type ' + type);
    }
  });

  // old channel: makeTrans — set matching light/dark pixels transparent
  router.post('/transparent', (req, res) => {
    const arg = req.body || {};
    if (!arg.file || !arg.color) throw badRequest('transparent requires file and color');

    // the original operated on dist/assets/images; prefer src (the durable
    // copy) and fall back to dist, then write the result to both
    let srcFile = null;
    for (const dir of IMAGE_DIRS) {
      const candidate = resolveInside(dir, String(arg.file));
      if (fs.existsSync(candidate)) { srcFile = candidate; break; }
    }
    if (!srcFile) throw notFound('image not found: ' + arg.file);

    const png = PNG.sync.read(fs.readFileSync(srcFile));
    let num = arg.color === 'black' ? 0 : 255;
    if (arg.tolerance) num = Math.abs(num - Number(arg.tolerance));
    const { width: nx, height: ny, data } = png;
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const idx = nx * y * 4 + x * 4;
        const match = arg.color === 'black'
          ? data[idx] <= num && data[idx + 1] <= num && data[idx + 2] <= num
          : data[idx] >= num && data[idx + 1] >= num && data[idx + 2] >= num;
        if (match) data[idx + 3] = 0;
      }
    }
    const out = PNG.sync.write(png);

    let newfile = null;
    if (/\.png$/.test(arg.file)) newfile = arg.file.replace(/\.png$/, 't.png');
    else if (/\.PNG$/.test(arg.file)) newfile = arg.file.replace(/\.PNG$/, 't.png');
    if (!newfile) { res.json({ file: arg.file }); return; }

    for (const dir of IMAGE_DIRS) {
      try {
        const dest = resolveInside(dir, newfile);
        ensureDir(path.dirname(dest));
        fs.writeFileSync(dest, out);
      } catch (err) {
        console.warn('[media] could not write', dir, err.message);
      }
    }
    res.json({ file: newfile });
  });

  // replaces Electron clipboard image capture: the client posts pasted PNG data
  router.post('/clipboard-image', express.raw({ type: 'image/png', limit: '50mb' }), (req, res) => {
    if (!req.body || !req.body.length) throw badRequest('empty image payload');
    const pictureLink = 'cm/pmk_' + Date.now().toString() + '.png';
    for (const dir of IMAGE_DIRS) {
      try {
        const dest = resolveInside(dir, pictureLink);
        ensureDir(path.dirname(dest));
        fs.writeFileSync(dest, req.body);
      } catch (err) {
        console.warn('[media] could not write', dir, err.message);
      }
    }
    res.json({ type: 'png', payload: pictureLink, info: 'png' });
  });

  // old channel: makeMjSVG — LaTeX -> SVG via mathjax-node
  let mjReady = false;
  router.post('/mathjax', (req, res, next) => {
    const arg = req.body || {};
    if (!validators.tex(arg)) throw badRequest('invalid tex payload', validators.tex.errors);
    const mjAPI = require('mathjax-node');
    if (!mjReady) {
      mjAPI.config({ MathJax: { SVG: { scale: 150 } } });
      mjAPI.start();
      mjReady = true;
    }
    mjAPI.typeset(
      { math: arg.tex, format: arg.inline ? 'inline-TeX' : 'TeX', svg: true },
      (data) => {
        if (data.errors) {
          // the legacy channel returned the literal string 'error'
          res.json({ errors: data.errors, result: 'error' });
        } else {
          res.json(data);
        }
      }
    );
  });

  return router;
}

module.exports = { createMediaRouter };
