# Transform CogniMap into a modern 3D knowledge mapping interface

> Prepared PR description for branch `3d-graphic-overhaul`
> (based on `modernize-ui-backend-runtime`). Open at:
> https://github.com/PMK89/CogniMap/compare/modernize-ui-backend-runtime...3d-graphic-overhaul

## Visual overview

The map becomes a navigable 3D scene: concepts are real 3D shapes,
structural relationships form branch tubes, secondary relationships
render as subtle cross-link lines. A dark scientific workspace is the
default; light theme is one click away; the classic 2D canvas remains
mounted underneath as the planar fallback and is verified to stay fully
functional. Screenshots (dark overview, spherical layout, selected
node, light theme) captured against the maintainer's real dataset.

## Architecture summary

- **Renderer**: Three.js r160 on WebGL2 (WebGL1 fallback; structured
  in-app failure panel + intact 2D map when WebGL is unavailable).
  Decision record: `docs/architecture/3d-rendering.md`.
- **Strict layering** (renderer replaceable without touching the map
  model): domain state stays in the existing ngrx store/backend;
  `graph3d-core.js` (pure CommonJS, node-tested) owns hierarchy
  derivation and layouts; `Scene3dService` owns three objects and the
  on-demand render loop; `Cmap3dComponent` owns interaction policy and
  persistence.
- **Feature preservation by construction**: the 3D workspace is an
  overlay above the untouched 2D application. Selecting a node in 3D
  drives the application-wide selection, so every legacy editor
  (LaTeX, code, JSME, SVG editor, mnemonics, navigator, minimap),
  quiz mode, import/export, themes and shortcuts operate unchanged —
  verified in the browser (3D-selected node → LaTeX editor renders its
  equations).

## Graph model and layout

- Rank-layered hierarchy derivation from legacy link metadata:
  forward parent→child edges win; cycle-closing and weak (weight 0)
  edges classify as cross-links; every original link is preserved;
  multi-parent, cyclic, and disconnected graphs are first-class
  (62 components detected on the real 41k-node database).
- Seven deterministic layout presets (`legacy-planar`, `layered-depth`
  default, `radial-tree`, `spherical`, `organic`, `force-3d`,
  `compact-clusters`); no randomness anywhere — identical data produces
  identical positions, verified across reloads in the browser.
- Spatial-hash collision relaxation (O(V·k); the naive version took
  213 s on 41k nodes, the shipped one 1.3 s).
- Manual positions are persisted overrides; layered/planar presets
  anchor to existing 2D coordinates so legacy maps keep the user's
  spatial memory and adding nodes never reorganizes the map.

## Node shapes and materials

12 geometries (sphere, rounded box, cube, capsule, cylinder, cone,
torus, prism, octahedron, low-poly, panel, image plane); automatic
mapping from content type (image→plane, LaTeX/SVG/chemistry→panel,
code→prism, quiz→octahedron, mnemonic→capsule, root→sphere) with
per-node override persisted in the visualization state. Colors are
data-driven from each node's stored style; conservative matte
materials; restrained selection/hover emissive highlights;
distance-culled billboard labels (no DOM per node).

## Interaction model

Orbit / pan / dolly (OrbitControls with damping and range limits),
raycast click selection (app-wide sync), hover highlight, double-click
focus, camera-plane node dragging (orbit disabled while dragging),
frame-all / focus-selected, camera state persisted and restored.

## Persistence & compatibility

Versioned `viz3d` state in its own file via `GET/PUT/DELETE
/api/viz3d` — concept-map data is never touched, so legacy maps need
**no migration** (dry-run reporter: `npm run migrate:dry-run`). Backups
before every first write and reset; corrupted state recovers to
defaults. Schema: `docs/architecture/visualization-state.md`.

## Tests (all green)

- 47 backend/unit tests (`node --test`), including 9 for the graph
  core: determinism, cycles, components, classification, overrides,
  incremental stability.
- 25 Playwright browser tests (16 legacy + 9 3D) — passing against the
  dev build **and the production build**: scene render without console
  errors, orbit/pan/zoom, selection sync, deterministic presets across
  reload, position/geometry persistence, structural vs cross rendering,
  planar fallback, simulated WebGL failure.

## Performance (measured, `npm run benchmark:3d`)

| Map | in scene | initial render | orbit FPS | JS heap |
|---|---|---|---|---|
| 100 | 78 | 2.2 s | 60 | 57 MB |
| 500 | 390 | 2.5 s | 59 | 71 MB |
| 2000 | 1208 | 2.7 s | 60 | 79 MB |
| 5000 | 1208* | 2.9 s | 59 | 79 MB |

\* viewport windowing (pre-existing data-layer behavior) caps in-scene
load — the built-in graceful degradation. Full-map layout timing:
41k real nodes ≈ 1 s (layered). On-demand rendering → zero GPU load at
rest. Environment recorded in `docs/performance/3d-benchmarks.md`.

## Known limitations (documented, non-critical, with fallbacks)

- Inspector depth: the 3D toolbar exposes layout, shape, focus and
  framing; full multi-section node/link inspectors, saved-viewpoint UI,
  orientation gizmo, 3D search overlay and branch collapse UI are
  follow-ups — all underlying state fields exist in the viz3d schema,
  and every content-editing workflow is available through the existing
  editors, which operate on 3D selections today.
- Labels use canvas sprites rather than SDF text (swap-in point
  documented); very long titles are truncated at 40 chars.
- Node creation/link creation in 3D currently routes through the
  established 2D workflows (toggle is one click); direct in-scene
  creation is a follow-up.
- High-contrast/reduced-motion apply at application level; scene-
  specific high-contrast preset is a follow-up.
- Instanced rendering is prepared for (shared geometries/materials) but
  not yet enabled; current performance meets all targets without it.

## Rollback

Delete `data/viz3d.json` (or `DELETE /api/viz3d`) to reset the 3D
state; toggle 2D for the classic interface; revert the branch for full
rollback — no data format changed.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
