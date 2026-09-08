# CogniMap completion plan and account handoff

Prepared 2026-09-08. This is the continuation contract for the modernization project. Read this before making changes. Passing suites establish a useful checkpoint, not completion of every requirement in the original brief.

## 1. Start here: prompt for the next account

> Continue the CogniMap modernization described in `docs/modernization/HANDOFF-COMPLETION-PLAN.md`. First verify the two feature branches, working trees, installed dependency targets, and running processes. Preserve all existing branches and original knowledge data. Work on the existing new feature branches; do not merge either into master. Read the branch-specific architecture documents, then address the priority work packages below in small tested commits. Delegate bounded implementation to the installed Devin CLI using an available inexpensive model; retain architecture, data-safety decisions, integration and final review yourself. Do not assume previous test artifacts or `/tmp` dependencies survive an account/environment change. Record verified facts separately from hypotheses and unfinished work. Ordinary implementation, tests, feature-branch commits and pushes are already authorized. Never transfer credentials between accounts.

The original objective is a stable, usable, modern cognitive-map application preserving the complete native graph, scientific content and SM2-derived review behavior, plus an independently reviewable root-like 3D layout branch. Do not add generated knowledge or cloud AI features. Do not simplify the graph to fit a replacement UI.

## 2. Exact implementation checkpoint

These are implementation baseline SHAs, before any commit containing this handoff document:

| Deliverable | Branch | Baseline SHA | Current head (2026-09-08) | Local worktree |
| --- | --- | --- | --- | --- |
| A: general modernization | `feature/cognimap-modernization-2026` | `16052b3e04f5134640f01147690f2e07ad1e1e02` | `ef905d9` | `/home/pmk/cognimap-modernization-2026` |
| B: additional root layout | `feature/3d-root-network-layout-2026` | `798b5c2ce0b0a5b4504f8bcbb91bdeaedaf8ac50` | `efa560b` | `/home/pmk/cognimap-root-layout-2026` |

Both baselines were clean and pushed to `https://github.com/PMK89/CogniMap.git`. Both current heads are committed, clean and pushed; nothing is stashed or uncommitted. Inspect current HEAD rather than resetting to these hashes: later documentation or implementation commits may exist.

A starts from fetched `origin/master` at `321a311`. B starts from that master state and safely merges the newer `origin/3d-graphic-overhaul` at `afe3114`, retaining its useful work. B is not a superset of A. It does not automatically include A's workspace, review, science or Canvas improvements. Keep the deliverables separable; do not silently merge A into B. If a combined release is later wanted, document and test that integration separately.

Original checkout: `/media/pmk/SysEx/cs/cognimap`. Existing local source refs recorded during this task:

- `master`: `e81f1c2deec92a6a0ad30436087d5d9ecd4a16cf`.
- `3d-graphic-overhaul`: `c538f9f8ee1a23825ba062e41b4244ba2addc934`.

The original checkout contains real-data changes. Never reset, clean, switch, install dependencies in, or otherwise repurpose it. Do not prune unrelated/prunable worktrees. Do not read or upload historical credential files; one exists at `data/tmp/id_rsa`. Use explicit file staging, never blanket `git add .`.

## 3. First 30 minutes on resumption

1. Read this file and A's [architecture and compatibility report](ARCHITECTURE-COMPATIBILITY.md). In B, read `docs/modernization/ROOT-LAYOUT.md`. The older `PLAN.md` records implemented stages; its checked boxes do not supersede the gaps here.
2. Run the following read-only checks with explicit paths. Inspect output before changing anything.

   ```bash
   git -C /home/pmk/cognimap-modernization-2026 status --short --branch
   git -C /home/pmk/cognimap-root-layout-2026 status --short --branch
   git -C /home/pmk/cognimap-modernization-2026 worktree list
   git -C /home/pmk/cognimap-modernization-2026 log -8 --oneline
   git -C /home/pmk/cognimap-root-layout-2026 log -8 --oneline
   git -C /home/pmk/cognimap-modernization-2026 fetch origin
   git -C /home/pmk/cognimap-modernization-2026 log --graph --oneline --decorate --all -35
   node --version
   npm --version
   readlink -f /home/pmk/cognimap-modernization-2026/node_modules
   readlink -f /home/pmk/cognimap-root-layout-2026/node_modules
   ```

3. Compare local and remote feature refs. Preserve any unexpected uncommitted work; inspect its diff and owner rather than discarding it. Use the new account's own GitHub authentication if a push needs it. Never print tokens.
4. Resolve dependencies before running anything. **Resolved 2026-09-08:** both worktrees now symlink `node_modules` to stable home paths (`/home/pmk/cognimap-deps-2026/a2` and `/home/pmk/cognimap-deps-2026/b2`), each a clean `npm ci` from the committed lockfile. `npm ci` works with no flags; see [DEVELOPMENT-SETUP.md](DEVELOPMENT-SETUP.md). Nothing points at `/tmp/cognimap-a-deps-updated-container-20260908` any more; it is orphaned but was left in place. The historical warning below is kept for context. At the previous checkpoint both `node_modules` entries pointed to `/tmp/cognimap-a-deps-updated-container-20260908/node_modules`. This isolated patched installation is temporary and shared. It may vanish. Never run an installer through a link into the original checkout. Prefer a fresh per-worktree install from the committed lockfile, using `npm ci` after inspecting package scripts and the actual directory/link. Record clean-install failures and fix the cause without a broad lockfile rewrite. Node 22.13.1/npm 11.1.0 were used for the last verification; the declared Node minimum alone does not prove all versions work.
5. Inspect task-owned servers in the actual host namespace, including their command, cwd, port and data directory. Sandbox process lists can miss host listeners. Both browser suites use port 3311 and must run sequentially. Do not attach to an unknown existing server or kill unrelated processes.
6. Re-establish tests if the environment or code changed. Run `npm test`, `npm run build`, then `npm run test:e2e` separately in each worktree. Save full logs under a stable home directory and check the final summary. Do not rerun expensive unchanged suites repeatedly without a reason.
7. Choose the next bounded package below, write its acceptance criteria, and delegate only work with explicit file ownership. Update this handoff after each meaningful milestone.

If continuing on a different machine, clone the public repository and check out the pushed feature branches in separate worktrees. Local private data and screenshots are not in Git. Use committed fixtures first; authentic-data acceptance remains pending until an authorized local copy is available. Do not publish the private dataset to solve portability.

## 4. Data-safety contract

- Native NeDB documents and `quizes.json` remain authoritative. No schema migration is required by the current implementation.
- Preserve IDs, NeDB `_id`, coordinates, dimensions, types, connector direction/weight/style, metadata, node-local links, attachments, scientific source and manual quiz covers.
- Historical IDs include negative integer values outside the safe-integer range. Preserve their existing parsed values exactly; do not apply a blanket safe-integer validator or renumber them. Do not claim recovery of precision already absent in historical serialized numbers.
- Read-only examination of the original NeDB file must decode append records, honoring latest `_id` and `$$deleted`. Opening it through NeDB can compact it.
- All mutation tests use dedicated disposable data copies and an explicit `COGNIMAP_DATA_DIR`. Never run two NeDB processes against one copied database. Each worker/server needs its own copy.
- Original source hashes were checked against `/tmp/cognimap-live-baseline.sha256` and matched at the previous final verification. Preserve that manifest if available. If missing, make a new read-only baseline and state that it cannot retroactively prove earlier history.
- Do not put real datasets, rendered private knowledge, credentials, large generated screenshots or machine-specific dependency trees into Git.

## 5. Implemented versus unfinished scope

| Area | Implemented and exercised | Remaining completion work |
| --- | --- | --- |
| Architecture | Pure Canvas/search/checkpoint modules; explicit navigation bridge; retained legacy widget contracts; verified clean-install reproducibility; unused production dependencies removed | Broader ownership documentation; mathjax-node rendering backend; Angular/Express major upgrades |
| UI | Compact themed workspace; persistent system/light/dark; keyboard focus handling | Systematic responsive/editor-panel review; remaining inaccessible legacy controls |
| Editing | Regression coverage, shortcut isolation, renderer listener cleanup | Full node/connector type matrix, multi-selection/group/copy/resize/undo edge cases |
| Scientific content | Full CodeMirror serialization; asynchronous LaTeX preview/error protection; original chemistry/vector/media preserved | Exhaustive source fidelity, error, resize and lifecycle verification across all widgets |
| Quiz | Contextual reveal/hide, grades, progress, navigation, undo, same-day restart checkpoint; rating no longer reverts concurrent edits; completion and next-due statistics; stale-client and historical-record boundaries covered; persistent undo decided against | Authoring discoverability beyond the current controls; failure injection against the authentic dataset |
| Search | Literal ranked prefix/substring/subsequence search, type filters, recent visits, previous viewport, 3D focus | Connected-context navigation/breadcrumb usability and repeated large-map latency measurements |
| Canvas | Validated preview/additive import, native extension, exact authentic-copy round trip, cross-file roll-forward recovery (P0-B) | Power-loss durability beyond process-restart recovery; asset packaging/Markdown vault optional; edited-native reconciliation optional |
| 3D | Additional deterministic root mode, tapered structure, subordinate cross-links, overview LOD, focus/subtree controls | Measured small-edit stability, collisions/branch readability, GPU/frame-time/memory/streaming profiling |
| Verification | Unit/build/browser suites and authentic-copy checks | Repeated performance and full visual acceptance matrix; not all original wishes have been exhaustively tested |

## 6. Architecture and behavior to preserve

A retains Angular 2.4/ngrx, TypeScript, Express 4, NeDB and webpack 5. Do not begin a framework rewrite merely because versions are old. New seams include:

- `server/lib/interchange/json-canvas.js`: pure projection, native extension and validation.
- `server/lib/search.js`: literal ranked search; user input is not a regex.
- `server/lib/review-checkpoint.js`: optional versioned session recovery.
- `src/app/workspace/`: themes, search/navigation and import preview UI.
- `NavigatorService.focusRequests`: deliberate navigation into 3D, separate from ordinary selection.
- `code-serialization.js`: complete source serialization independent of the visible editor viewport.

Quiz scheduling stays in `server/lib/quiz.js`; preserve its actual SM2-derived retry/day behavior, not a textbook replacement. `q` is dormant and `q1` active. Startup repair completes before requests. Reveal affects only the selected cover through rendering state; it does not move nodes. Schedule writes use temporary-file/rename. The optional version-1 `quiz-session.json` resumes same-day queue/progress and avoids repeating ratings already persisted before a checkpoint interruption. Corrupt/expired checkpoints fall back to native due schedules.

Undo stays session-scoped by deliberate decision (P1-A step 3, 2026-09-08): it corrects a misgrade in the active session. After a restart there is no session to correct, the schedule is already persisted, and re-rating the cover in a later session reaches the same place through the normal algorithm. Making it restart-persistent would need versioned snapshots and revision checks against a cover that may since have been edited — real complexity for a rare window. Do not implement it without a user request. Undo's snapshot is memory-only and unavailable after backend restart. Performing undo does persist the restored schedule and updated checkpoint, while preserving unrelated later edits. Restart resumes progress, not revealed visual state. Keep this distinction accurate in documentation.

Canvas targets JSON Canvas 1.0. The `org.cognimap` v1 extension contains complete native documents, related schedules and a projection hash. Edited projections retaining native metadata are rejected to avoid ambiguous data loss. Removing the extension permits plain Canvas import as new cards. Identity conflicts are rejected. File references are not bundled assets. Canvas requests allow 512 MiB; other APIs retain 100 MiB. Large JSON parsing consumes substantial memory.

Mutation serialization ends when the handler's work ends, not when a slow client finishes downloading a response. Preserve the regression for that distinction. Read-only POST endpoints need not enter the mutation queue.

B's structural forest uses deterministic roots and authored edge preferences; semantic cross-links exert no layout forces. Highest structural outdegree with ID tie-breaking chooses roots, not invented topic semantics. Hash-derived branch directions, subtree/sheet-aware spacing, bounded grid collision relaxation and component offsets provide the layout. Native 2D positions are not rewritten. Preserve all older layout modes, exact spanning-edge classification and reversed-edge taper direction.

## 7. Ordered completion work packages

### P0-A: reproducible environment and dependency triage — steps 1-3 COMPLETE (2026-09-08, commits A `5bfbc31`/`4955bdf`, B `6b42371`)

Delivered: [DEVELOPMENT-SETUP.md](DEVELOPMENT-SETUP.md) records the tested toolchain (Node 22.13.1, npm 11.1.0), the verified `npm ci` procedure and why the tracked `.npmrc` (`legacy-peer-deps=true`) is load-bearing — `@angular/compiler-cli@2.4.6` declares `peer typescript@^2` against the TypeScript 3.9.10 the build needs. Both worktrees were reinstalled from the committed lockfile into stable home paths and re-verified in full.

`npm`, `@angularclass/conventions-loader` and `get-pixels` were declared runtime dependencies with no importer anywhere; removing them cut production advisories from 44 to 19 (critical 5 to 2, high 23 to 8) and 229 lockfile entries, with no source change. Applied and verified independently on each branch.

Step 4 remains open: `mathjax-node` is the one production advisory chain with a traced runtime path (`server/routes/media.js`), and its fix is a rendering-backend change, not a version bump. Angular/Express/mathjax fixes are major-only and belong to §7 P2. The 310-change non-forced `npm audit fix` was evaluated and deliberately not applied — it bumps webpack and a transitive `selfsigned` major.

**Original scope, retained for reference:**

**Owner:** build/dependency worker; parent owns upgrade boundaries. Work on A first, selectively repeat independent fixes on B with its own tests.

1. Verify a clean installation from the committed lockfile in an isolated location. Document supported tested Node/npm versions and exact setup.
2. Refresh the registry audit. The pre-patch snapshot had 104 vulnerable package records, 45 production-installed; these include build tools and are not a reachability analysis. Only `path-to-regexp` 0.1.12 → 0.1.13 was patched on both branches.
3. Inventory direct/transitive owners and runtime exposure. Prioritize compatible fixes. Review each semantic lockfile diff; avoid `npm audit fix --force`.
4. For Angular/MathJax/Express or loader changes requiring major compatibility work, write a staged proposal tied to scientific/editor/browser tests. Do not remove a loader before tracing its configuration uses.

**Gate:** fresh install, tests/build/browser suite pass; audit findings distinguished from demonstrated exposure; remaining advisories documented. Suggested commits: `build: document reproducible development setup`, then individual `fix(deps): ...` commits.

### P0-B: import crash consistency — COMPLETE (2026-09-08, commits `2ecc5b8`, `faf1f17`, `2de3548`, `ef905d9`)

Delivered: `server/lib/interchange/import-journal.js` records a versioned intent (`canvas-import-journal.json`) before the first write and rolls it forward at startup, ahead of stale-cover repair. Documents get their database identity before the intent commits, so a retry cannot duplicate them. Recovery is idempotent; a record that exists but differs from the intent stops recovery without overwriting anything; unrelated documents and schedules are never touched. A runtime import failure retains its journal and blocks graph requests — including ones already queued behind it — until a restart completes recovery, reported as `import_recovery_required` (503). A rejected import writes nothing and leaves the map usable. Duplicate quiz schedules inside one payload are now rejected before insertion. Contract and failure-boundary table: [CANVAS-RECOVERY.md](CANVAS-RECOVERY.md).

Tested: 15 unit tests (`server/test/import-journal.test.js`) over real temporary NeDB and QuizManager instances — resume before/during/after insertion, after schedule save, repeated recovery, conflicting native/internal/schedule identity, malformed and future-version journals retained, injected insert and save failures with in-memory schedule restore, uncommitted `.writing` leftovers. Two HTTP tests (`server/test/canvas-recovery-api.test.js`) inject a schedule-write failure, assert the block, restart the process and compare recovered documents and schedules exactly. One browser test (`e2e/canvas-recovery.spec.js`) drives a native import through the real workspace UI and asserts no pending intent remains.

Explicitly not claimed: power-loss durability without filesystem synchronization, atomic snapshots for reads in flight, or a cross-file ACID transaction between NeDB and `quizes.json`. Not yet done from the original package: characterization on the authentic 41k-node copy (the recovery path was exercised on fixtures only), and re-benchmarking import timings against the journal implementation — §9's pre-journal figures do not measure it.

**Original scope, retained for reference:**

**Owner:** backend worker, scoped to Canvas import orchestration and new recovery tests. Parent must review the persistence design before implementation.

1. Trace native insertion, schedule persistence and preview-token lifecycle. Characterize current partial-failure behavior on a disposable database.
2. Specify an optional versioned operation journal or equivalent recovery protocol. Record intent before writes; define idempotent recovery, ownership of inserted identities and when success is acknowledged. Do not introduce rollback that deletes unrelated documents or concurrent edits.
3. Inject failures before/after each persistence boundary and restart the process. Test retry, duplicate request, conflicting IDs, invalid schedule and interrupted journal updates.
4. Keep the adapter pure and existing native files backward compatible. Define how an older application version behaves with the optional recovery artifact.

**Gate:** interrupted imports reach a documented consistent state on restart without losing pre-existing content; exact document/schedule comparison; plain/native Canvas tests and full backend/browser regression pass. Commit characterization, protocol and recovery separately.

### P1-A: review workflow closure — COMPLETE (2026-09-08, commits `345e6f0`, `9a8a36e`, `0d49b28`, `0dc7a6a`)

**Bug fixed, data loss.** The review queue holds documents copied when the session loads. Rating wrote that snapshot back as a whole document, so every edit made to a cover during the session — title, position, size, content — was silently reverted the moment the user graded it. Rating now reads the current document and persists only what it owns, the two fields undo already limited itself to. A schedule whose document no longer exists reports `unchanged` instead of advancing on its own.

**Bug fixed, availability.** A schedule record without a `cat` array — written before categories existed — made `/quiz/load` return 500 and the review feature unusable until the file was repaired by hand. Category filtering had the same gap. Both normalise now; stored records are not rewritten.

**Statistics and completion.** A finished session showed the same sentence as one that never had items. It now reports completion with the count rated, and surfaces the upcoming due counts the backend already sent and the client silently discarded. Those counts are recomputed after rating and undo, because the figure taken at session start is stale exactly when the queue empties. Derivation only; no schedule changes.

**Decision recorded:** restart-persistent undo is not needed — see §6.

**Boundaries now covered** (`server/test/quiz.test.js`, `server/test/quiz-boundaries.test.js`, `e2e/modernization.spec.js`): edits during a session survive rating; rating an element outside the current queue, a second rating from a stale tab, and rating a cover deleted mid-session all change nothing; historical schedules without categories start a session; an expired checkpoint falls back to a fresh session; a restart after undo resumes the restored cover and progress; a finished session reports completion and next-due; reveal stays targeted across question navigation and leaves nothing revealed behind. The golden scheduling test (`legacy successful recall and in-session retry math remains unchanged`) still passes untouched.

**Not done:** failure injection against the authentic dataset rather than fixtures, and a wider authoring-discoverability pass — the current controls (subject/topic/subtopic selects, include-future-items, the authoring note) are usable and now exercised by a browser test, but no user study justified changing them.

**Original scope, retained for reference:**

**Owner:** review worker; isolate UI changes from scheduler logic.

1. Audit authoring versus review state: discoverability of creating covers/question relationships, start/resume, due count, keyboard reveal/grade, empty completion and retry progress.
2. Add failure tests for checkpoint/schedule boundaries, stale clients/tabs, deleted/edited covers, midnight/expiry, malformed historical records and restart after grading/undo.
3. Improve session statistics and end-of-session messaging without changing scheduling. Decide explicitly whether restart-persistent undo is needed to meet the intended workflow; if implemented, use versioned snapshots and revision checks, not full-file restoration.
4. Assert reveal/hide never alters geometry and switching questions cannot leave extra covers revealed. Keep useful map context visible.

**Gate:** historical scheduling golden tests unchanged; exactly targeted reveal; clean progression/restart; accessible keyboard actions; no silent schedule mutation on invalid requests. Suggested commits: `test: characterize review recovery boundaries`, `feat: clarify review authoring and completion`.

### P1-B: 2D/editor and science usability pass

**Owner:** UI/science workers with non-overlapping file ownership. Start with a matrix rather than a broad rewrite.

Exercise creation/edit/save/reload/delete, selection/multi-selection, drag/resize/group/copy/link, connector type/style/direction, templates, attachments and undo/redo. For each significant UI change check both themes, desktop and narrow viewport, keyboard-only focus and real browser errors.

For science, cover inline/block LaTeX, invalid/slow/stale preview, copying source, large CodeMirror content/language selection, molecular JSME editing, chemical reaction text distinct from molecular structures, SVG/vector edit/reopen, images and missing media. Verify source and metadata round trips, not only pixels. Check event cleanup after repeated editor/view open/close and theme/resize changes.

An earlier interrupted run emitted four SVG NaN attribute errors; a fresh-copy traced run did not reproduce them. Capture a document and stack if this recurs. Do not add blanket error suppression or speculative coordinate replacement.

**Gate:** native before/after comparisons preserve intended fields; root-cause regressions for found bugs; screenshots inspected locally; no unexplained console errors in tested flows. Commit per bug or coherent panel improvement.

### P1-C: navigation and large-map search

**Owner:** focused navigation worker.

1. Inventory existing parent/child/connected-node commands before duplicating them.
2. Make graph context understandable through usable connected-node navigation and breadcrumbs/history where supported by actual links. Never invent hierarchy or subject labels.
3. Check return-to-previous-location semantics in 2D and 3D, explicit focus versus selection, stale/deleted recent nodes, filters, result highlighting and keyboard operation.
4. Measure repeated large-map search/query/update latency before adding indexes/caches; invalidate caches correctly after mutation/import.

**Gate:** reproducible context traversal with no stale selection; median/p95 query timings and mutation correctness; both renderers focus the intended native ID.

### P1-D: root-layout quality and performance

**Owner:** B-only graph/renderer worker; parent reviews geometry and real-map visuals.

1. Characterize deterministic output and changes after adding/removing a leaf, cross-link, structural edge and component. Define acceptable movement metrics before tuning; stable between identical runs is not sufficient proof of stability after edits.
2. Measure collisions/sheet overlap and branch separation on authentic structure and adversarial synthetic forests. Preserve exact structural/cross-edge identity, including parallel/reversed edges.
3. Review overview, dominant subtree, frame-all, close rich sheets and cross-domain selection in both themes. Improve readability based on captures; no generic force-layout replacement.
4. Record CPU layout time plus browser frame-time percentiles, interaction responsiveness, draw calls, rich-content streaming, JS/GPU memory where measurable, and cleanup after repeated mode switches. Run repeated warm/cold samples and record hardware/browser.
5. Tune LOD/cross-link fading/caching only against these measurements. Keep useful scientific content near selection and all existing modes functional.

**Gate:** deterministic tests, edit-stability report, acceptable documented real-map interaction, no persistent memory growth across repeated transitions, rich chemistry/math/media verified, full B suites passing. Use separate layout, rendering, interaction and performance commits.

### P2: optional interoperability extensions and staged migration

Asset packaging/Markdown vault export is optional in the original brief. Decide from remaining time and user value; it must not displace crash safety. If added, use explicit asset manifests, safe relative paths, missing-file reporting and no overwrite of an existing vault. Preserve native extension data and test packaged round trips.

Conflict-aware re-import of externally edited native Canvas is a separate feature, not a reason to weaken current projection-hash validation. Specify conflict resolution and preview first.

A full framework migration is not a prerequisite by itself. If justified by security/maintenance analysis, isolate it behind preserved model/widget contracts and move incrementally with the complete science/review/data compatibility suite at each checkpoint.

## 8. Verification baseline and acceptance matrix

Last completed runs on the implementation baselines:

| Check | Branch A (`0dc7a6a`) | Branch B (`6b42371`) |
| --- | --- | --- |
| `npm ci` from lockfile | Pass, 1458 packages | Pass, 1458 packages |
| `npm test` | 105 passing; two existing lint warnings | 61 passing |
| `npm run build` | Pass; three existing bundle-size warnings | Pass; same three warnings |
| `npm run test:e2e` | 43 passing, 3.1 minutes | 39 passing, 3.2 minutes |

Both rows were measured at the stated heads on fresh installs, after the dependency removal. A's counts rose from the 80/40 baseline by the 18 unit and one browser test added for P0-B.

Do not require counts to remain constant after adding tests, but investigate unexplained reductions. One earlier wrong-worktree execution was detected by the 61 versus 80 count difference.

Required final matrix:

- Historical document identities, all supported node/connector types, dangling/malformed input handling and no unintended native mutation.
- Quiz scheduling, q/q1 startup repair, targeted reveal/hide, grading/retry/undo, checkpoint restart, empty/end state and interrupted persistence.
- Canvas plain import, native round trip, preview token, conflicts, edited projection rejection, large HTTP body and recovery.
- Light/dark/system, live system changes, responsive layout, keyboard-only operation, source editors, missing media and repeated lifecycle transitions.
- 2D plus every existing 3D mode, selected-node editor integration, root overview/subtree/all/focus/cross-links and rich scientific sheets.
- Representative synthetic sizes and authentic approximately 41k-node copied dataset. Record CPU and browser measurements separately.

Browser fixtures are prepared by `e2e/start-server.js` before NeDB initialization. Preserve this ordering. Both configs use port 3311 and `reuseExistingServer: false`; run sequentially. Hidden CodeMirror textareas need focus/keyboard events rather than a visibility-dependent click. Review tests must explicitly start/refresh a session before assuming zero progress. Capture an original timeout before a cleanup failure can mask it.

## 9. Measurements: evidence, not guarantees

- Native Canvas HTTP import: exact 81,240 documents and 1,813 schedules; preview 8.075 s, import 11.134 s into an empty temporary database.
- Export projects 41,371 nodes and 39,806 edges. A real 211,847,118-byte HTTP payload was accepted. A sampled RSS around 3.18 GB is not a rigorous peak-memory result.
- Root render graph: 39,327 nodes and 39,767 edges; 39,170 structural and 597 cross edges. Overlay filtering explains the difference from the positive-document count.
- One CPU benchmark: 2D 781.4 ms / 62.4 MiB; cognitive tree 1,819.8 ms / 81.5 MiB; root 2,062.8 ms / 76.2 MiB. These are single-run layout/heap measurements, not FPS.
- Root overview uses up to 700 strong limbs and 701 endpoints in two draw calls. Initial framing uses the dominant 38,968-node subtree; frame-all deliberately includes distant smaller components.
- Search single runs: `orbital` 47 ms, `chem` 16 ms, literal `[` 11 ms, capped at 40 results. Repeat before setting latency targets.
- Fresh authentic-copy review: 42 remaining/0 rated → 41/1 → 42/0 after undo, identical cover geometry around reveal, no traced invalid SVG assignments or console errors.

## 10. Evidence locations and portability

Stable local logs:

- `/home/pmk/cognimap-verification-2026/modernization-tests.log`
- `/home/pmk/cognimap-verification-2026/modernization-build.log`
- `/home/pmk/cognimap-verification-2026/modernization-e2e.log` (current, 41 passing)
- `/home/pmk/cognimap-modernization-patched-e2e.log` (earlier run)
- `/home/pmk/cognimap-verification-2026/root-tests.log`
- `/home/pmk/cognimap-verification-2026/root-build.log`
- `/home/pmk/cognimap-verification-2026/root-e2e.log`

Ephemeral evidence, if still present:

- `/tmp/cognimap-live-baseline.sha256`
- `/tmp/cognimap-large-import-http.json`
- `/tmp/cognimap-large-canvas-report.json`
- `/tmp/cognimap-large-canvas-http.json`
- `/tmp/cognimap-root-final-benchmark.log`
- `/tmp/cognimap-a-real-quiz-nan.json`
- `/tmp/cognimap-root-real-initial-largest-subtree-dark-final.png`
- `/tmp/cognimap-root-real-overview-dark-final.png`
- `/tmp/cognimap-root-real-latex-focus-dark-final.png`
- `/tmp/cognimap-dependency-audit-summary.md`

Archive selected local evidence outside Git if needed for an account change. Inspect it for private knowledge before sharing. If an artifact has vanished, retain the documented historical result as historical; rerun the relevant acceptance check rather than implying fresh verification. The empty temporary full-import database was removed intentionally after its comparison passed.

## 11. Cheap-agent delegation protocol

Installed CLI: `/home/pmk/.local/bin/devin`. `--model glm-5.2` worked. A catalog-listed Gemini identifier was rejected by this CLI; discover supported identifiers rather than assuming the user's illustrative model names are installed or free. Never claim a price without checking it.

For a read-only task:

```bash
/home/pmk/.local/bin/devin --model glm-5.2 --permission-mode auto \
  --prompt-file /home/pmk/cognimap-worker-task.txt -p \
  > /home/pmk/cognimap-worker-result.log 2>&1
```

For a specifically scoped coding task, use the appropriate edit permission mode (`accept-edits`) after defining its boundaries. Avoid broad/dangerous permission bypasses. Do not send actual private map content or credentials to a remote model.

Every ticket must specify:

1. Absolute worktree path and expected branch; worker verifies them before edits.
2. Exact owned files/module and allowed reads. Other workers may be active: do not revert their changes.
3. Concrete behavior and invariants, with explicit non-goals.
4. A small acceptance test and evidence format, including failures and uncertainty.
5. No original-data access, shared database/server, dependency changes or commits unless specifically assigned.
6. A concise result with changed files, tests and limitations.

Delegate inventory, characterization tests, mechanical edits, small UI fixes and draft documentation. Keep persistence protocol, branch integration, dependency risk, algorithm tradeoffs and final review with the senior agent. Review every diff and claim: an earlier GLM draft incorrectly said undo did not persist its checkpoint; the code does. Run browser suites sequentially and avoid workers competing for port 3311. Stop a stuck/incorrect task and narrow its scope rather than repeatedly consuming a large context.

## 12. Commit and handoff discipline

Use small logical commits after relevant checks. Stage explicit paths. Check `git status`, `git diff --check`, actual branch and diff before committing. Push only the two feature branches with normal fast-forward pushes; never force-push, merge into master, rewrite an existing branch or destroy uncommitted work. Git metadata on the external mount may need an approved escalation even though feature files are in home.

At each limit boundary, update this document or a linked continuation log with:

- Exact current heads, remote push status and dirty/staged files with ownership.
- Work package completed, partial code not yet reviewed and next concrete action.
- Tests actually completed, failures with log paths, and tests still pending.
- Every still-running worker/server: session/PID if known, cwd, port, data directory, output log and whether safe to stop.
- Temporary dependencies/data/evidence that may disappear, without credentials or private content.
- New findings versus hypotheses, and any acceptance criteria intentionally deferred.

Do not leave the next account to infer whether a running test passed. Do not mark the project complete merely because a budget is low. Do not kill unrelated browser/Node processes or copy private account configuration for handoff.

## 13. Final completion gate and report

A is ready for final user review when the data/science/review contracts are preserved, the remaining material stability issues are fixed or explicitly evidenced as limitations, the UI/editor matrix is inspected, Canvas recovery is tested, and clean-install/unit/build/browser checks pass. B additionally needs demonstrated root readability, small-edit stability and measured authentic-map interaction/streaming performance while preserving all older modes.

Report the two final branch names and SHAs, architectural/UI/review/science/Canvas changes, bugs fixed, root algorithm, measurements with conditions, exact test results, remaining limitations and sensible next steps. Distinguish optional extensions and major future migration from unmet critical safety/usability requirements. Leave both branches pushed and reviewable, with no merge into master. The user, not an automated cleanup step, decides how to integrate the two deliverables.

## 14. Continuation log

### 2026-09-08 — P0-B closed, both branches pushed

**Heads.** A implementation head `ef905d9`, plus the documentation commits that carry this log; B `efa560b`. Both clean, both pushed to `origin`. B's `efa560b` had been committed but never pushed by the previous session, which stopped at a usage limit immediately after committing; it is pushed now.

**Completed.** P0-B (import crash consistency) in four commits on A: `2ecc5b8` journal module and unit tests, `faf1f17` route integration plus the duplicate-schedule rejection, `2de3548` contract documentation, `ef905d9` browser test. Details and explicit non-claims are in §7 under P0-B.

**Recovered work.** The previous session had left A's working tree carrying a route integration, an HTTP recovery test and `CANVAS-RECOVERY.md` that all referenced `server/lib/interchange/import-journal.js` — a module the delegated Devin worker never produced. Two Devin invocations failed with `cognition.ai/errorKind: unavailable` connection errors and one earlier one refused a tool call in non-interactive mode; no worker output was usable. The module was written directly against the ticket in `/home/pmk/cognimap-import-journal-task.txt`, which remains an accurate specification of what was built. One design defect in the inherited route code was fixed: `importPending` was latched before `begin()`, so a rejected import — bad duplicate schedules, or an already-pending journal — would have blocked the whole map until a restart despite writing nothing. It now reflects whether a journal actually survives.

**Tests actually run this session, on A only.** `npm test` 98 passing (log `/home/pmk/cognimap-verification-2026/modernization-tests.log`); `npm run build` pass with the three known bundle-size warnings (`modernization-build.log`); `npm run test:e2e` 41 passing in 3.1 minutes (`modernization-e2e.log`). The unit and browser suites were also run individually against the new specs before the full runs. B's suites were **not** re-run at `efa560b`; see §8.

**Environment as left.** No servers or workers are running; port 3311 and the scratch port 3399 are free. A scratch server was started once on 3399 against a disposable fixture copy and has been stopped. `node_modules` in both worktrees still symlink to `/tmp/cognimap-a-deps-updated-container-20260908/node_modules`, which was alive throughout this session — P0-A's clean-install work is still open and this link is still the single largest environment risk.

**Finding, not a hypothesis.** The Claude-in-Chrome browser extension could not load `http://127.0.0.1:3399/` or `http://localhost:3399/` in this environment — every attempt returned "Frame with ID 0 is showing error page", while `curl` fetched the same index and bundle with HTTP 200. Interactive extension-driven checks of a local server are therefore unavailable here; Playwright against port 3311 is the working browser path and is what the browser coverage above uses.

**Next concrete action.** P0-A: verify a clean `npm ci` from the committed lockfile in an isolated location, so neither worktree depends on the `/tmp` tree, then refresh the dependency audit. After that, the two P0-B items deliberately deferred — exercising recovery against the authentic 41k-node copy, and re-benchmarking import timings against the journal, since §9's figures predate it.

### 2026-09-08 (later) — P0-A steps 1-3 closed, both branches reinstalled and re-verified

**Heads.** A `4955bdf` plus this log's commit; B `6b42371`. Both clean and pushed.

**Completed.** P0-A steps 1-3, described in §7 and in full in [DEVELOPMENT-SETUP.md](DEVELOPMENT-SETUP.md). Also fixed a fixture landmine in the P0-B browser test: its imported copy sat at the source node's coordinates and was long overdue, so it would have joined the review queue and shared a position with fixture content that later specs click (A `84eea41`).

**Correction to an earlier reading.** A first clean-install attempt failed with `ERESOLVE` on the Angular/TypeScript peer range. That was an artifact of copying only `package.json` and `package-lock.json` into a scratch directory: the repository already tracks an `.npmrc` with `legacy-peer-deps=true`, and `npm ci` in a real checkout succeeds with no flags. There is no clean-install defect. Copy `.npmrc` with the manifests when reproducing an install outside a checkout.

**Environment as left.** No servers or workers running; ports 3311 and 3399 free. `node_modules` symlinks: A → `/home/pmk/cognimap-deps-2026/a2/node_modules`, B → `/home/pmk/cognimap-deps-2026/b2/node_modules`, both stable home paths, both clean `npm ci` results from the committed lockfiles. `/tmp/cognimap-a-deps-updated-container-20260908` is orphaned; nothing references it and it was left in place rather than deleted. `/home/pmk/cognimap-deps-2026/a` and `b` are the earlier pre-pruning installs and can be removed. Audit reports are in `/home/pmk/cognimap-verification-2026/audit-a*.json`; all suite logs in that same directory were overwritten with the current runs.

**Next concrete action.** P0-A step 4 (`mathjax-node` rendering backend proposal tied to the scientific-content matrix), then the P1 packages in handoff order — P1-A review workflow closure, P1-B editor/science usability matrix, P1-C navigation and large-map search, P1-D root-layout quality on B. The two P0-B items deferred earlier also remain: recovery against the authentic 41k-node copy, and re-benchmarking import timings against the journal.

### 2026-09-08 (third session) — P1-A closed; a data-loss bug found and fixed

**Heads.** A implementation head `0dc7a6a` plus this log's commit; B `6b42371`. Both clean and pushed.

**Completed.** P1-A, described in §7. The material finding is the first one there: rating a cover silently reverted any edit made to it during the session. That was reachable in ordinary use — start a review, fix a typo or nudge a node, grade it, lose the change — and it is now covered by a regression that asserts title, `coor` and all four bounds survive rating.

**New finding, not fixed, belongs to P1-B.** `PUT /cme` (`server/routes/cme.js`, the `db.updateAsync({ id: arg.id }, data, { upsert: true })` at the end of the handler) has the same whole-document-replace shape as the rating bug did, in the opposite direction. Characterized: load a review, rate a cover, then let a client that still holds the pre-rating copy save any edit. The cover reverts to `q1` with the pre-rating scheduling style while `quizes.json` keeps the post-rating schedule, so the persisted cover and its schedule disagree and the cover reappears as active. It self-heals at the next restart through the stale-`q1` repair, so it is a session-level inconsistency rather than data loss. The root cause in both places is writing a whole document a client or queue snapshotted earlier; `PUT /cme` also owns `types`, which is why it can overwrite review state. Fixing it means deciding which fields the edit path owns — the same question the rating fix answered for its side — so it belongs with P1-B's editor matrix, not to a quick patch.

**Also noted, not touched.** `tb-quizzing.component.ts` has an empty `if (this.overduearray.length > 0) { }` block in the `loadedQuizes` listener. Pre-existing dead code; left alone.

**Tests run this session, branch A only.** `npm test` 105 passing, still exactly the two known lint warnings; `npm run build` pass with the three known bundle-size warnings; `npm run test:e2e` 43 passing. Logs overwritten in place under `/home/pmk/cognimap-verification-2026/`. B was not re-run — nothing on B changed after `6b42371`, whose full verification is recorded in §8.

**Environment as left.** No servers or workers running; ports 3311 and 3399 free. Dependency symlinks unchanged from the previous entry: A → `/home/pmk/cognimap-deps-2026/a2`, B → `/home/pmk/cognimap-deps-2026/b2`. Probe scripts used to characterize the two bugs were written to the session scratchpad and are not in Git; the behaviors they found are all covered by committed tests except the `PUT /cme` finding above, which has no test yet by intent — write it with the fix.

**Next concrete action.** P1-B, starting with the `PUT /cme` whole-document-replace finding, since it is the last known correctness gap of that family and the editor matrix has to touch that handler anyway. Then P1-C navigation, P1-D root layout on B, and P0-A step 4 (`mathjax-node`). The two deferred P0-B items also remain: recovery against the authentic 41k-node copy, and re-benchmarking import timings against the journal.
