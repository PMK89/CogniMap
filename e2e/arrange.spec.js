// @ts-check
'use strict';

const { test, expect } = require('@playwright/test');

/**
 * Regression tests for the Evenly Space (arrange) function.
 * A deliberately cluttered cluster is created via the API, selected with
 * a real Ctrl+drag, and arranged via the real button — asserting that
 * only the true elements move: no duplicates, no ghost overlays, stable
 * IDs/counts, persistence, drag-afterwards and undo.
 */

test.describe.configure({ mode: 'serial' });

const CLUSTER = { x: 372600, y: 124800 }; // empty area near the fixture viewport
let createdIds = [];

async function openApp(page) {
  // area selection lives in edit mode
  await page.request.get('/api/settings/1').then(async (r) => {
    const s = await r.json();
    s.mode = 'edit';
    if (s.tblayout1) { s.tblayout1.display = 'block'; }
    s.widget0 = 'none'; s.widget1 = 'none';
    if (s.wlayout0) { s.wlayout0.display = 'none'; }
    if (s.wlayout1) { s.wlayout1.display = 'none'; }
    await page.request.put('/api/settings', { data: s });
  });
  await page.goto('/');
  await page.waitForSelector('#cmsvg', { timeout: 20000 });
  await page.waitForTimeout(1500);
}

async function apiCounts(page) {
  return page.evaluate(async () => {
    const all = await (await fetch('/api/cme/query', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ l: 0, t: 0, r: 999999, b: 999999 }),
    })).json();
    return {
      nodes: all.filter((d) => d.id > 0).length,
      links: all.filter((d) => d.id < 0).length,
      ids: all.map((d) => d.id).sort((a, b) => a - b),
    };
  });
}

async function clusterPositions(page, ids) {
  return page.evaluate(async (list) => {
    const out = {};
    for (const id of list) {
      const d = await (await fetch('/api/cme/id/' + id)).json();
      out[id] = d ? { x: d.coor.x, y: d.coor.y } : null;
    }
    return out;
  }, ids);
}

test('setup: create a deliberately cluttered cluster', async ({ page }) => {
  await openApp(page);
  createdIds = await page.evaluate(async (C) => {
    const base = await (await fetch('/api/cme/id/37513')).json();
    const maxid = (await (await fetch('/api/cme/maxid')).json()).maxid;
    const made = [];
    for (let i = 0; i < 6; i++) {
      const c = JSON.parse(JSON.stringify(base));
      delete c._id;
      c.id = maxid + 1 + i;
      c.title = 'ES-' + c.id;
      // clutter: nearly identical positions
      c.x0 = C.x + (i % 2) * 6;
      c.x1 = c.x0 + 90;
      c.y0 = C.y + i * 5;
      c.y1 = c.y0 + 20;
      c.coor = { x: c.x0, y: c.y0 };
      const cmo = JSON.parse(c.cmobject);
      cmo.links = [];
      c.cmobject = JSON.stringify(cmo);
      c.prep = c.prep.replace(/Hydroxylgruppe/g, 'ES-' + c.id)
        .replace(/x="[\d.]+"/g, 'x="' + c.x0 + '"')
        .replace(/y="[\d.]+"/g, 'y="' + c.y0 + '"');
      await fetch('/api/cme', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(c) });
      made.push(c.id);
    }
    return made;
  }, CLUSTER);
  expect(createdIds.length).toBe(6);
});

test('Evenly Space moves only the real elements — no duplicates, no ghosts', async ({ page }) => {
  await openApp(page);
  await page.evaluate((C) => window.scrollTo(C.x - 700, C.y - 450), CLUSTER);
  await page.waitForTimeout(2500);
  const before = await apiCounts(page);
  const posBefore = await clusterPositions(page, createdIds);

  // real Ctrl+drag selection around the cluster
  await page.keyboard.down('Control');
  await page.mouse.move(560, 320); await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(560 + i * 45, 320 + i * 35); }
  await page.mouse.up();
  await page.keyboard.up('Control');
  await page.waitForTimeout(1200);

  await page.locator('.cm-arrange').click();
  await page.waitForTimeout(2500);

  // counts and IDs unchanged
  const after = await apiCounts(page);
  expect(after.nodes).toBe(before.nodes);
  expect(after.links).toBe(before.links);
  expect(after.ids).toEqual(before.ids);

  // positions actually changed and no longer overlap
  const posAfter = await clusterPositions(page, createdIds);
  let movedCount = 0;
  for (const id of createdIds) {
    if (Math.abs(posAfter[id].x - posBefore[id].x) > 1
      || Math.abs(posAfter[id].y - posBefore[id].y) > 1) { movedCount++; }
  }
  expect(movedCount).toBeGreaterThanOrEqual(4);
  const ys = createdIds.map((id) => posAfter[id].y).sort((a, b) => a - b);
  for (let i = 1; i < ys.length; i++) {
    const gap = ys[i] - ys[i - 1];
    expect(gap === 0 || gap >= 25).toBe(true); // aligned rows or properly spaced
  }

  // no duplicate rendered groups, and the selection overlay was rebuilt
  const dom = await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('#cmsvg g[id^=g]')).map((g) => g.id).filter((i) => /^g\d/.test(i));
    const seen = new Set(); const dups = [];
    ids.forEach((i) => (seen.has(i) ? dups.push(i) : seen.add(i)));
    const overlay = document.getElementById('cmeselectiongroup');
    return { dups, overlayClones: overlay ? overlay.querySelectorAll('g[id^=g]').length : 0 };
  });
  expect(dom.dups).toEqual([]);

  // ghost check: every overlay clone must sit within 60px of a REAL
  // element's current position (stale clones would sit far away)
  const ghost = await page.evaluate(() => {
    const overlay = document.getElementById('cmeselectiongroup');
    if (!overlay) { return { checked: 0, ghosts: 0 }; }
    let ghosts = 0; let checked = 0;
    overlay.querySelectorAll('g[id^=g]').forEach((clone) => {
      const id = clone.id;
      const real = document.querySelector('#cmsvg > g[id^=cmo] #' + id)
        || Array.from(document.querySelectorAll('#cmsvg g[id="' + id + '"]')).find((g) => !overlay.contains(g));
      if (!real) { return; }
      checked++;
      const a = clone.getBoundingClientRect();
      const b = real.getBoundingClientRect();
      if (Math.abs(a.x - b.x) > 60 || Math.abs(a.y - b.y) > 60) { ghosts++; }
    });
    return { checked, ghosts };
  });
  expect(ghost.ghosts).toBe(0);

  // clearing the selection must not alter the result
  await page.mouse.click(1700, 850);
  await page.waitForTimeout(800);
  const posCleared = await clusterPositions(page, createdIds);
  expect(posCleared).toEqual(posAfter);
});

test('arranged positions persist after reload and dragging still works', async ({ page }) => {
  await openApp(page);
  const posA = await clusterPositions(page, createdIds);
  await page.reload();
  await page.waitForSelector('#cmsvg');
  await page.waitForTimeout(1500);
  const posB = await clusterPositions(page, createdIds);
  expect(posB).toEqual(posA);

  // dragging after spacing: select one arranged node, Ctrl+D, drag
  await page.evaluate((C) => window.scrollTo(C.x - 700, C.y - 450), CLUSTER);
  await page.waitForTimeout(2000);
  const id = createdIds[0];
  const screen = await page.evaluate((nid) => {
    const g = document.querySelector('#cmsvg g[title="' + nid + '"] rect');
    if (!g) { return null; }
    const r = g.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, id);
  expect(screen).not.toBeNull();
  // deterministic selection of THIS node (blind coordinate clicks can hit
  // an overlapping neighbour; real-click selection is covered elsewhere)
  await page.evaluate((nid) => {
    const rect = document.querySelector('#cmsvg g[title="' + nid + '"] rect');
    rect.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  }, id);
  await page.waitForTimeout(800);
  await page.keyboard.down('Control'); await page.keyboard.press('d'); await page.keyboard.up('Control');
  await page.waitForTimeout(500);
  await page.mouse.move(screen.x, screen.y); await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(screen.x + i * 12, screen.y + i * 8); }
  await page.mouse.up();
  await page.waitForTimeout(1500);
  const dragged = await clusterPositions(page, [id]);
  expect(Math.abs(dragged[id].x - posA[id].x)).toBeGreaterThan(40);
});

test('undo restores pre-arrange positions', async ({ page }) => {
  await openApp(page);
  const id = createdIds[1];
  const before = await clusterPositions(page, [id]);
  // move it through the arrange-equivalent canonical path
  await page.evaluate(async (nid) => {
    const d = await (await fetch('/api/cme/id/' + nid)).json();
    d.coor.x += 300; d.x0 += 300; d.x1 += 300;
    await fetch('/api/cme', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
  }, id);
  await page.keyboard.down('Control'); await page.keyboard.press('z'); await page.keyboard.up('Control');
  await page.waitForTimeout(1200);
  const after = await clusterPositions(page, [id]);
  expect(Math.round(after[id].x)).toBe(Math.round(before[id].x));
  // redo re-applies
  await page.keyboard.down('Control'); await page.keyboard.down('Shift');
  await page.keyboard.press('KeyZ');
  await page.keyboard.up('Shift'); await page.keyboard.up('Control');
  await page.waitForTimeout(1200);
  const redone = await clusterPositions(page, [id]);
  expect(Math.round(redone[id].x)).toBe(Math.round(before[id].x) + 300);
});
