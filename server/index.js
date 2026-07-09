'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const { ROOT, DIST_DIR } = require('./lib/paths');
const { errorMiddleware, notFound } = require('./lib/errors');
const { createConfigRouter } = require('./routes/config');
const { createMediaRouter } = require('./routes/media');
const { createAssetsRouter } = require('./routes/assets');
const { createCmeRouter } = require('./routes/cme');

/**
 * CogniMap local backend.
 *
 * Replaces the Electron main process + hidden BrowserWindows
 * (dbprocess.js / mediaprocess.js / settingsController.js) with a plain
 * HTTP server that:
 *   - serves the built frontend from dist/
 *   - exposes typed JSON APIs under /api/
 *   - exposes media files under /files/ (restricted to src/ and dist/)
 *
 * The server binds to 127.0.0.1 by default: this is a local, single-user
 * app and its APIs must not be exposed to the network.
 */
function createApp(options = {}) {
  const app = express();
  // strict:false — legacy payloads include bare JSON strings (minimap SVG)
  app.use(express.json({ limit: '100mb', strict: false }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: require('../package.json').version });
  });

  app.use('/api', createConfigRouter());
  app.use('/api/media', createMediaRouter());
  app.use('/api/assets', createAssetsRouter());
  app.use('/api', createCmeRouter(options));

  // media file access for pdf/video/audio/txt content referenced by maps;
  // only src/ and dist/ subtrees are exposed
  app.use('/files/src', express.static(path.join(ROOT, 'src')));
  app.use('/files/dist', express.static(DIST_DIR));

  // built frontend
  app.use(express.static(DIST_DIR));
  // images may live in src/assets but not dist/assets (clipboard writes both,
  // older data may only have src) — fall back to src/assets
  app.use('/assets', express.static(path.join(ROOT, 'src', 'assets')));

  app.use('/api', (req, res, next) => next(notFound('unknown API route: ' + req.originalUrl)));
  app.use(errorMiddleware);
  return app;
}

function start() {
  const port = Number(process.env.PORT || 3210);
  const host = process.env.HOST || '127.0.0.1';
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.warn('[server] dist/index.html not found — run `npm run build` first (APIs still available)');
  }
  const app = createApp();
  app.listen(port, host, () => {
    console.log(`CogniMap running at http://${host}:${port}`);
  });
}

if (require.main === module) start();

module.exports = { createApp };
