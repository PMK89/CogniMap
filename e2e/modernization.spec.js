// @ts-check
'use strict';
const { test, expect } = require('@playwright/test');

test('workspace search, system theme and Canvas preview are keyboard accessible', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/');
  await page.waitForSelector('#cmsvg');
  await page.keyboard.press('Control+k');
  const panel = page.getByRole('dialog', { name: 'CogniMap · Workspace' });
  await expect(panel).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Search knowledge map' });
  let settingsWritesWhileSearching = 0;
  page.on('request', (request) => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname === '/api/settings') settingsWritesWhileSearching++;
  });
  await search.pressSequentially('sndqumx');
  await expect.poll(() => settingsWritesWhileSearching).toBe(0);
  await search.fill('Hydroxyl');
  await expect(panel.getByRole('button', { name: /Hydroxylgruppe/ })).toBeVisible();
  for (const theme of ['light', 'dark', 'system']) {
    await panel.getByLabel('Theme', { exact: true }).selectOption(theme);
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe(theme === 'system' ? null : theme);
    await page.screenshot({ path: '/tmp/cognimap-workspace-' + theme + '.png' });
  }
  await panel.getByText('JSON Canvas · Import and export').click();
  await panel.locator('input[type=file]').setInputFiles({ name: 'test.canvas', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ nodes: [{ id: 'test', type: 'text', text: 'Canvas browser preview', x: 500, y: 500, width: 100, height: 80 }] })) });
  await expect(panel.getByRole('button', { name: 'Import 1 documents' })).toBeVisible();
  await panel.getByRole('button', { name: 'Import 1 documents' }).click();
  await expect(panel.getByRole('status')).toContainText('1 documents imported');
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('review reveals only a cover, grades it, and undoes the rating', async ({ page }) => {
  const settings = await (await page.request.get('/api/settings/1')).json();
  settings.mode = 'quizing';
  await page.request.put('/api/settings', { data: settings });
  await page.goto('/');
  await page.waitForSelector('app-tb-quizzing');
  const review = page.locator('app-tb-quizzing');
  // Earlier legacy quiz checks leave a resumable session. Exercise the explicit
  // new-session action before asserting this test's independent progress.
  await review.getByRole('button', { name: 'Start / refresh due' }).click();
  await expect(review.getByRole('status')).toContainText('0 rated');
  await expect(review.getByRole('button', { name: 'Reveal answer · Space' })).toBeVisible();
  await review.getByRole('button', { name: 'Reveal answer · Space' }).click();
  await expect(review.getByRole('button', { name: '5 · Easy' })).toBeVisible();
  await page.screenshot({ path: '/tmp/cognimap-review-revealed.png' });
  await review.getByRole('button', { name: '5 · Easy' }).click();
  await expect(review.getByRole('status')).toContainText('1 rated');
  await review.getByRole('button', { name: 'Undo rating' }).click();
  await expect(review.getByRole('status')).toContainText('0 rated');
  settings.mode = 'view';
  await page.request.put('/api/settings', { data: settings });
});
