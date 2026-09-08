# Modernization architecture and compatibility

Status: 2026-09-08. General modernization is isolated from the additional root-layout branch. Neither source branch is rewritten or merged into by this work.

## Development and architecture

Use Node.js 18 or newer, `npm install`, `npm test`, `npm run build`, and `npm run test:e2e`; `npm start` serves the built application locally. Set `COGNIMAP_DATA_DIR` to a disposable copy for testing. The browser harness initializes its own `e2e/.data` before opening NeDB, so startup repair cannot race fixture preparation. Original databases must not be opened by NeDB for read-only analysis: its loader may compact them. Decode append records directly instead.

Angular 2, ngrx, the backend compatibility facade, and the existing widget registry remain in place. A framework/dependency migration was deliberately not combined with changes to native persistence and scientific editors. New behavior is isolated in:

- `server/lib/interchange/json-canvas.js`: pure interchange projection and validation.
- `server/lib/search.js`: literal, ranked substring/subsequence search without user-supplied regular expressions.
- `server/lib/review-checkpoint.js`: optional versioned review recovery.
- `src/app/workspace/`: search, recent visits, previous viewport, themes, Canvas preview/import.
- `NavigatorService.focusRequests`: explicit navigation into 3D, separate from ordinary editor selection.
- `code-serialization.js`: full-source SVG serialization independent of CodeMirror's visible viewport.

Mutation handlers serialize their database stages; response download completion never holds the write queue. Read-only POST queries remain concurrent. Errors propagate to the structured API error handler. Existing layout/editor/widget contracts remain available.

## Native data and scientific content

NeDB documents remain authoritative. Positive IDs identify objects; negative IDs identify connector documents. `cmobject` retains its serialized structure, content, styles, metadata and node-local links. Link metadata carries target identity, direction and weight; connector documents preserve their own geometry/styles. Historical large negative integer IDs are retained without rounding or renumbering. Native coordinates, dimensions, attachments, quiz covers, and scientific source are not migrated.

Content continues through the existing MathJax/LaTeX, JSME chemistry, CodeMirror, SVG/vector, image and multimedia widgets. Code nodes keep the complete source and language, including offscreen lines, with escaped SVG output and bounded preview height. LaTeX preview is asynchronous, rejects stale responses, exposes request errors, and retains the established source/render serialization. Chemistry is still distinct from mathematical content; JSME was not replaced.

Editable inputs, textareas, selects and contenteditable surfaces are excluded from global map shortcuts. Key releases still clear shared modifier state. A real 500-line code-editor test verifies typing, save, full source and the final rendered line.

## Review and scheduling

`q` is a dormant quiz cover and `q1` an active cover. Startup repair demotes stale active covers before requests run. Review reveal hides only the selected cover through a scoped rendering rule; it never moves the underlying content or rewrites cover coordinates. The review toolbar provides context location, question navigation, reveal/hide, grades 0–5, progress, restart and one-rating undo.

The existing SM2-derived calculation remains in `server/lib/quiz.js`. `quizes.json` remains authoritative, including historical difficulty, intervals and due days. Schedule writes use a temporary file and rename. `quiz-session.json` is an optional version-1 sidecar containing same-day queue identities, progress and schedule revisions. It resumes the remaining queue after restart and skips a successful rating already persisted before a checkpoint interruption. Expired/corrupt checkpoints fall back to native due schedules.

Undo uses an in-memory snapshot only, so it is unavailable after a backend restart. Executing undo writes the restored schedule to `quizes.json`; undo also saves the updated queue/progress to the separate `quiz-session.json` sidecar. Undo preserves unrelated later quiz edits. A restart resumes review progress, not the previously revealed visual state.

## Themes and navigation

CSS tokens extend the existing compact application chrome. Workspace tools (`Ctrl+K`) expose system, light and dark themes; explicit preferences persist in browser storage. 3D also follows live system-theme changes when no manual override is selected. Native knowledge-content styling remains intact.

Search supports type filters, keyboard activation, twelve recent nodes and a previous-viewport stack. Explicit visits select the native node and focus it when 3D is open. Existing connected-node/child traversal and editor shortcuts remain available. Renderer subscriptions are released on view destruction.

## JSON Canvas interoperability

The adapter targets JSON Canvas 1.0. Export projects positions, dimensions, text, colors, file/link references and directed edges. `org.cognimap` version-1 metadata carries complete native documents and related quiz schedules for lossless recovery. Native IDs and NeDB `_id` values remain unchanged. Preview is read-only; insertion requires its exact token and rejects any existing identity collision.

Edited Canvas projections with native metadata are rejected rather than silently discarding one representation. Remove `org.cognimap` metadata to import an edited projection as new cards with new native IDs. Files are referenced, not copied or packaged; a Markdown vault exporter is not included. Native document insertion and schedule-file persistence are separate operations, not a cross-file transactional database migration.

Canvas requests have a dedicated 512 MiB limit; ordinary API requests retain 100 MiB. Large imports require substantial memory for JSON parsing and NeDB document copies. The authentic 211,847,118-byte request was accepted by the real HTTP parser. A separate empty temporary database imported all 81,240 documents and 1,813 schedules, with exact document and schedule comparison after insertion. Preview took 8.075 s and import 11.134 s in that run. No original dataset was modified.

## Dependency checkpoint

An isolated, semver-compatible Express `path-to-regexp` resolution was patched from 0.1.12 to 0.1.13; the original installed dependencies are untouched. Angular 2 and MathJax 2 remain in place; their remaining advisories and the legacy toolchain require coordinated future work. A preliminary pre-patch `npm audit` found 104 vulnerable package records, 45 production-installed; these include build tooling and do not establish runtime reachability, so this checkpoint does not claim all security problems are solved. Test environment: Node 22.13.1, npm 11.1.0. The checks below distinguish functional verification from the remaining dependency migration work.

## Verification evidence

- `npm test`: 80 tests pass; lint and type checking pass with two existing lint warnings (`/home/pmk/cognimap-verification-2026/modernization-tests.log`).
- Production build passes with three existing bundle-size warnings (`/home/pmk/cognimap-verification-2026/modernization-build.log`).
- Full browser suite: 40 tests pass in 3.2 minutes (`/home/pmk/cognimap-modernization-patched-e2e.log`), including scientific widgets, editing/arrangement/undo, quiz, Canvas, 2D/3D navigation and themes.
- Authentic-copy review: 42 remaining / 0 rated → 41 / 1 → 42 / 0 after undo. The same cover's bounds are identical before/after reveal (`/tmp/cognimap-a-real-quiz.json`).
- Full HTTP import and exact persistence comparison: `/tmp/cognimap-large-import-http.json`.
- Literal search on the authentic data: `orbital` 47 ms, `chem` 16 ms, `[` 11 ms, results capped at 40. These are single-run measurements, not latency guarantees.
- Original DB, schedule, settings, colors and minimap hashes match the read-only baseline.

An interrupted earlier large-map check emitted four SVG NaN coordinate errors. A subsequent fresh-copy initialization, reveal, grade and undo with SVG attribute tracing found no invalid assignments or console errors; no reproducible document or stack was identified, so this remains an unconfirmed observation rather than a patched bug. Evidence: `/tmp/cognimap-a-real-quiz-nan.json`.

Generated screenshots and copied knowledge data remain local and untracked. Tests intentionally exercise duplicate legacy imports; their expected server warnings do not indicate newly duplicated native identities. Broad framework migration, packaged asset/vault export, cross-file import crash transactions, and persistent rating undo remain future work.
