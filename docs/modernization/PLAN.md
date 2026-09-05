# CogniMap modernization, September 2026

## Constraints and branch strategy

Preserve native documents, IDs, serialized cmobject, scientific widgets, connector semantics and SM2-derived scheduling. No database migration. Never launch against the original dataset for testing. Changes stay on the two new feature branches.

Branch A starts at origin/master 321a311. Branch B starts at the same commit and merges origin/3d-graphic-overhaul afe3114, retaining the five subsequent 3D fixes without replaying the divergent local history. Existing local master and 3d-graphic-overhaul remain untouched.

## Design

Keep Angular 2 and the existing backend compatibility facade for this iteration. A framework replacement would couple otherwise independent data, editing and rendering changes. Extract new interoperability and layout behavior as pure modules with Node tests. Extend the existing CSS token system and real widget contracts rather than replacing scientific content with generic cards.

Quiz covers remain native q/q1 documents. Scheduling stays in quizes.json. Fix queue transitions and persistence before adding reveal/grade controls. Review actions must never move covered content. New interchange metadata is versioned and carries exact native documents; import validates and previews before additive insertion, with explicit collision handling.

The root layout reuses the existing deterministic forest and cross-edge distinction. Structural placement determines coordinates; cross-links do not exert forces. Keep all older modes and streamed rich content.

## Implementation checkpoints

- [x] Inspect dirty live checkout, fetch remote, compare ancestry, isolate branches.
- [x] Baseline npm test: 53 passed, two existing lint warnings (loopback-capable host run).
- [x] Read-only historical database inventory: 81,240 documents, 39,831 connectors; no malformed lines.
- [ ] Complete baseline production builds and browser suites.
- [ ] Characterize and repair quiz persistence, queue replacement, scheduling and restart behavior.
- [ ] Improve review controls and lifecycle; verify real reveal/grade behavior.
- [ ] Improve application chrome, theme selection and scientific editor usability.
- [ ] Add validated JSON Canvas adapter, preview and additive import/export; round-trip tests.
- [ ] Improve navigation and verify large-map performance.
- [ ] Add deterministic multidirectional root layout on Branch B; benchmark and inspect in browser.
- [ ] Document architecture, compatibility, measurements and limitations; full final verification.

Each implemented checkpoint is committed separately. Tests use copied historical fixtures; browser servers use e2e/.data. Local large-map artifacts and screenshots remain untracked. No source data is committed.
