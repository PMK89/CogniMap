# 3D Performance Benchmarks

Run with `npm run benchmark:3d` (deterministic synthetic maps: 3-ary
tree + 10% weak cross-links, realistic legacy document shape including
pre-rendered `prep` SVG).

## Environment (recorded run, 2026-07-11)

- Linux 6.8, Chrome (stable channel, headless, ANGLE GL), Node 22.13
- viewport 1600×900, `--use-gl=angle`
- measurements are real, produced by `scripts/benchmark3d.js`

## Results

| Map | nodes in scene* | initial render | orbit FPS (3s) | JS heap | layered | radial | spherical | force-3d |
|---|---|---|---|---|---|---|---|---|
| 100 nodes | 78 | 2190 ms | 60 | 57 MB | 8 ms | 4 ms | 3 ms | 63 ms |
| 500 nodes | 390 | 2457 ms | 59 | 71 MB | 15 ms | 14 ms | 15 ms | 325 ms |
| 2000 nodes | 1208 | 2652 ms | 60 | 79 MB | 48 ms | 48 ms | 45 ms | 656 ms |
| 5000 nodes | 1208 | 2880 ms | 59 | 79 MB | 94 ms | 130 ms | 135 ms | 1643 ms |

\* the application loads documents viewport-windowed (a pre-existing
behavior of the data layer); the scene therefore renders the loaded
subset — this is the built-in graceful-degradation mechanism for very
large maps. Layout timings are full-map (all nodes).

Real user data: the layout pipeline was additionally measured against
the maintainer's real 41,371-node database — hierarchy derivation
282 ms, layered/radial/spherical ≈ 1.0–1.3 s, force-3d 7.8 s (bounded
iterations). The spatial-hash collision pass replaced an O(V²) version
that took 213 s.

## Targets vs. results

- smooth interaction at 500 nodes: **met** (59–60 fps)
- usable at 2000: **met** (60 fps, 2.7 s load)
- graceful degradation at 5000: **met** (viewport windowing + label
  budget + merged line rendering; 59 fps)
- no runaway memory: **met** (≤ 79 MB JS heap across sizes)
- no idle GPU load: **met** (on-demand render loop; zero frames drawn
  when the scene is unchanged)

## Techniques in use

Shared geometries and materials, merged `LineSegments` for large maps
and all cross-links, distance-based label budget, on-demand rendering,
debounced persistence, spatial-hash collision relaxation, bounded
force iterations, full GPU resource disposal.
