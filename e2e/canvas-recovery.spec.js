// @ts-check
'use strict';
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { exportCanvas } = require('../server/lib/interchange/json-canvas');

const JOURNAL = path.join(__dirname, '.data', 'canvas-import-journal.json');

test('a native Canvas import through the UI discharges its recovery journal', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  const baseline = await (await page.request.get('/api/canvas/export')).json();
  const source = baseline['org.cognimap'].documents.find(d => d.id > 0);
  // Park the import far from the fixture geometry and far in the future, so
  // later specs cannot hit it by position or find it in the review queue.
  const offset = 900000;
  const document = { ...source, id: 800001234, _id: 'e2e-recovery-native',
    title: 'Recoverybrowserimport', types: ['q'],
    coor: { x: source.coor.x + offset, y: source.coor.y + offset },
    x0: source.x0 + offset, y0: source.y0 + offset, x1: source.x1 + offset, y1: source.y1 + offset };
  const canvas = exportCanvas([document]);
  const schedule = { id: document.id, cat: [], update: 99999, difficulty: 2.5, interval: 7 };
  canvas['org.cognimap'].quizes = [schedule];

  await page.goto('/');
  await page.waitForSelector('#cmsvg');
  await page.keyboard.press('Control+k');
  const panel = page.getByRole('dialog', { name: 'CogniMap · Workspace' });
  await panel.getByText('JSON Canvas · Import and export').click();
  await panel.locator('input[type=file]').setInputFiles({ name: 'native.canvas',
    mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(canvas)) });
  await expect(panel.getByRole('button', { name: 'Import 1 documents' })).toBeVisible();
  await panel.getByRole('button', { name: 'Import 1 documents' }).click();
  await expect(panel.getByRole('status')).toContainText('1 documents imported');

  // A completed import owns no pending intent.
  expect(fs.existsSync(JOURNAL)).toBe(false);

  // Both halves of the import are persisted, and the map still serves them.
  const after = await (await page.request.get('/api/canvas/export')).json();
  expect(after['org.cognimap'].documents.filter(d => d.id === document.id)).toEqual([document]);
  expect(after['org.cognimap'].quizes.find(q => q.id === document.id)).toEqual(schedule);
  for (const existing of baseline['org.cognimap'].documents) {
    expect(after['org.cognimap'].documents.find(d => d._id === existing._id)).toEqual(existing);
  }

  await page.reload();
  await page.waitForSelector('#cmsvg');
  await page.keyboard.press('Control+k');
  await page.getByRole('searchbox', { name: 'Search knowledge map' }).fill('Recoverybrowserimport');
  await expect(panel.getByRole('button', { name: /Recoverybrowserimport/ })).toBeVisible();
  expect(errors).toEqual([]);
});
