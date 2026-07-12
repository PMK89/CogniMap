// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Prepares a disposable data directory for the e2e server:
 *  - copies the backend test fixtures (legacy-format data)
 *  - points the persisted viewport at a known fixture element so the map
 *    renders content immediately on load
 */
module.exports = async function globalSetup() {
  const fixtures = path.join(__dirname, '..', 'server', 'test', 'fixtures', 'data');
  const target = path.join(__dirname, '.data');

  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  for (const file of fs.readdirSync(fixtures)) {
    fs.copyFileSync(path.join(fixtures, file), path.join(target, file));
  }

  // aim the viewport at the fixture node "Hydroxylgruppe" (id 37513)
  const settingsFile = path.join(target, 'settings.json');
  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  settings[0].coor = { x: 273600, y: 96200 };
  settings[0].mode = 'view';
  settings[0].widget0 = 'none';
  settings[0].widget1 = 'none';
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

  // minimal minimap snapshot so /api/minimap has content
  const mmFile = path.join(target, 'minimap.json');
  if (!fs.existsSync(mmFile)) {
    fs.writeFileSync(mmFile, JSON.stringify('<g id="minimap"></g>'));
  }
};
