// @ts-check
'use strict';

const { test, expect } = require('@playwright/test');

/**
 * Browser end-to-end tests for the modernized, Electron-free CogniMap.
 * They run against a production-style server (see playwright.config.js)
 * with a disposable copy of legacy-format fixture data.
 */

test.describe.configure({ mode: 'serial' });

/** collect hard page errors for every test */
let pageErrors;
test.beforeEach(({ page }) => {
  pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));
});

async function openApp(page) {
  await page.goto('/');
  await page.waitForSelector('#cmsvg', { timeout: 20000 });
  // give the bootstrap + initial viewport query a moment to settle
  await page.waitForTimeout(1500);
}

/**
 * Assert on the canvas SVG's text content directly: Playwright's
 * toContainText visibility semantics are unreliable for SVG <text> nodes.
 */
async function expectCanvasText(page, needle, present) {
  await expect
    .poll(async () => page.evaluate(
      (n) => (document.getElementById('cmsvg') || { textContent: '' }).textContent.indexOf(n) !== -1,
      needle
    ), { timeout: 15000 })
    .toBe(present);
}

test('app loads in the browser without Electron', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('app-root')).toBeAttached();
  await expect(page.locator('div#toolbar0')).toBeVisible();
  await expect(page).toHaveTitle(/CogniMap/i);
  expect(pageErrors).toEqual([]);
});

test('concept map canvas renders legacy elements from the NeDB store', async ({ page }) => {
  await openApp(page);
  // fixture node 37513 "Hydroxylgruppe" sits at the persisted viewport
  await expectCanvasText(page, 'Hydroxylgruppe', true);
  // its link partner is rendered too
  await expectCanvasText(page, '-ol', true);
});

test('settings load and save through the backend API', async ({ page }) => {
  await openApp(page);
  const roundtrip = await page.evaluate(async () => {
    const before = await (await fetch('/api/settings/1')).json();
    before.zoom = 0.85;
    const put = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(before),
    });
    const saved = await put.json();
    const after = await (await fetch('/api/settings/1')).json();
    return { status: put.status, savedZoom: saved.zoom, afterZoom: after.zoom };
  });
  expect(roundtrip.status).toBe(200);
  expect(roundtrip.savedZoom).toBe(0.85);
  expect(roundtrip.afterZoom).toBe(0.85);
});

test('colors, buttons, templates and special characters load', async ({ page }) => {
  await openApp(page);
  const data = await page.evaluate(async () => {
    const j = (p) => fetch(p).then((r) => r.json());
    return {
      colors: await j('/api/colors'),
      buttons: await j('/api/buttons'),
      templates: await j('/api/templates'),
      spechars: await j('/api/spechars'),
    };
  });
  expect(Array.isArray(data.colors)).toBe(true);
  expect(data.colors.length).toBeGreaterThan(0);
  expect(Array.isArray(data.buttons)).toBe(true);
  expect(data.buttons.length).toBeGreaterThan(0);
  expect(Array.isArray(data.templates)).toBe(true);
  expect(typeof data.spechars).toBe('object');
});

test('node creation, editing and deletion round-trip through UI rendering', async ({ page }) => {
  await openApp(page);
  // clone a fixture node as a new element next to the viewport center
  const created = await page.evaluate(async () => {
    const base = await (await fetch('/api/cme/id/37513')).json();
    const maxid = (await (await fetch('/api/cme/maxid')).json()).maxid;
    const clone = JSON.parse(JSON.stringify(base));
    delete clone._id;
    clone.id = maxid + 1;
    clone.title = 'E2E-Testknoten';
    clone.x0 = base.x0 + 60;
    clone.x1 = base.x1 + 60;
    clone.y0 = base.y0 + 120;
    clone.y1 = base.y1 + 120;
    clone.coor = { x: clone.x0, y: clone.y0 };
    const cmo = JSON.parse(clone.cmobject);
    cmo.links = [];
    clone.cmobject = JSON.stringify(cmo);
    // legacy prep contains pre-rendered svg including the old title
    clone.prep = clone.prep ? clone.prep.replace(/Hydroxylgruppe/g, 'E2E-Testknoten') : clone.prep;
    const res = await fetch('/api/cme', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(clone),
    });
    return { status: res.status, id: clone.id };
  });
  expect(created.status).toBe(200);

  await page.reload();
  await page.waitForSelector('#cmsvg');
  await expectCanvasText(page, 'E2E-Testknoten', true);

  // edit: rename via the change API (same path the UI services use)
  const changed = await page.evaluate(async (id) => {
    const doc = await (await fetch('/api/cme/id/' + id)).json();
    doc.title = 'E2E-Umbenannt';
    doc.prep = doc.prep ? doc.prep.replace(/E2E-Testknoten/g, 'E2E-Umbenannt') : doc.prep;
    const res = await fetch('/api/cme', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return (await res.json()).data.title;
  }, created.id);
  expect(changed).toBe('E2E-Umbenannt');

  await page.reload();
  await page.waitForSelector('#cmsvg');
  await expectCanvasText(page, 'E2E-Umbenannt', true);

  // delete
  const del = await page.evaluate(async (id) => {
    const res = await fetch('/api/cme/' + id, { method: 'DELETE' });
    return res.json();
  }, created.id);
  expect(del.success).toBe(true);

  await page.reload();
  await page.waitForSelector('#cmsvg');
  await page.waitForTimeout(1500);
  await expectCanvasText(page, 'E2E-Umbenannt', false);
});

test('link elements load and connected children are found', async ({ page }) => {
  await openApp(page);
  const result = await page.evaluate(async () => {
    const root = await (await fetch('/api/cme/id/30596')).json();
    const res = await fetch('/api/cme/children', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(root),
    });
    return res.json();
  });
  expect(Array.isArray(result.selCMEoArray)).toBe(true);
  expect(Array.isArray(result.selCMElArray)).toBe(true);
  expect(Array.isArray(result.selarray)).toBe(true);
  expect(result.selCMEoArray).toContain(30596);
});

/** switch the app mode via the settings API and reload */
async function setMode(page, mode) {
  await page.evaluate(async (m) => {
    const s = await (await fetch('/api/settings/1')).json();
    s.mode = m;
    // the edit toolbar's visibility is part of the persisted layout state
    s.tblayout1.display = m === 'edit' ? 'block' : 'none';
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(s),
    });
  }, mode);
  await page.reload();
  await page.waitForSelector('#cmsvg');
  await page.waitForTimeout(1000);
}

test('widget slots switch between all registry widgets', async ({ page }) => {
  await openApp(page);
  await setMode(page, 'edit'); // the widget switcher lives in the edit toolbar
  const slot0 = page.locator('select[aria-label="Widget slot 0"]');
  await expect(slot0).toBeVisible();

  // all 8 widgets are offered
  const options = await slot0.locator('option').allTextContents();
  expect(options.length).toBe(8);

  await slot0.selectOption('navigator');
  await expect(page.locator('app-navigator')).toBeVisible();

  await slot0.selectOption('minimap');
  await expect(page.locator('app-minimap')).toBeVisible();

  await slot0.selectOption('mnemo');
  await expect(page.locator('app-mnemo')).toBeVisible();

  await slot0.selectOption('codeeditor');
  await expect(page.locator('app-codeeditor')).toBeVisible();

  await slot0.selectOption('equation');
  await expect(page.locator('app-mjeditor')).toBeVisible();

  await slot0.selectOption('none');
});

test('minimap opens and holds the persisted snapshot', async ({ page }) => {
  await openApp(page);
  await setMode(page, 'edit');
  await page.locator('select[aria-label="Widget slot 0"]').selectOption('minimap');
  await expect(page.locator('#minimapsvg')).toBeVisible({ timeout: 10000 });
  const mm = await page.evaluate(() => fetch('/api/minimap').then((r) => r.json()));
  expect(mm).toBeTruthy();
});

test('JSME chemical editor loads in the browser and exposes its bridge', async ({ page }) => {
  await openApp(page);
  await setMode(page, 'edit');
  await page.locator('select[aria-label="Widget slot 0"]').selectOption('formula');
  const frame = page.frameLocator('#widgets0 iframe');
  await expect(frame.locator('#svg_textarea')).toBeAttached({ timeout: 30000 });
  await expect(frame.locator('#structure')).toBeAttached();
  // the GWT applet itself takes a moment; its container div appears when loaded
  await expect(frame.locator('#jsme_container, [id*=jsme]').first()).toBeAttached({ timeout: 30000 });
});

test('SVG editor loads and the CogniMap bridge exports drawings', async ({ page }) => {
  await openApp(page);
  await setMode(page, 'edit');
  await page.locator('select[aria-label="Widget slot 0"]').selectOption('svg');
  const frame = page.frameLocator('#widgets0 iframe');
  // bridge elements injected by cminterface.js once svgCanvas is ready
  await expect(frame.locator('#cmexport')).toBeAttached({ timeout: 40000 });
  await expect(frame.locator('#svg_textarea')).toBeAttached();
  await frame.locator('#cmexport').click();
  const value = await frame.locator('#svg_textarea').inputValue();
  const parsed = JSON.parse(value);
  expect(parsed.type).toBe('svg');
  expect(parsed.object).toContain('<svg');
});

test('LaTeX/MathJax rendering produces SVG through the backend', async ({ page }) => {
  await openApp(page);
  const res = await page.evaluate(async () => {
    const r = await fetch('/api/media/mathjax', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tex: '\\frac{a}{b}' }),
    });
    return r.json();
  });
  expect(res.svg).toContain('<svg');
});

test('quiz mode: due quizzes load, UI appears, answers reschedule', async ({ page }) => {
  await openApp(page);
  const quizres = await page.evaluate(() =>
    fetch('/api/quiz/load', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ limit: 42 }),
    }).then((r) => r.json())
  );
  expect(quizres).toHaveProperty('quizes');
  expect(quizres).toHaveProperty('catlist');
  expect(quizres).toHaveProperty('timelist');

  if (quizres.quizes.length > 0) {
    // active quizzes are marked q1
    expect(quizres.quizes[0].types[0]).toBe('q1');
    const answer = await page.evaluate((id) =>
      fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, scale: 5 }),
      }).then((r) => r.json()), quizres.quizes[0].id);
    expect(answer.quizes.length).toBe(quizres.quizes.length - 1);
  }

  // quizzing toolbar appears when the mode is active
  await page.evaluate(async () => {
    const s = await (await fetch('/api/settings/1')).json();
    s.mode = 'quizing';
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(s),
    });
  });
  await page.reload();
  await page.waitForSelector('#cmsvg');
  await expect(page.locator('app-tb-quizzing')).toBeAttached({ timeout: 10000 });
  // restore view mode
  await page.evaluate(async () => {
    const s = await (await fetch('/api/settings/1')).json();
    s.mode = 'view';
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(s),
    });
  });
});

test('map export and import round-trip', async ({ page }) => {
  await openApp(page);
  const result = await page.evaluate(async () => {
    const save = await fetch('/api/db/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ file: 'e2e/.data/export.json' }),
    }).then((r) => r.json());
    const load = await fetch('/api/db/load', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ file: 'e2e/.data/export.json' }),
    }).then((r) => r.json());
    return { save, load };
  });
  expect(result.save.status).toContain('database saved');
  expect(result.load.status).toBe('database loaded');
});

test('multimedia files resolve to openable URLs and are served', async ({ page }) => {
  await openApp(page);
  const media = await page.evaluate(async () => {
    const open = await fetch('/api/media/open', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'pdf', path: '/src/assets/pdf/hmz.pdf' }),
    }).then((r) => r.json());
    const served = await fetch(open.url, { method: 'HEAD' });
    return { open, servedStatus: served.status, servedType: served.headers.get('content-type') };
  });
  expect(media.open.action).toBe('open-url');
  expect(media.servedStatus).toBe(200);
  expect(media.servedType).toContain('pdf');
});

test('dark/light theme toggle works and persists', async ({ page }) => {
  await openApp(page);
  const toggle = page.locator('.cm-theme-toggle');
  await expect(toggle).toBeVisible();
  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await toggle.click();
  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(after).not.toBe(before);
  expect(['dark', 'light']).toContain(after);
  await page.reload();
  await page.waitForSelector('#cmsvg');
  const persisted = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(persisted).toBe(after);
});

test('keyboard focus is visible on chrome controls', async ({ page }) => {
  await openApp(page);
  await setMode(page, 'edit');
  // :focus-visible only applies to keyboard-driven focus — tab to the control
  const reached = await page.evaluate(() => {
    const el = document.querySelector('select[aria-label="Widget slot 0"]');
    return Boolean(el);
  });
  expect(reached).toBe(true);
  let focusedOutline = 'none';
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const state = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        isTarget: Boolean(el && el.getAttribute && el.getAttribute('aria-label') === 'Widget slot 0'),
        outline: el ? getComputedStyle(el).outlineStyle : 'none',
      };
    });
    if (state.isTarget) {
      focusedOutline = state.outline;
      break;
    }
  }
  expect(['solid', 'auto']).toContain(focusedOutline);
});
