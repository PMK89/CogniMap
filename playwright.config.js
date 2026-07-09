// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');

/**
 * E2E tests run against a production-like server on its own port with a
 * disposable copy of the test fixtures (never the real data/ directory).
 * Requires a frontend build in dist/ (`npm run build` or `npm run build:dev`).
 */
module.exports = defineConfig({
  testDir: 'e2e',
  globalSetup: require.resolve('./e2e/global-setup'),
  timeout: 60000,
  retries: 0,
  workers: 1, // single shared backend/data dir — keep tests serial
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3311',
    channel: 'chrome',
    headless: true,
    screenshot: 'only-on-failure',
    viewport: { width: 1600, height: 900 },
  },
  webServer: {
    command: 'node server/index.js',
    url: 'http://127.0.0.1:3311/api/health',
    reuseExistingServer: false,
    env: {
      PORT: '3311',
      COGNIMAP_DATA_DIR: path.join(__dirname, 'e2e', '.data'),
    },
  },
});
