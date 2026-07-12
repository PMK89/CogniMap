'use strict';

/**
 * 3D benchmark: generates deterministic synthetic maps (100/500/2000/5000
 * nodes), measures layout cost in Node, then loads each map in a real
 * browser and measures initial 3D render time and orbit frame rate.
 *
 * Usage: node scripts/benchmark3d.js
 * Results are printed as a markdown table (docs/performance).
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const core = require('../src/app/graph3d/graph3d-core');

const SIZES = [100, 500, 2000, 5000];

/** deterministic synthetic map: branching tree + 10% cross links */
function makeMap(n) {
  const docs = [];
  const mk = (id, x, y, links) => ({
    _id: 'bench' + id, // NeDB drops raw file lines without an _id
    id, coor: { x, y }, x0: x, y0: y, x1: x + 80, y1: y + 20,
    title: 'Node ' + id, types: ['a', 'a', 'b'], cat: [], prio: 10,
    cdate: 1600000000000 + id, vdate: 1600000000000 + id, state: '',
    // pre-rendered svg like every real document — without it the legacy
    // 2D canvas runs its slow shape-creation + persist path per node
    prep: `<rect x="${x}" y="${y}" width="80" height="20" rx="5" ry="5" fill="#ffffff" id="cms${id}" stroke="#7a8bd4" style="opacity: 1; stroke-width: 2;"/><text x="${x + 4}" y="${y + 14}" fill="#000000" id="title${id}" title="${id}" style="font-size: 14px;">Node ${id}</text>`,
    prep1: '',
    cmobject: JSON.stringify({ content: [], meta: [], links,
      style: { object: { color0: '#ffffff', color1: '#7a8bd4', weight: 2, trans: 1, str: '',
                         class_array: [], num_array: [] },
               title: { size: 16, font: 'Arial', color: '#000000', deco: 'none', class_array: [] } } }),
  });
  for (let i = 1; i <= n; i++) {
    const links = [];
    if (i > 1) {
      const parent = Math.max(1, Math.floor(i / 3));
      links.push({ id: -(parent * 100000 + i), targetId: parent, weight: 1, start: false, con: 'e' });
    }
    // deterministic cross links for ~10% of nodes
    if (i % 10 === 0 && i > 20) {
      links.push({ id: -(90000000 + i), targetId: i - 17, weight: 0, start: true, con: 'e' });
    }
    const x = 220000 + (i % 50) * 160;
    const y = 200000 + Math.floor(i / 50) * 120;
    docs.push(mk(i, x, y, links));
  }
  // add parent->child forward entries
  const byId = new Map(docs.map((d) => [d.id, d]));
  for (const d of docs) {
    const c = JSON.parse(d.cmobject);
    for (const l of c.links.slice()) {
      if (l.start === false) {
        const p = byId.get(l.targetId);
        const pc = JSON.parse(p.cmobject);
        pc.links.push({ id: l.id, targetId: d.id, weight: 1, start: true, con: 'e' });
        p.cmobject = JSON.stringify(pc);
      }
    }
  }
  return docs;
}

async function browserBench(port, label) {
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.addInitScript(() => localStorage.setItem('cognimap-3d', '1'));
  const t0 = Date.now();
  await page.goto('http://127.0.0.1:' + port);
  await page.waitForSelector('#cmap3d canvas', { timeout: 60000 });
  // wait until node meshes exist
  await page.waitForFunction(() => {
    try {
      const inst = window['ng'].probe(document.querySelector('app-cmap3d')).componentInstance;
      return inst.scene['nodeMeshes'].size > 0;
    } catch (e) { return false; }
  }, null, { timeout: 60000 });
  const renderMs = Date.now() - t0;
  const meshes = await page.evaluate(() => {
    const inst = window['ng'].probe(document.querySelector('app-cmap3d')).componentInstance;
    inst.scene.frameAll();
    return inst.scene['nodeMeshes'].size;
  });
  // measure fps while orbiting for 3 seconds
  const fps = await page.evaluate(() => new Promise((res) => {
    const inst = window['ng'].probe(document.querySelector('app-cmap3d')).componentInstance;
    let frames = 0;
    const t1 = performance.now();
    const orig = inst.scene['renderer'].render.bind(inst.scene['renderer']);
    inst.scene['renderer'].render = (...a) => { frames++; return orig(...a); };
    // synthetic orbit: rotate the camera around the target continuously
    const iv = setInterval(() => {
      const cam = inst.scene['camera'];
      const t = inst.scene['controls'].target;
      const dx = cam.position.x - t.x;
      const dz = cam.position.z - t.z;
      const a = 0.06;
      cam.position.x = t.x + dx * Math.cos(a) - dz * Math.sin(a);
      cam.position.z = t.z + dx * Math.sin(a) + dz * Math.cos(a);
      cam.lookAt(t);
      inst.scene.requestRender();
    }, 16);
    setTimeout(() => {
      clearInterval(iv);
      res(Math.round(frames / ((performance.now() - t1) / 1000)));
    }, 3000);
  }));
  const mem = await page.evaluate(() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1));
  await browser.close();
  return { label, renderMs, meshes, fps, memMB: mem };
}

(async () => {
  const results = [];
  for (const n of SIZES) {
    const docs = makeMap(n);
    // layout timing (node side)
    const layouts = {};
    for (const preset of ['layered-depth', 'radial-tree', 'spherical', 'force-3d']) {
      const t = Date.now();
      core.computeLayout(docs, preset);
      layouts[preset] = Date.now() - t;
    }
    // write a temp data dir with this map and serve it
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-bench-'));
    for (const f of ['settings.json', 'colors.json', 'buttons.json', 'templates.json', 'spechars.json', 'quizes.json']) {
      fs.copyFileSync(path.join(__dirname, '..', 'server', 'test', 'fixtures', 'data', f), path.join(dir, f));
    }
    // aim the viewport at the synthetic map and make settings valid
    const settings = JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8'));
    settings[0].coor = { x: 223000, y: 201000 };
    settings[0].mode = 'view';
    settings[0].widget0 = 'none'; settings[0].widget1 = 'none';
    fs.writeFileSync(path.join(dir, 'settings.json'), JSON.stringify(settings));
    fs.writeFileSync(path.join(dir, 'cme.db'), docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
    const port = 3400 + SIZES.indexOf(n);
    const server = spawn('node', ['server/index.js'], {
      cwd: path.join(__dirname, '..'),
      env: Object.assign({}, process.env, { PORT: String(port), COGNIMAP_DATA_DIR: dir }),
      stdio: 'ignore',
    });
    await new Promise((r) => setTimeout(r, 2500));
    try {
      const bench = await browserBench(port, n + ' nodes');
      bench.layouts = layouts;
      results.push(bench);
      console.log(JSON.stringify(bench));
    } finally {
      server.kill();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  console.log('\n| Map | scene nodes | initial render | orbit FPS | JS heap | layered | radial | spherical | force-3d |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.label} | ${r.meshes} | ${r.renderMs} ms | ${r.fps} | ${r.memMB} MB | ${r.layouts['layered-depth']} ms | ${r.layouts['radial-tree']} ms | ${r.layouts['spherical']} ms | ${r.layouts['force-3d']} ms |`);
  }
})();
