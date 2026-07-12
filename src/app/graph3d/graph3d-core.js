'use strict';

/**
 * graph3d-core — pure graph logic for the 3D visualization.
 *
 * Deliberately framework- and renderer-free (CommonJS) so it can be
 * unit-tested with `node --test` and reused if the renderer is swapped.
 *
 * Responsibilities:
 *  - build a graph view from legacy concept-map documents
 *  - classify links into structural branches vs cross-links
 *  - derive a deterministic hierarchy (multi-parent, cyclic and
 *    disconnected graphs are supported; every original link is kept)
 *  - deterministic layout presets
 *
 * The legacy document model: objects (id > 0) carry cmobject.links
 * [{ id: <link doc id>, targetId, weight, start, con }]; link documents
 * (id < 0) carry endpoint ids (id0/id1). `start: true` means the link
 * starts at this node (points to the target), weight 0 marks weak
 * "border" references.
 */

/** Parse a legacy doc's cmobject whether serialized or not. */
function cmo(doc) {
  if (!doc || doc.cmobject === undefined || doc.cmobject === null) return {};
  if (typeof doc.cmobject === 'string') {
    try {
      return JSON.parse(doc.cmobject);
    } catch (err) {
      return {};
    }
  }
  return doc.cmobject;
}

/**
 * Build the graph view.
 * @param {Array} docs legacy documents (mixed objects and links)
 * @returns {{nodes: Map, edges: Array, nodeList: Array}}
 *  edges: { linkId, source, target, weight, directed, cross, doc }
 */
/**
 * Quiz covers ('q'/'q1'), markings ('m') and signs ('s') are 2D overlay
 * artifacts glued over another element via weight -1 pseudo-links — they
 * hide elements for spaced repetition and are not knowledge nodes. In 3D
 * they must neither appear as nodes nor distort the tree as fake children.
 */
function isOverlayDoc(d) {
  const t = d && d.types && d.types[0] ? String(d.types[0]) : '';
  return t === 'm' || t === 's' || t.indexOf('q') === 0;
}

function buildGraph(docs) {
  const nodes = new Map();
  const linkDocs = new Map();
  for (const d of docs) {
    if (!d || typeof d.id !== 'number') continue;
    if (d.id > 0) { if (!isOverlayDoc(d)) nodes.set(d.id, d); }
    else linkDocs.set(d.id, d);
  }
  // collect edges from node link metadata (authoritative for direction)
  const seen = new Set();
  const edges = [];
  for (const node of nodes.values()) {
    const links = cmo(node).links || [];
    for (const l of links) {
      if (!l || typeof l.targetId !== 'number') continue;
      // id-0 links are attachment/parentage metadata (quiz covers,
      // markings, creation parentage), never knowledge edges — real links
      // always carry the id of their link document. NOTE: ordinary links
      // use weight -1 in real data, so weight cannot discriminate here.
      if (!l.id) continue;
      if (!nodes.has(l.targetId)) continue;
      const a = node.id;
      const b = l.targetId;
      const key = l.id !== 0 && l.id !== undefined ? 'L' + l.id : 'P' + Math.min(a, b) + ':' + Math.max(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      const source = l.start === false ? b : a;
      const target = l.start === false ? a : b;
      edges.push({
        linkId: typeof l.id === 'number' ? l.id : 0,
        source,
        target,
        weight: typeof l.weight === 'number' ? l.weight : 1,
        directed: l.start !== undefined,
        doc: linkDocs.get(l.id),
        cross: false,
      });
    }
  }
  return { nodes, edges, nodeList: Array.from(nodes.values()).sort((a, b) => a.id - b.id) };
}

/** Union-find connected components over ALL edges. */
function connectedComponents(graph) {
  const parent = new Map();
  const find = (x) => {
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r);
    let c = x;
    while (parent.get(c) !== c) {
      const n = parent.get(c);
      parent.set(c, r);
      c = n;
    }
    return r;
  };
  for (const id of graph.nodes.keys()) parent.set(id, id);
  for (const e of graph.edges) {
    const a = find(e.source);
    const b = find(e.target);
    if (a !== b) parent.set(a, b);
  }
  const comps = new Map();
  for (const id of graph.nodes.keys()) {
    const r = find(id);
    if (!comps.has(r)) comps.set(r, []);
    comps.get(r).push(id);
  }
  // deterministic ordering: components sorted by their smallest node id
  return Array.from(comps.values())
    .map((ids) => ids.sort((a, b) => a - b))
    .sort((a, b) => a[0] - b[0]);
}

/**
 * Derive the hierarchy: pick a root per component (highest structural
 * out-degree, ties broken by smallest id — deterministic), BFS along
 * directed weight!==0 edges preferentially, then any remaining edges.
 * Edges that join two already-placed nodes become cross-links; tree
 * edges are structural. Cycles therefore work naturally: the extra
 * cycle-closing edge is classified as a cross-link, no link is lost.
 *
 * @returns {{ depth: Map, parentOf: Map, childrenOf: Map, roots: Array }}
 */
function deriveHierarchy(graph) {
  const comps = connectedComponents(graph);
  const out = new Map();
  const adj = new Map();
  for (const id of graph.nodes.keys()) {
    out.set(id, 0);
    adj.set(id, []);
  }
  for (const e of graph.edges) {
    // strong edges dominate hierarchy; weak (weight 0) are cross by nature
    const strong = e.weight !== 0;
    if (strong) out.set(e.source, (out.get(e.source) || 0) + 1);
    adj.get(e.source).push({ to: e.target, edge: e, strong, forward: true });
    adj.get(e.target).push({ to: e.source, edge: e, strong, forward: false });
  }
  const depth = new Map();
  const parentOf = new Map();
  const childrenOf = new Map();
  const roots = [];
  for (const id of graph.nodes.keys()) childrenOf.set(id, []);

  for (const comp of comps) {
    // root: max strong out-degree, tie -> smallest id
    let root = comp[0];
    for (const id of comp) {
      if ((out.get(id) || 0) > (out.get(root) || 0)) root = id;
      else if ((out.get(id) || 0) === (out.get(root) || 0) && id < root) root = id;
    }
    roots.push(root);
    depth.set(root, 0);
    // rank-layered BFS: exhaust strong forward (parent->child) edges
    // before falling back to strong backward edges, and only then weak
    // edges — so hierarchy follows authoring direction wherever possible
    const rankOf = (n) => (n.strong && n.forward ? 0 : n.strong ? 1 : 2);
    const queues = [[], [], []];
    const enqueueNeighbors = (cur) => {
      const neigh = adj.get(cur).slice().sort((a, b) => rankOf(a) - rankOf(b) || a.to - b.to);
      for (const n of neigh) {
        if (!depth.has(n.to)) {
          queues[rankOf(n)].push({ from: cur, n });
        }
      }
    };
    enqueueNeighbors(root);
    for (;;) {
      let item = null;
      if (queues[0].length) item = queues[0].shift();
      else if (queues[1].length) item = queues[1].shift();
      else if (queues[2].length) item = queues[2].shift();
      else break;
      const { from, n } = item;
      if (depth.has(n.to)) continue; // reached earlier via a better rank
      depth.set(n.to, depth.get(from) + 1);
      parentOf.set(n.to, from);
      childrenOf.get(from).push(n.to);
      n.edge.cross = false;
      n.edge.structural = true;
      enqueueNeighbors(n.to);
    }
  }
  // any edge that is not a tree edge is a cross-link; weak edges always are
  for (const e of graph.edges) {
    const isTree = parentOf.get(e.target) === e.source || parentOf.get(e.source) === e.target;
    e.cross = !isTree || e.weight === 0;
    e.structural = !e.cross;
  }
  // deterministic child order
  for (const kids of childrenOf.values()) kids.sort((a, b) => a - b);
  return { depth, parentOf, childrenOf, roots, components: comps };
}

/** subtree sizes (structural tree only) */
function subtreeSizes(h) {
  const size = new Map();
  const calc = (id) => {
    if (size.has(id)) return size.get(id);
    let s = 1;
    for (const c of h.childrenOf.get(id) || []) s += calc(c);
    size.set(id, s);
    return s;
  };
  for (const r of h.roots) calc(r);
  return size;
}

/** deterministic pseudo-random in [0,1) from a node id */
function hash01(id, salt) {
  let x = (id * 2654435761 + (salt || 0) * 40503) >>> 0;
  x ^= x >> 13;
  x = (x * 1274126177) >>> 0;
  return (x >>> 8) / 16777216;
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * Layout presets. All return Map<id, {x,y,z}> in scene units and are
 * fully deterministic for identical input.
 * Legacy 2D coordinates land on the XZ plane (2D y -> scene z) so the
 * user's spatial memory of the map is preserved; scene y is "height".
 */
// legacy px -> scene units. Node geometry is ~6-8 units wide while typical
// 2D spacing is ~100px; at 1/40 that mapped to 2.5 units — nodes physically
// overlapped and collision relaxation packed them into a solid wall. 1/12
// maps 100px to ~8.3 units: real 2D spacing clears real node size.
const SCALE = 1 / 12;

function centerOf(graph, ids) {
  let cx = 0;
  let cz = 0;
  let n = 0;
  for (const id of ids) {
    const d = graph.nodes.get(id);
    if (d && d.coor) {
      cx += d.coor.x;
      cz += d.coor.y;
      n++;
    }
  }
  return n ? { x: cx / n, z: cz / n } : { x: 0, z: 0 };
}

function layoutLegacyPlanar(graph) {
  const pos = new Map();
  for (const d of graph.nodeList) {
    pos.set(d.id, {
      x: (d.coor ? d.coor.x : 0) * SCALE,
      y: 0,
      z: (d.coor ? d.coor.y : 0) * SCALE,
    });
  }
  return pos;
}

function layoutLayeredDepth(graph, h) {
  // keep legacy XZ, lift by hierarchy depth
  const pos = layoutLegacyPlanar(graph);
  for (const [id, p] of pos) {
    const d = h.depth.get(id) || 0;
    p.y = -d * 14;
  }
  return pos;
}

/** recursive angular allocation for radial-like layouts */
function radialAssign(h, sizes, root, cx, cz, a0, a1, ringStep, pos, depthY, shell) {
  const stack = [{ id: root, a0, a1, depth: 0 }];
  while (stack.length) {
    const { id, a0: s0, a1: s1, depth } = stack.pop();
    const mid = (s0 + s1) / 2;
    const r = depth * ringStep;
    const y = depthY ? depthY(depth, id) : 0;
    const rr = shell ? shell(depth) : r;
    pos.set(id, {
      x: cx + Math.cos(mid) * rr,
      y,
      z: cz + Math.sin(mid) * rr,
    });
    const kids = h.childrenOf.get(id) || [];
    if (!kids.length) continue;
    const total = kids.reduce((s, k) => s + sizes.get(k), 0);
    let acc = s0;
    for (const k of kids) {
      const span = ((s1 - s0) * sizes.get(k)) / total;
      stack.push({ id: k, a0: acc, a1: acc + span, depth: depth + 1 });
      acc += span;
    }
  }
}

/**
 * Ring/shell radius must grow with how many nodes share a depth: a fixed
 * step packs thousands of nodes of a large map onto one circle — the
 * "solid wall". The multiplier is 1 for small maps and grows with the
 * square root of the crowd so the circumference keeps pace.
 */
function crowdFactor(h) {
  const count = {};
  h.depth.forEach((d) => { count[d] = (count[d] || 0) + 1; });
  return (depth) => Math.max(1, Math.sqrt((count[depth] || 1) / 60));
}

function layoutRadialTree(graph, h) {
  const sizes = subtreeSizes(h);
  const crowd = crowdFactor(h);
  const pos = new Map();
  for (const root of h.roots) {
    const comp = h.components[h.roots.indexOf(root)];
    const c = centerOf(graph, comp);
    radialAssign(h, sizes, root, c.x * SCALE, c.z * SCALE, 0, Math.PI * 2, 22, pos, null,
      (depth) => depth * 22 * crowd(depth));
  }
  return pos;
}

function layoutSpherical(graph, h) {
  const sizes = subtreeSizes(h);
  const crowd = crowdFactor(h);
  const pos = new Map();
  for (const root of h.roots) {
    const comp = h.components[h.roots.indexOf(root)];
    const c = centerOf(graph, comp);
    // shells by depth; per-node golden-angle elevation for even coverage
    radialAssign(
      h, sizes, root, c.x * SCALE, c.z * SCALE, 0, Math.PI * 2, 0, pos,
      (depth, id) => (depth === 0 ? 0 : Math.sin(id * GOLDEN) * depth * 12),
      (depth) => depth * 20 * crowd(depth)
    );
  }
  return pos;
}

function layoutOrganic(graph, h) {
  const pos = layoutRadialTree(graph, h);
  for (const [id, p] of pos) {
    const d = h.depth.get(id) || 0;
    p.y = (hash01(id, 7) - 0.5) * (8 + d * 6);
    p.x += (hash01(id, 11) - 0.5) * 6;
    p.z += (hash01(id, 13) - 0.5) * 6;
  }
  return pos;
}

function layoutCompactClusters(graph, h) {
  const pos = new Map();
  const n = h.components.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  h.components.forEach((comp, i) => {
    const cx = (i % cols) * 120;
    const cz = Math.floor(i / cols) * 120;
    const root = h.roots[i];
    const sizes = subtreeSizes(h);
    radialAssign(
      h, sizes, root, cx, cz, 0, Math.PI * 2, 0, pos,
      (depth, id) => Math.sin(id * GOLDEN) * depth * 6,
      (depth) => depth * 12
    );
  });
  return pos;
}

function layoutForce3d(graph, h, iterations) {
  // deterministic: seeded from spherical layout, no randomness
  const pos = layoutSpherical(graph, h);
  const ids = graph.nodeList.map((d) => d.id);
  // bounded work for very large maps — the spherical seed already gives a
  // reasonable arrangement, relaxation is a refinement
  const iter = iterations || (ids.length > 5000 ? 10 : ids.length > 1500 ? 30 : 60);
  const k = 18;
  for (let it = 0; it < iter; it++) {
    const force = new Map(ids.map((id) => [id, { x: 0, y: 0, z: 0 }]));
    // repulsion (sampled neighbours for large maps)
    const step = ids.length > 800 ? Math.ceil(ids.length / 400) : 1;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j += step) {
        const a = pos.get(ids[i]);
        const b = pos.get(ids[j]);
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dz = a.z - b.z;
        const d2 = dx * dx + dy * dy + dz * dz + 0.01;
        if (d2 > 4000) continue;
        const f = (k * k) / d2;
        const d = Math.sqrt(d2);
        dx = (dx / d) * f;
        dy = (dy / d) * f;
        dz = (dz / d) * f;
        const fa = force.get(ids[i]);
        const fb = force.get(ids[j]);
        fa.x += dx; fa.y += dy; fa.z += dz;
        fb.x -= dx; fb.y -= dy; fb.z -= dz;
      }
    }
    // attraction along all edges
    for (const e of graph.edges) {
      const a = pos.get(e.source);
      const b = pos.get(e.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
      const f = (d * d) / k / 40;
      const fa = force.get(e.source);
      const fb = force.get(e.target);
      fa.x += (dx / d) * f; fa.y += (dy / d) * f; fa.z += (dz / d) * f;
      fb.x -= (dx / d) * f; fb.y -= (dy / d) * f; fb.z -= (dz / d) * f;
    }
    const t = 1 - it / iter;
    for (const id of ids) {
      const p = pos.get(id);
      const f = force.get(id);
      const cap = 4 * t + 0.2;
      p.x += Math.max(-cap, Math.min(cap, f.x));
      p.y += Math.max(-cap, Math.min(cap, f.y));
      p.z += Math.max(-cap, Math.min(cap, f.z));
    }
  }
  return pos;
}

/**
 * Bounded collision relaxation: separates overlapping siblings without
 * destroying the overall arrangement. Deterministic. Uses a spatial hash
 * grid so cost stays O(V·k) — a naive O(V²) pass takes minutes on real
 * 40k-node maps.
 */
/**
 * Sheet footprint of a node in scene units — the exact proportions of its
 * 2D object. Only extremes are clamped, and always UNIFORMLY so the aspect
 * ratio (and with it the relative size of big diagrams vs small notes) is
 * preserved.
 */
function sheetSize(doc) {
  let w = ((doc.x1 - doc.x0) || 100) * SCALE;
  let h = ((doc.y1 - doc.y0) || 26) * SCALE;
  if (!(w > 0)) w = 8;
  if (!(h > 0)) h = 2.2;
  const maxDim = 36;
  if (Math.max(w, h) > maxDim) { const f = maxDim / Math.max(w, h); w *= f; h *= f; }
  if (h < 2.2) { const f = 2.2 / h; w *= f; h *= f; }
  if (w < 3) { const f = 3 / w; w *= f; h *= f; }
  return { w, h };
}

/** per-node collision radius derived from the real sheet footprint */
function nodeRadii(graph) {
  const radii = new Map();
  graph.nodes.forEach((d, id) => {
    const s = sheetSize(d);
    radii.set(id, Math.min(20, Math.max(s.w, s.h) / 2) + 2);
  });
  return radii;
}

function relaxCollisions(pos, minDist, passes, radii) {
  const ids = Array.from(pos.keys()).sort((a, b) => a - b);
  const md = minDist || 8;
  // with per-node radii the pair distance is r_a + r_b, so the grid cell
  // must cover the largest possible pair reach
  let maxR = md / 2;
  if (radii) radii.forEach((r) => { if (r > maxR) maxR = r; });
  const cell = radii ? maxR * 2 : md;
  const keyOf = (p) => Math.floor(p.x / cell) + ':' + Math.floor(p.y / cell) + ':' + Math.floor(p.z / cell);
  // two passes even on huge maps: one pass leaves visibly interpenetrating
  // sheets in dense clusters (still bounded: grid relax is ~1.3 s/pass at 41k)
  const passCount = ids.length > 20000 ? 2 : (passes || 3);
  for (let pass = 0; pass < passCount; pass++) {
    // rebuild the grid each pass (positions move)
    const grid = new Map();
    for (const id of ids) {
      const k = keyOf(pos.get(id));
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(id);
    }
    for (const id of ids) {
      const a = pos.get(id);
      const cx = Math.floor(a.x / cell);
      const cy = Math.floor(a.y / cell);
      const cz = Math.floor(a.z / cell);
      for (let gx = cx - 1; gx <= cx + 1; gx++) {
        for (let gy = cy - 1; gy <= cy + 1; gy++) {
          for (let gz = cz - 1; gz <= cz + 1; gz++) {
            const bucket = grid.get(gx + ':' + gy + ':' + gz);
            if (!bucket) continue;
            for (const jd of bucket) {
              if (jd <= id) continue; // handle each pair once, deterministic
              const b = pos.get(jd);
              let dx = b.x - a.x;
              let dy = b.y - a.y;
              let dz = b.z - a.z;
              const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
              const needed = radii
                ? (radii.get(id) || md / 2) + (radii.get(jd) || md / 2)
                : md;
              if (d >= needed) continue;
              if (d < 0.001) {
                // identical positions: deterministic separation direction
                dx = Math.cos(jd * GOLDEN);
                dz = Math.sin(jd * GOLDEN);
                dy = 0.3;
              } else {
                dx /= d; dy /= d; dz /= d;
              }
              const push = (needed - d) / 2;
              a.x -= dx * push; a.y -= dy * push; a.z -= dz * push;
              b.x += dx * push; b.y += dy * push; b.z += dz * push;
            }
          }
        }
      }
    }
  }
  return pos;
}

/**
 * cognitive-tree — the default: a horizontal organic 3D tree that
 * mirrors the real cognitive map.
 *
 * - each component root sits at its real 2D center (scaled), height 0
 * - every subtree occupies an angular window; a child's direction is the
 *   window allocation BLENDED with its actual 2D bearing from the parent,
 *   so the user's semantic arrangement (chemistry left, physics right, …)
 *   is preserved while guaranteeing separation
 * - positions chain outward from the parent (limbs, not concentric
 *   rings), so branches split at several spatial levels
 * - height varies gently and deterministically per major branch to
 *   reduce overlap without hiding the hierarchy
 */
function layoutCognitiveTree(graph, h) {
  const sizes = subtreeSizes(h);
  const pos = new Map();
  const STEP = 42;
  for (let ci = 0; ci < h.roots.length; ci++) {
    const root = h.roots[ci];
    const comp = h.components[ci];
    const c = centerOf(graph, comp);
    pos.set(root, { x: c.x * SCALE, y: 0, z: c.z * SCALE });
    const bearingOf = (parentId, kidId) => {
      const pd = graph.nodes.get(parentId);
      const kd = graph.nodes.get(kidId);
      if (pd && pd.coor && kd && kd.coor
          && (kd.coor.x !== pd.coor.x || kd.coor.y !== pd.coor.y)) {
        return Math.atan2(kd.coor.y - pd.coor.y, kd.coor.x - pd.coor.x);
      }
      return hash01(kidId, 3) * Math.PI * 2;
    };
    // explicit stack — real maps reach depth ~40 with thousands of nodes
    const stack = [{ id: root, a0: 0, a1: Math.PI * 2, depth: 0, salt: root }];
    while (stack.length) {
      const { id, a0, a1, depth, salt } = stack.pop();
      const kids = h.childrenOf.get(id) || [];
      if (!kids.length) continue;
      const parentPos = pos.get(id);
      const ordered = kids.slice().sort((p, q) => bearingOf(id, p) - bearingOf(id, q) || p - q);
      const total = ordered.reduce((s, k) => s + sizes.get(k), 0);
      let acc = a0;
      for (const k of ordered) {
        const span = ((a1 - a0) * sizes.get(k)) / total;
        let ang = acc + span / 2;
        // pull toward the real 2D bearing when it lies near the window
        let d = bearingOf(id, k) - ang;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        if (Math.abs(d) < Math.max(span, 0.35)) ang += d * 0.5;
        const branchSalt = depth === 0 ? k : salt;
        const r = STEP * (0.85 + 0.5 * hash01(k, 5)) * (1 + Math.min(2, sizes.get(k) / 40));
        const y = parentPos.y
          + (hash01(branchSalt, 9) - 0.5) * (depth === 0 ? 30 : 0)
          + (hash01(k, 11) - 0.5) * 6;
        pos.set(k, {
          x: parentPos.x + Math.cos(ang) * r,
          y,
          z: parentPos.z + Math.sin(ang) * r,
        });
        // the child's own window opens around its outward direction and
        // widens for large subtrees so deep branches stay readable
        const childHalf = Math.max(span * 0.75, Math.min(1.4, 0.25 + sizes.get(k) / 60)) / 2;
        stack.push({ id: k, a0: ang - childHalf, a1: ang + childHalf, depth: depth + 1, salt: branchSalt });
        acc += span;
      }
    }
  }
  return pos;
}

// collision relaxation is size-aware: each node claims a radius from its
// real sheet footprint, so large diagrams get room and small notes pack
// tighter — neighbours never overlap regardless of their 2D size
const LAYOUTS = {
  'cognitive-tree': (g, h) => relaxCollisions(layoutCognitiveTree(g, h), 12, 2, nodeRadii(g)),
  'legacy-planar': (g, h) => layoutLegacyPlanar(g),
  'layered-depth': (g, h) => relaxCollisions(layoutLayeredDepth(g, h), 10, 2, nodeRadii(g)),
  'radial-tree': (g, h) => relaxCollisions(layoutRadialTree(g, h), 12, 3, nodeRadii(g)),
  'spherical': (g, h) => relaxCollisions(layoutSpherical(g, h), 12, 3, nodeRadii(g)),
  'organic': (g, h) => relaxCollisions(layoutOrganic(g, h), 12, 3, nodeRadii(g)),
  'force-3d': (g, h) => layoutForce3d(g, h),
  'compact-clusters': (g, h) => relaxCollisions(layoutCompactClusters(g, h), 10, 3, nodeRadii(g)),
};

/**
 * Compute a layout preset.
 * @param {Array} docs legacy documents
 * @param {string} preset one of LAYOUT_PRESETS
 * @param {Object} [overrides] persisted manual positions {id: {x,y,z}}
 */
function computeLayout(docs, preset, overrides) {
  const graph = buildGraph(docs);
  const h = deriveHierarchy(graph);
  const fn = LAYOUTS[preset] || LAYOUTS['layered-depth'];
  const pos = fn(graph, h);
  if (overrides) {
    for (const id of Object.keys(overrides)) {
      const o = overrides[id];
      if (o && pos.has(Number(id))) pos.set(Number(id), { x: o.x, y: o.y, z: o.z });
    }
  }
  return { graph, hierarchy: h, positions: pos };
}

module.exports = {
  buildGraph,
  isOverlayDoc,
  sheetSize,
  nodeRadii,
  connectedComponents,
  deriveHierarchy,
  subtreeSizes,
  computeLayout,
  relaxCollisions,
  hash01,
  LAYOUT_PRESETS: Object.keys(LAYOUTS),
  SCALE,
};
