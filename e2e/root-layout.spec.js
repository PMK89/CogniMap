'use strict';
const { test, expect } = require('@playwright/test');
const { PNG } = require('pngjs');

function renderedPixelCount(image) {
  const png = PNG.sync.read(image);
  const bg = png.data.slice(0, 3);
  let count = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (Math.abs(png.data[i] - bg[0]) + Math.abs(png.data[i + 1] - bg[1]) + Math.abs(png.data[i + 2] - bg[2]) > 36) {
      count++;
    }
  }
  return count;
}

test('root layout remains selectable, deterministic, persistent and navigable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(String(err)));
  await page.addInitScript(() => localStorage.setItem('cognimap-3d', '1'));
  await page.goto('/');
  await page.waitForFunction(() => window.__cm3d && window.__cm3d.scene.positions.size > 0);
  await page.getByRole('combobox', { name: '3D layout preset' }).selectOption('root-network');
  const before = await page.evaluate(() => Array.from(window.__cm3d.scene.positions));
  await page.getByRole('button', { name: 'Frame all', exact: true }).click();
  // Overview visibility is updated by the next on-demand render tick after
  // the programmatic camera move, not synchronously in the click handler.
  await page.waitForTimeout(350);
  const overview = await page.evaluate(() => {
    const s = window.__cm3d.scene;
    const V = Object.getPrototypeOf(s.camera.position).constructor;
    const min = new V(Infinity, Infinity, Infinity), max = new V(-Infinity, -Infinity, -Infinity);
    s.positions.forEach(p => { min.min(new V(p.x, p.y, p.z)); max.max(new V(p.x, p.y, p.z)); });
    const center = min.add(max).multiplyScalar(0.5);
    const radius = Math.hypot(max.x - min.x, max.y - min.y, max.z - min.z) / 2;
    return {
      far: s.camera.far,
      extent: s.camera.position.distanceTo(center) + radius,
      skeleton: s.overviewGroup.children.length,
      visible: s.overviewGroup.visible,
    };
  });
  expect(overview.far).toBeGreaterThan(overview.extent);
  expect(overview.skeleton).toBe(2);
  expect(overview.visible).toBe(true);
  await page.locator('#cmap3d canvas').screenshot({ path: '/tmp/cognimap-root-overview-light.png' });
  expect(renderedPixelCount(await page.locator('#cmap3d canvas').screenshot())).toBeGreaterThan(100);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(300);
  await page.locator('#cmap3d canvas').screenshot({ path: '/tmp/cognimap-root-overview-dark.png' });
  expect(renderedPixelCount(await page.locator('#cmap3d canvas').screenshot())).toBeGreaterThan(100);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.getByRole('button', { name: 'Cross-links', exact: true }).click();
  await page.screenshot({ path: '/tmp/cognimap-root-fixture.png' });
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForFunction(() => window.__cm3d && window.__cm3d.scene.positions.size > 0);
  await expect(page.getByRole('combobox', { name: '3D layout preset' })).toHaveValue('root-network');
  expect(await page.evaluate(() => Array.from(window.__cm3d.scene.positions))).toEqual(before);
  const selected = await page.evaluate(() => {
    const scene = window.__cm3d.scene;
    // Do not use a falsy id sentinel here: graph traversal APIs may validly
    // use zero-valued keys, even though the persisted concept documents are
    // currently positive-id only.
    let id = null;
    scene.hierarchy.childrenOf.forEach((kids, candidate) => {
      if (id === null && kids.length && scene.positions.has(candidate)) { id = candidate; }
    });
    scene.onSelect(id, false);
    return id;
  });
  expect(selected).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: 'Frame subtree', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Frame subtree', exact: true }).click();
  await page.waitForTimeout(500);
  const view = await page.evaluate((id) => {
    const s = window.__cm3d.scene;
    const p = s.positions.get(id);
    const V = Object.getPrototypeOf(s.camera.position).constructor;
    const projected = new V(p.x, p.y, p.z).project(s.camera);
    return { projected: projected.toArray(), far: s.camera.far };
  }, selected);
  expect(Math.abs(view.projected[0])).toBeLessThan(0.9);
  expect(Math.abs(view.projected[1])).toBeLessThan(0.9);
  expect(view.projected[2]).toBeGreaterThanOrEqual(-1);
  expect(view.projected[2]).toBeLessThanOrEqual(1);
  expect(renderedPixelCount(await page.locator('#cmap3d canvas').screenshot())).toBeGreaterThan(100);
  expect(errors).toEqual([]);
});
