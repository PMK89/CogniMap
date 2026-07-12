# 3D Browser Tests

## Unit tests (`npm run test:unit` → node --test)

`server/test/graph3d.test.js` — 9 tests over the pure graph core:
edge collection/dedup, connected components, hierarchy derivation with
cycles and weak links (every link kept, cross-link classification),
determinism of all seven layout presets, legacy-planar plane
preservation, manual-override precedence, component separation,
deterministic collision relaxation, incremental-insertion stability.

## End-to-end (`npm run test:e2e` → Playwright, real Chrome)

`e2e/graph3d.spec.js` — runs against the same fixture server as the 2D
suite, with the 3D preference enabled pre-load:

1. scene renders nodes and branches without console errors
2. camera orbit, pan and zoom
3. node selection syncs the application-wide selection
4. layout presets switch, persist, and reproduce identical positions
   after reload (determinism in the browser)
5. manual node positions persist across reload
6. node geometry override applies and persists
7. structural/cross-link split is consistent
8. 2D planar fallback stays available and functional
9. simulated WebGL failure → structured failure panel, classic map
   intact underneath

The pre-existing `e2e/app.spec.js` (16 tests) continues to cover every
legacy workflow (editors, quiz, import/export, themes, a11y) and runs
in the same suite — 25 browser tests total.

## Benchmarks

`npm run benchmark:3d` — see `docs/performance/3d-benchmarks.md`.
