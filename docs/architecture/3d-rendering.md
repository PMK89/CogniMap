# 3D Rendering Architecture

## Renderer decision

**Three.js r160 over WebGL2** (WebGL1 fallback), integrated as an
untyped CommonJS import into the legacy Angular build (the TS 3.9
toolchain runs transpile-only and cannot consume three's modern type
declarations — documented tradeoff).

Rationale:
- Three.js is the most maintained, best-documented browser 3D library,
  with the widest ecosystem; nothing in this workload (a few thousand
  meshes, simple materials) requires Babylon's engine features.
- WebGL2 is requested first, WebGL1 accepted, and a missing context
  produces a structured in-app failure panel while the classic 2D map
  remains fully functional underneath (planar fallback by construction).
- WebGPU is intentionally not used; the renderer abstraction leaves room
  for it later.

## Layer separation

```
domain graph state    ngrx `cmes` slice + backend NeDB (unchanged)
persisted map data    data/cme.db + config JSON files (unchanged)
visualization state   data/viz3d.json via /api/viz3d (versioned, own file)
graph/layout logic    src/app/graph3d/graph3d-core.js (pure CommonJS)
scene representation  Scene3dService (three objects derived from docs)
renderer              three WebGLRenderer inside Scene3dService
interaction control   Scene3dService pointer handlers + Cmap3dComponent
UI panels             existing Angular components (toolbars, widgets)
plugin content        existing editors, driven by shared selection state
```

The renderer is replaceable: `graph3d-core` has no three imports and is
unit-tested in Node; `Cmap3dComponent` talks to the service through a
small callback surface (`onSelect`, `onDragEnd`, `onDoubleClick`, …).

## Scene composition

- **Nodes**: one mesh per node from a shared-geometry cache (12 shapes)
  and a shared-material cache keyed by color; selection/hover promote a
  mesh to an owned material with a restrained emissive highlight.
- **Structural branches**: quadratic-Bezier tube meshes for maps below
  the large-map threshold (800 nodes in scene); merged `LineSegments`
  above it (adaptive curve cost).
- **Cross-links**: a single merged low-opacity `LineSegments` group —
  visible but never dominant, toggleable as a group.
- **Labels**: pooled canvas-sprite textures (no DOM per node), billboard
  by construction, distance-culled to a budget (90 normal / 40 large)
  with selected and hovered labels always visible.
- **Lighting**: hemisphere + one directional key light; materials use
  conservative roughness/metalness so readability never depends on
  physically-correct lighting.
- **Render loop**: on-demand — frames render only on camera damping,
  interaction or data change; idle scenes cost no GPU time.

## Error handling

- WebGL unavailable → structured failure panel + intact 2D fallback.
- Corrupted `viz3d.json` → moved aside to `data/backups/` and defaults
  served (`GET /api/viz3d` never fails hard).
- `DELETE /api/viz3d` = reset visualization (backup taken first).
- All GPU resources disposed on component destroy (geometries,
  materials, textures, renderer).
