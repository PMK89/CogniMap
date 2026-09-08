'use strict';
const { test, expect } = require('@playwright/test');

test('workspace navigation selects and focuses the same concept in 3D', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cognimap-3d', '1'));
  await page.goto('/');
  await page.waitForFunction(() => window.__cm3d && window.__cm3d.scene && window.__cm3d.scene.positions.size > 0);
  await page.keyboard.press('Control+k');
  await page.getByRole('searchbox', { name: 'Search knowledge map' }).fill('Hydroxyl');
  const result = page.getByRole('dialog').getByRole('button', { name: /Hydroxylgruppe/ });
  await expect(result).toBeVisible();
  await result.click();
  await expect.poll(() => page.evaluate(() => {
    const view = window.__cm3d;
    const p = view.scene.positions.get(view.selectedId);
    return !!p && view.selectedTitle.includes('Hydroxyl') && view.scene.controls.target.distanceTo(p) < 0.001;
  })).toBe(true);
});

test('reopening 3D releases the previous graph listener', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(String(err)));
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Toggle 3D workspace', exact: true });
  for (let i = 0; i < 3; i++) {
    await toggle.click();
    await page.waitForFunction(() => window.__cm3d && window.__cm3d.scene.positions.size > 0);
    await toggle.click();
    await page.waitForFunction(() => !window.__cm3d);
  }
  expect(errors).toEqual([]);
});

test('3D follows live system-theme changes and respects a manual override', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cognimap-3d', '1');
    localStorage.removeItem('cognimap-theme');
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.waitForFunction(() => window.__cm3d && window.__cm3d.scene.scene);
  const background = () => page.evaluate(() => window.__cm3d.scene.scene.background.getHexString());
  await expect.poll(background).toBe('f5f6f8');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(background).not.toBe('f5f6f8');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  const manual = await background();
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(background).toBe(manual);
});
