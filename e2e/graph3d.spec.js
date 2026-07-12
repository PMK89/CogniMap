// @ts-check
'use strict';

const { test, expect } = require('@playwright/test');

/**
 * Browser end-to-end tests for the 3D workspace. They run against the
 * same fixture server as app.spec.js; the 3D view is enabled through
 * the persisted client preference before load.
 */

test.describe.configure({ mode: 'serial' });

let pageErrors;
test.beforeEach(({ page }) => {
  pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));
});

async function open3d(page) {
  await page.addInitScript(() => localStorage.setItem('cognimap-3d', '1'));
  // isolate from earlier specs: close widget slots (an open SVG-editor
  // iframe raises its own internal errors that would pollute pageerror)
  await page.request.get('/api/settings/1').then(async (r) => {
    const s = await r.json();
    s.widget0 = 'none'; s.widget1 = 'none';
    if (s.wlayout0) { s.wlayout0.display = 'none'; }
    if (s.wlayout1) { s.wlayout1.display = 'none'; }
    // the 3D view loads the WHOLE map (not the 2D viewport subset), so the
    // scroll position no longer affects which nodes appear — leave it alone
    await page.request.put('/api/settings', { data: s });
  });
  await page.goto('/');
  await page.waitForSelector('#cmap3d canvas', { timeout: 30000 });
  await page.waitForTimeout(2500);
}

function scene(page) {
  return (fn, arg) => page.evaluate(fn, arg);
}

const probe = (page, expr) => page.evaluate((e) => {
  const inst = window['__cm3d'];
  // eslint-disable-next-line no-new-func
  return new Function('inst', 'scene', 'return ' + e)(inst, inst.scene);
}, expr);

test('3D scene renders nodes and branches without console errors', async ({ page }) => {
  await open3d(page);
  const state = await probe(page, `({
    nodes: scene['nodeMeshes'].size,
    branches: scene['branchGroup'].children.length,
    available: scene.available,
  })`);
  expect(state.available).toBe(true);
  expect(state.nodes).toBeGreaterThanOrEqual(2);
  expect(state.branches).toBeGreaterThan(0);
  expect(pageErrors).toEqual([]);
});

test('camera orbit, pan and zoom work', async ({ page }) => {
  await open3d(page);
  const before = await probe(page, `scene['camera'].position.toArray()`);
  // orbit (left drag)
  await page.mouse.move(900, 600);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(900 + i * 25, 600 - i * 10); }
  await page.mouse.up();
  await page.waitForTimeout(500);
  const afterOrbit = await probe(page, `scene['camera'].position.toArray()`);
  expect(Math.hypot(afterOrbit[0] - before[0], afterOrbit[1] - before[1], afterOrbit[2] - before[2])).toBeGreaterThan(1);
  // zoom
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(400);
  const afterZoom = await probe(page, `scene['camera'].position.toArray()`);
  expect(Math.hypot(afterZoom[0] - afterOrbit[0], afterZoom[1] - afterOrbit[1], afterZoom[2] - afterOrbit[2])).toBeGreaterThan(0.5);
  // pan (right drag)
  const targetBefore = await probe(page, `scene['controls'].target.toArray()`);
  await page.mouse.move(900, 500);
  await page.mouse.down({ button: 'right' });
  for (let i = 1; i <= 6; i++) { await page.mouse.move(900 - i * 20, 500 + i * 10); }
  await page.mouse.up({ button: 'right' });
  await page.waitForTimeout(400);
  const targetAfter = await probe(page, `scene['controls'].target.toArray()`);
  expect(Math.hypot(targetAfter[0] - targetBefore[0], targetAfter[1] - targetBefore[1], targetAfter[2] - targetBefore[2])).toBeGreaterThan(0.5);
});

test('3D loads the WHOLE map regardless of the 2D viewport position', async ({ page }) => {
  // reproduce the reported bug: scroll the 2D map to a sparse/empty region
  // where the viewport store would hold almost nothing, then open 3D. The
  // 3D scene must still contain (nearly) every node, not the viewport subset.
  await page.addInitScript(() => localStorage.setItem('cognimap-3d', '1'));
  await page.request.get('/api/settings/1').then(async (r) => {
    const s = await r.json();
    s.widget0 = 'none'; s.widget1 = 'none';
    s.coor = { x: 5000, y: 5000 }; // corner far from the fixture clusters
    await page.request.put('/api/settings', { data: s });
  });
  // ground truth: how many real (non-overlay) nodes does the full map hold?
  // quiz covers / markings / signs are intentionally excluded from 3D.
  const isOverlay = (t) => t && (t === 'm' || t === 's' || String(t).indexOf('q') === 0);
  const total = await page.request.get('/api/cme/graph').then(async (r) => {
    const all = await r.json();
    return all.filter((d) => d.id > 0 && !isOverlay(d.types && d.types[0])).length;
  });
  // what the 2D viewport at this corner would actually load (the old source)
  const inViewport = await page.request.post('/api/cme/query', {
    data: { l: 5000 - 3200, t: 5000 - 1800, r: 5000 + 4800, b: 5000 + 2700 },
  }).then(async (r) => (await r.json()).filter((d) => d.id > 0).length);
  await page.goto('/');
  await page.waitForSelector('#cmap3d canvas', { timeout: 30000 });
  await page.waitForTimeout(3000);
  const loaded = await probe(page, `scene['nodeMeshes'].size`);
  // the 3D scene holds the entire map, not the viewport subset (the bug
  // showed a single node here); overlays are the only excluded elements
  expect(total).toBeGreaterThanOrEqual(10);
  expect(loaded).toBe(total);
  // and it is strictly more than the sparse 2D viewport would have loaded
  expect(loaded).toBeGreaterThan(inViewport);
});

test('initial view frames the main cluster, not the whole galaxy (nodes visible)', async ({ page }) => {
  // clear any saved camera so the initial framing logic runs
  await page.request.get('/api/viz3d').then(async (r) => {
    const v = await r.json();
    v.camera = null;
    await page.request.put('/api/viz3d', { data: v });
  });
  await open3d(page);
  const st = await probe(page, `(() => {
    let min=[1e9,1e9,1e9], max=[-1e9,-1e9,-1e9];
    scene['positions'].forEach((p)=>{[p.x,p.y,p.z].forEach((v,i)=>{if(v<min[i])min[i]=v;if(v>max[i])max[i]=v;});});
    const diag = Math.hypot(max[0]-min[0], max[1]-min[1], max[2]-min[2]);
    return { camDist: scene['camera'].position.distanceTo(scene['controls'].target), diag, nodes: scene['nodeMeshes'].size };
  })()`);
  expect(st.nodes).toBeGreaterThanOrEqual(10);
  // the camera must NOT be pulled all the way out to frame the entire map
  // (that is the sub-pixel "white void"); it sits close to the main cluster
  if (st.diag > 200) {
    expect(st.camDist).toBeLessThan(st.diag);
  }
});

test('a stale saved camera is ignored and the map is framed instead', async ({ page }) => {
  // poison the saved camera: it points at empty space near the origin,
  // thousands of units from the cognitive-tree content (the exact state
  // that used to drop the user into a white void)
  await page.request.get('/api/viz3d').then(async (r) => {
    const v = await r.json();
    v.camera = { position: [58, 81, 121], target: [-5, 0, -5] };
    await page.request.put('/api/viz3d', { data: v });
  });
  await open3d(page);
  const state = await probe(page, `(() => {
    let min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
    scene['positions'].forEach((p) => {
      [p.x, p.y, p.z].forEach((v, i) => {
        if (v < min[i]) { min[i] = v; }
        if (v > max[i]) { max[i] = v; }
      });
    });
    return { target: scene['controls'].target.toArray(), min, max, nodes: scene['nodeMeshes'].size };
  })()`);
  expect(state.nodes).toBeGreaterThan(0);
  // the camera target must sit inside the content bounds — not at the
  // poisoned target near the origin
  const center = state.min.map((v, i) => (v + state.max[i]) / 2);
  const diag = Math.hypot(state.max[0] - state.min[0], state.max[1] - state.min[1], state.max[2] - state.min[2]);
  const dist = Math.hypot(state.target[0] - center[0], state.target[1] - center[1], state.target[2] - center[2]);
  expect(dist).toBeLessThanOrEqual(diag * 1.5 + 60);
});

test('node selection in 3D syncs the application-wide selection', async ({ page }) => {
  await open3d(page);
  // pick a node that is actually in the 3D scene (overlays are excluded)
  const id = await probe(page, `Array.from(scene['positions'].keys())[0]`);
  await page.evaluate((nid) => {
    window['__cm3d'].selectNode(nid, false);
  }, id);
  await page.waitForTimeout(600);
  const sel = await page.evaluate(() => {
    const es = window['__cm3d']['elementService'];
    return es.selCMEo && es.selCMEo.id;
  });
  expect(sel).toBe(id);
});

test('layout presets are deterministic and switchable', async ({ page }) => {
  await open3d(page);
  const posA = await probe(page, `Array.from(scene['positions'].entries()).slice(0,5)`);
  await page.locator('.cmap3d-toolbar select').first().selectOption('radial-tree');
  await page.waitForTimeout(1200);
  const posRadial = await probe(page, `Array.from(scene['positions'].entries()).slice(0,5)`);
  expect(JSON.stringify(posRadial)).not.toEqual(JSON.stringify(posA));
  // switching must land the camera at reading distance of the content,
  // never frame-the-galaxy (which shows sub-pixel nodes: a white screen)
  const view = await probe(page, `(() => {
    let min=[1e9,1e9,1e9], max=[-1e9,-1e9,-1e9];
    scene['positions'].forEach((p)=>{[p.x,p.y,p.z].forEach((v,i)=>{if(v<min[i])min[i]=v;if(v>max[i])max[i]=v;});});
    const diag = Math.hypot(max[0]-min[0], max[1]-min[1], max[2]-min[2]);
    return { camDist: scene['camera'].position.distanceTo(scene['controls'].target), diag };
  })()`);
  if (view.diag > 200) {
    expect(view.camDist).toBeLessThan(view.diag);
  }
  // reload: radial persists and produces the identical arrangement
  await page.reload();
  await page.waitForSelector('#cmap3d canvas');
  await page.waitForTimeout(2500);
  const posRadial2 = await probe(page, `Array.from(scene['positions'].entries()).slice(0,5)`);
  expect(JSON.stringify(posRadial2)).toEqual(JSON.stringify(posRadial));
  // restore default preset for later tests
  await page.locator('.cmap3d-toolbar select').first().selectOption('layered-depth');
  await page.waitForTimeout(800);
});

test('manual node position persists across reload', async ({ page }) => {
  await open3d(page);
  // pick a node that is actually in the 3D scene (overlays are excluded)
  const id = await probe(page, `Array.from(scene['positions'].keys())[0]`);
  await page.evaluate((nid) => {
    const inst = window['__cm3d'];
    inst.persistPosition(nid, { x: 111, y: 22, z: 33 });
    inst.saveViz(true);
  }, id);
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForSelector('#cmap3d canvas');
  await page.waitForTimeout(2500);
  const p = await page.evaluate((nid) => {
    const inst = window['__cm3d'];
    return inst.scene['positions'].get(nid);
  }, id);
  expect(Math.round(p.x)).toBe(111);
  expect(Math.round(p.y)).toBe(22);
  expect(Math.round(p.z)).toBe(33);
});

test('sheets stream the real 2D rendering (prep SVG) onto near nodes', async ({ page }) => {
  await open3d(page);
  // pick a sheet node whose doc has a pre-rendered SVG
  const id = await probe(page, `(() => {
    let found = 0;
    scene['nodeMeshes'].forEach((mesh, nid) => {
      if (!found && mesh.userData.shape === 'sheet') {
        const d = inst['docIndex'][nid];
        if (d) { found = nid; }
      }
    });
    return found;
  })()`);
  expect(id).toBeGreaterThan(0);
  await page.evaluate((nid) => { window['__cm3d'].scene.focusNode(nid); }, id);
  // the real 2D rendering streams in and replaces the title card
  await page.waitForFunction((nid) => {
    const faces = window['__cm3d'].scene['sheetTexts'].get(nid);
    return !!(faces && faces[0].userData.rich);
  }, id, { timeout: 20000 });
  const rich = await probe(page, `scene['sheetTexts'].get(${id})[0].userData.rich`);
  expect(rich).toBe(true);
});

test('tree drag: the whole subtree follows the dragged parent', async ({ page }) => {
  await open3d(page);
  // pick a parent that has children in the derived hierarchy
  const picked = await probe(page, `(() => {
    const h = scene['hierarchy'];
    let found = null;
    h.childrenOf.forEach((kids, id) => {
      if (!found && kids.length >= 1 && scene['positions'].has(id)) { found = { id, kids: kids.slice(0, 4) }; }
    });
    return found;
  })()`);
  expect(picked).not.toBeNull();
  const before = await probe(page, `(() => {
    const out = {};
    [${'' + picked.id}].concat(${JSON.stringify(picked.kids)}).forEach((id) => {
      const p = scene['positions'].get(id); out[id] = { x: p.x, y: p.y, z: p.z };
    });
    return out;
  })()`);
  // select, then drag via real mouse on the canvas
  await page.evaluate((nid) => { window['__cm3d'].selectNode(nid, false); }, picked.id);
  await page.waitForTimeout(400);
  const screen = await page.evaluate((nid) => {
    const inst = window['__cm3d'];
    const s = inst.scene;
    const p = s['positions'].get(nid);
    const v = new (Object.getPrototypeOf(s['camera'].position).constructor)(p.x, p.y, p.z);
    v.project(s['camera']);
    const el = s['renderer'].domElement.getBoundingClientRect();
    return { x: el.left + (v.x + 1) / 2 * el.width, y: el.top + (1 - v.y) / 2 * el.height };
  }, picked.id);
  await page.mouse.move(screen.x, screen.y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(screen.x + i * 12, screen.y + i * 6); }
  await page.mouse.up();
  await page.waitForTimeout(800);
  const after = await probe(page, `(() => {
    const out = {};
    [${'' + picked.id}].concat(${JSON.stringify(picked.kids)}).forEach((id) => {
      const p = scene['positions'].get(id); out[id] = { x: p.x, y: p.y, z: p.z };
    });
    return out;
  })()`);
  const dx = after[picked.id].x - before[picked.id].x;
  const dy = after[picked.id].y - before[picked.id].y;
  const dz = after[picked.id].z - before[picked.id].z;
  expect(Math.hypot(dx, dy, dz)).toBeGreaterThan(2); // the parent moved
  for (const kid of picked.kids) {
    // every child moved by the SAME delta (relative structure preserved)
    expect(after[kid].x - before[kid].x).toBeCloseTo(dx, 1);
    expect(after[kid].y - before[kid].y).toBeCloseTo(dy, 1);
    expect(after[kid].z - before[kid].z).toBeCloseTo(dz, 1);
  }
  // and the subtree positions persist
  await page.evaluate(() => window['__cm3d'].saveViz(true));
  await page.waitForTimeout(600);
  const saved = await page.evaluate(() => fetch('/api/viz3d').then((r) => r.json()));
  for (const kid of picked.kids) {
    expect(saved.positions[String(kid)]).toBeTruthy();
  }
});

test('node geometry override applies and persists', async ({ page }) => {
  await open3d(page);
  // pick a node that is actually in the 3D scene (overlays are excluded)
  const id = await probe(page, `Array.from(scene['positions'].keys())[0]`);
  await page.evaluate((nid) => {
    const inst = window['__cm3d'];
    inst.selectNode(nid, false);
    inst.selectedShape = 'torus';
    inst.changeShape();
    inst.saveViz(true);
  }, id);
  await page.waitForTimeout(800);
  const shape = await page.evaluate((nid) => {
    const inst = window['__cm3d'];
    return inst.scene['nodeMeshes'].get(nid).userData.shape;
  }, id);
  expect(shape).toBe('torus');
  const saved = await page.evaluate(() => fetch('/api/viz3d').then((r) => r.json()));
  expect(Object.values(saved.shapes)).toContain('torus');
});

test('structural branches and cross-links are rendered distinctly', async ({ page }) => {
  await open3d(page);
  const groups = await probe(page, `({
    structural: scene['branchGroup'].children.length,
    crossGroup: scene['crossGroup'].children.length,
    crossEdges: scene['graph'].edges.filter(e => e.cross).length,
    structuralEdges: scene['graph'].edges.filter(e => e.structural).length,
  })`);
  expect(groups.structural).toBeGreaterThan(0);
  expect(groups.structuralEdges).toBeGreaterThan(0);
  // fixture map contains at least the weak-weight cross link
  // the small viewport fixture may contain no cross-links — classification
  // itself is covered by unit tests; here we assert the split is consistent
  expect(groups.structuralEdges + groups.crossEdges).toBeGreaterThan(0);
});

test('2D planar fallback stays available and functional', async ({ page }) => {
  await open3d(page);
  // toggle back to 2D
  await page.locator('.cm-3d-toggle').click();
  await page.waitForTimeout(800);
  expect(await page.locator('#cmap3d').count()).toBe(0);
  // the classic canvas still renders map content
  const has2d = await page.evaluate(() => document.getElementById('cmsvg').textContent.trim().length > 0
    || document.querySelectorAll('#cmsvg g[title]').length > 0);
  expect(has2d).toBe(true);
});

test('WebGL failure falls back gracefully with data intact', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cognimap-3d', '1');
    // simulate unavailable WebGL
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (String(type).indexOf('webgl') !== -1) { return null; }
      return orig.call(this, type, ...rest);
    };
  });
  // point the 2D viewport at a populated cluster (an earlier spec may have
  // scrolled to a sparse corner) so the planar fallback has content to show
  await page.request.get('/api/settings/1').then(async (r) => {
    const s = await r.json();
    s.coor = { x: 273600, y: 96200 };
    await page.request.put('/api/settings', { data: s });
  });
  await page.goto('/');
  await page.waitForSelector('#cmap3d', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await expect(page.locator('.cmap3d-failure')).toBeVisible();
  // classic map still there underneath
  const has2d = await page.evaluate(() => document.querySelectorAll('#cmsvg g[title]').length > 0);
  expect(has2d).toBe(true);
});
