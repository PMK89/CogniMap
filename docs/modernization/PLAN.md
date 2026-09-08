# CogniMap modernization, September 2026

## Constraints and branch strategy

Preserve native documents, IDs, serialized cmobject, scientific widgets, connector semantics and SM2-derived scheduling. No database migration. Never launch against the original dataset for testing. Changes stay on the two new feature branches.

Branch A starts at origin/master 321a311. Branch B starts at the same commit and merges origin/3d-graphic-overhaul afe3114, retaining the five subsequent 3D fixes without replaying the divergent local history. Existing local master and 3d-graphic-overhaul remain untouched.

## Design

Keep Angular 2 and the existing backend compatibility facade for this iteration. A framework replacement would couple otherwise independent data, editing and rendering changes. Extract new interoperability and layout behavior as pure modules with Node tests. Extend the existing CSS token system and real widget contracts rather than replacing scientific content with generic cards.

Quiz covers remain native q/q1 documents. Scheduling stays in quizes.json. Fix queue transitions and persistence before adding reveal/grade controls. Review actions must never move covered content. New interchange metadata is versioned and carries exact native documents; import validates and previews before additive insertion, with explicit collision handling.

The root layout reuses the existing deterministic forest and cross-edge distinction. Structural placement determines coordinates; cross-links do not exert forces. Keep all older modes and streamed rich content.

## Implementation checkpoints (verified 2026-09-08)

- [x] Inspect live checkout, fetch remote, compare ancestry and isolate feature branches.
- [x] Establish baseline: 53 backend tests, production build and browser fixture diagnosis.
- [x] Read-only historical inventory: 81,240 documents; native data hashes preserved.
- [x] Characterize/repair quiz persistence, scheduling, queue replacement and restart recovery.
- [x] Add reveal/grade/undo controls; verify unchanged cover bounds on an authentic copy.
- [x] Add workspace themes/search, editor shortcut isolation and scientific source/preview improvements.
- [x] Add validated JSON Canvas preview/import/export; verify exact full HTTP document/schedule import into an empty temporary database.
- [x] Connect search to 3D focus and release renderer listeners on repeated view changes.
- [x] Add and visually verify the independent deterministic root layout on the authentic large graph.
- [x] Document architecture, compatibility, benchmarks and remaining limitations.
- [x] Final checks: A80 backend tests /40 browser tests; B61 backend tests /39 browser tests; both production builds pass.

Final evidence is summarized in ARCHITECTURE-COMPATIBILITY.md (A) and ROOT-LAYOUT.md (B). The original local master and 3d-graphic-overhaul refs remain unchanged. All database mutation tests use temporary copies; generated knowledge data and screenshots stay untracked. Neither feature branch is merged into a source branch.
