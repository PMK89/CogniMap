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

test('finishing a session reports completion and what is scheduled next', async ({ page }) => {
  const settings = await (await page.request.get('/api/settings/1')).json();
  settings.mode = 'quizing';
  await page.request.put('/api/settings', { data: settings });
  await page.goto('/');
  await page.waitForSelector('app-tb-quizzing');
  const review = page.locator('app-tb-quizzing');
  await review.getByRole('button', { name: 'Start / refresh due' }).click();
  const status = review.getByRole('status').first();
  await expect(status).toContainText('0 rated');
  // Grade 5 never requeues, so exactly this many ratings drain the queue.
  const queued = Number((await status.innerText()).match(/(\d+) remaining/)[1]);
  expect(queued).toBeGreaterThan(0);
  for (let rated = 1; rated <= queued; rated++) {
    await review.getByRole('button', { name: 'Reveal answer · Space' }).click();
    await review.getByRole('button', { name: '5 · Easy' }).click();
    await expect(status).toContainText(`${rated} rated`);
  }
  // The finished session must not read like a session that never had items.
  await expect(review.getByText(/Session complete · \d+ rated/)).toBeVisible();
  await expect(review.getByText('No items in this session.')).toHaveCount(0);
  await expect(review.getByText(/Next \d+ due in \d+ days?; \d+ scheduled ahead/)).toBeVisible();
  settings.mode = 'view';
  await page.request.put('/api/settings', { data: settings });
});

test('moving to another question never leaves an earlier cover revealed', async ({ page }) => {
  const settings = await (await page.request.get('/api/settings/1')).json();
  settings.mode = 'quizing';
  await page.request.put('/api/settings', { data: settings });
  await page.goto('/');
  await page.waitForSelector('app-tb-quizzing');
  const review = page.locator('app-tb-quizzing');
  await review.getByRole('button', { name: 'Start / refresh due' }).click();
  // Earlier specs may have rated everything due, so build the queue from the
  // authoring controls instead: include future items, then pick a subject.
  await review.getByText('Categories and question authoring').click();
  await review.getByLabel('Include future items').check();
  await review.getByLabel('Subject').selectOption('Chemie');
  const status = review.getByRole('status').first();
  await expect(status).not.toContainText('0 remaining');
  expect(Number((await status.innerText()).match(/(\d+) remaining/)[1])).toBeGreaterThan(1);
  // Reveal hides covers with an injected stylesheet; count the live rules.
  const hidden = () => page.evaluate(() => Array.from(document.head.querySelectorAll('style'))
    .map(s => s.textContent).filter(t => t.includes('visibility: hidden')));

  expect(await hidden()).toHaveLength(0);
  await review.getByRole('button', { name: 'Reveal answer · Space' }).click();
  const first = await hidden();
  expect(first).toHaveLength(1);

  await review.getByRole('button', { name: 'Next question' }).click();
  await expect(review.getByRole('button', { name: 'Reveal answer · Space' })).toBeVisible();
  expect(await hidden()).toHaveLength(0);

  await review.getByRole('button', { name: 'Reveal answer · Space' }).click();
  const second = await hidden();
  expect(second).toHaveLength(1);
  expect(second[0]).not.toEqual(first[0]);

  // Going back must reveal nothing on its own.
  await review.getByRole('button', { name: 'Previous question' }).click();
  expect(await hidden()).toHaveLength(0);
  settings.mode = 'view';
  await page.request.put('/api/settings', { data: settings });
});
