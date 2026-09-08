# Root-network layout

Status date: 2026-09-07. `root-network` is a deterministic 3D preset for a large CogniMap. It changes rendered positions only: persisted document geometry, topology, native 2D positions, other 3D presets, and the 2D fallback remain unchanged.

## Layout algorithm

The graph core derives a spanning forest from the existing map before placing anything. For each connected component it selects the root with the highest structural out-degree, breaking ties by the lowest numeric ID. Traversal prioritizes directed, non-zero-weight links in their authored direction, then reverse strong links, then weak links. The selected spanning edges are structural; every unselected or weak edge remains a cross-link.

Each component is placed by iterative root growth. A child direction is derived from stable ID hashes, then constrained to a cone around its parent's tangent so branches continue outward rather than forming depth rings. Child spacing includes the source and child sheet radii plus a subtree-size term, giving large descendants additional clearance. A bounded grid collision-relaxation pass separates nearby sheets without using cross-links as forces. Multiple components receive deterministic placement around the dominant component.

The renderer uses the derived parent relation to orient tapered large-map cylinders from parent to child. Their wider local base stays at the parent even when an authored structural link is stored child-to-parent. Cross-links render separately and do not alter positions.

## Large-map rendering

The real map uses a bounded overview LOD: the 700 highest-priority structural limbs and their endpoints are rendered in two draw calls, one `LineSegments` and one `Points` object. Endpoint size is fixed at two pixels so dense junctions do not conceal the limbs.

Root-network adapts fog to camera distance. A focused node uses near/far fog of 80/400 units to suppress unrelated sheets; at overview distance it restores 120/4000. The overview skeleton itself is fog-free. The initial root view frames the largest component rather than every disconnected outlier. `Frame all` intentionally includes those components and can therefore appear more compact.

## Measured verification

The final read-only benchmark ran once on the authentic `cme.db`; it is CPU layout timing, not browser GPU/FPS performance.

| preset | nodes | edges | structural | cross | time | heap delta |
|---|---:|---:|---:|---:|---:|---:|
| 2d-parity | 39,327 | 39,767 | 39,170 | 597 | 781.4 ms | 62.4 MiB |
| cognitive-tree | 39,327 | 39,767 | 39,170 | 597 | 1819.8 ms | 81.5 MiB |
| root-network | 39,327 | 39,767 | 39,170 | 597 | 2062.8 ms | 76.2 MiB |

`npm test` passed 61 tests and the complete Playwright suite passed 39 tests. Real-browser verification used the 39,327-node map: the dominant root subtree contained 38,968 nodes, the overview rendered 700 limbs plus 701 endpoints, and selected LaTeX node 8993 produced two rich sheet faces with no console errors.

## Maintainer map

`src/app/graph3d/graph3d-core.js` derives graph and hierarchy state. `root-layout.js` computes deterministic root positions. `scene3d.service.ts` owns LOD, cylinder orientation, fog, framing, and rendering. `cmap3d.component.ts` exposes the preset and preserves the full-graph lifecycle. `scripts/benchmark-root.js` decodes NeDB records read-only for the CPU measurement.

## Dependency checkpoint

The Express-compatible `path-to-regexp` resolution is patched from 0.1.12 to 0.1.13. An isolated dependency tree preserves the original installation. With this patch, all 61 regression tests and 39 browser tests pass and the production build succeeds; final logs are in `/home/pmk/cognimap-verification-2026/root-*.log`. Existing Angular/MathJax/toolchain advisory debt remains a separate compatibility project.

## Synthetic edit-stability measurements (2026-09-08)

Run `node scripts/benchmark-root-stability.js --nodes 41000` (also accepts
`--nodes=41000`; default 2,000, range 20–50,000). The script constructs a
five-child branching graph and emits JSON. It compares reversed input and
three independent edits against one baseline: a new leaf, a weak cross-link
between leaves in different root branches, and a disconnected component.
It verifies exact cross-edge classification and unchanged hierarchy parents
for the semantic-link case. Displacement is measured in layout coordinate
units over shared nodes; no arbitrary pass threshold is applied to edits.

The 41,000-node run had identical positions under input permutation. All
three edits preserved existing parents. Leaf insertion moved the p95 shared
node by 0.8391 units (maximum 15.2898); adding a disconnected component gave
p95 0.8188 (maximum 15.2898). The weak cross-link moved no nodes. Median
movement was zero in all three cases. These are synthetic single-run
measurements, not proof of stability for all authentic-map edits. Component
addition can move existing positions even when their hierarchy is unchanged.
The script reports elapsed synchronous layout time separately from geometric
movement; it does not measure browser frame time or GPU memory.

Local aggregate evidence: `/home/pmk/cognimap-verification-2026/root-stability-20.json`
and `root-stability-41000.json`. The measurement script accesses no real map.
