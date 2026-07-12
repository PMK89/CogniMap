'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'data');

/** Copy the fixture data dir into a fresh temp dir so writes never touch fixtures. */
function makeTmpDataDir() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cognimap-test-'));
  fs.cpSync(FIXTURES_DIR, tmp, { recursive: true });
  return tmp;
}

/**
 * Set COGNIMAP_DATA_DIR and start the app on an ephemeral port.
 * Must be called at most once per test file (server modules cache the data
 * dir at first require), so call it once in a top-level `before` hook.
 */
function startServer(dataDir) {
  process.env.COGNIMAP_DATA_DIR = dataDir;
  const { createApp } = require('../index');
  const app = createApp();
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1');
    server.once('listening', () => resolve(server));
    server.once('error', reject);
  });
}

function baseUrl(server) {
  const { port } = server.address();
  return `http://127.0.0.1:${port}`;
}

module.exports = { makeTmpDataDir, startServer, baseUrl };
