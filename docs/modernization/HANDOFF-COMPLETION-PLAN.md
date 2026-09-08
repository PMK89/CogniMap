# CogniMap completion plan and account handoff

Prepared 2026-09-08. This is the continuation contract for the modernization project. Read this before making changes. Passing suites establish a useful checkpoint, not completion of every requirement in the original brief.

## 1. Start here: prompt for the next account

> Continue the CogniMap modernization described in `docs/modernization/HANDOFF-COMPLETION-PLAN.md`. First verify the two feature branches, working trees, installed dependency targets, and running processes. Preserve all existing branches and original knowledge data. Work on the existing new feature branches; do not merge either into master. Read the branch-specific architecture documents, then address the priority work packages below in small tested commits. Delegate bounded implementation to the installed Devin CLI using an available inexpensive model; retain architecture, data-safety decisions, integration and final review yourself. Do not assume previous test artifacts or `/tmp` dependencies survive an account/environment change. Record verified facts separately from hypotheses and unfinished work. Ordinary implementation, tests, feature-branch commits and pushes are already authorized. Never transfer credentials between accounts.

The original objective is a stable, usable, modern cognitive-map application preserving the complete native graph, scientific content and SM2-derived review behavior, plus an independently reviewable root-like 3D layout branch. Do not add generated knowledge or cloud AI features. Do not simplify the graph to fit a replacement UI.

## 2. Exact implementation checkpoint

These are implementation baseline SHAs, before any commit containing this handoff document:

| Deliverable | Branch | Baseline SHA | Local worktree |
| --- | --- | --- | --- |
| A: general modernization | `feature/cognimap-modernization-2026` | `16052b3e04f5134640f01147690f2e07ad1e1e02` | `/home/pmk/cognimap-modernization-2026` |
| B: additional root layout | `feature/3d-root-network-layout-2026` | `798b5c2ce0b0a5b4504f8bcbb91bdeaedaf8ac50` | `/home/pmk/cognimap-root-layout-2026` |

Both baselines were clean and pushed to `https://github.com/PMK89/CogniMap.git`. Inspect current HEAD rather than resetting to these hashes: later documentation or implementation commits may exist.

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
4. Resolve dependencies before running anything. At this checkpoint both `node_modules` entries point to `/tmp/cognimap-a-deps-updated-container-20260908/node_modules`. This isolated patched installation is temporary and shared. It may vanish. Never run an installer through a link into the original checkout. Prefer a fresh per-worktree install from the committed lockfile, using `npm ci` after inspecting package scripts and the actual directory/link. Record clean-install failures and fix the cause without a broad lockfile rewrite. Node 22.13.1/npm 11.1.0 were used for the last verification; the declared Node minimum alone does not prove all versions work.
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
| Architecture | Pure Canvas/search/checkpoint modules; explicit navigation bridge; retained legacy widget contracts | Broader ownership documentation, clean-install reproducibility, incremental dependency/security work |
| UI | Compact themed workspace; persistent system/light/dark; keyboard focus handling | Systematic responsive/editor-panel review; remaining inaccessible legacy controls |
| Editing | Regression coverage, shortcut isolation, renderer listener cleanup | Full node/connector type matrix, multi-selection/group/copy/resize/undo edge cases |
| Scientific content | Full CodeMirror serialization; asynchronous LaTeX preview/error protection; original chemistry/vector/media preserved | Exhaustive source fidelity, error, resize and lifecycle verification across all widgets |
| Quiz | Contextual reveal/hide, grades, progress, navigation, undo, same-day restart checkpoint | Authoring clarity, richer session statistics, stale-client/failure-injection matrix; persistent undo decision |
| Search | Literal ranked prefix/substring/subsequence search, type filters, recent visits, previous viewport, 3D focus | Connected-context navigation/breadcrumb usability and repeated large-map latency measurements |
| Canvas | Validated preview/additive import, native extension, exact authentic-copy round trip | Cross-file crash recovery; asset packaging/Markdown vault optional; edited-native reconciliation optional |
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

Undo's snapshot is memory-only and unavailable after backend restart. Performing undo does persist the restored schedule and updated checkpoint, while preserving unrelated later edits. Restart resumes progress, not revealed visual state. Keep this distinction accurate in documentation.

Canvas targets JSON Canvas 1.0. The `org.cognimap` v1 extension contains complete native documents, related schedules and a projection hash. Edited projections retaining native metadata are rejected to avoid ambiguous data loss. Removing the extension permits plain Canvas import as new cards. Identity conflicts are rejected. File references are not bundled assets. Canvas requests allow 512 MiB; other APIs retain 100 MiB. Large JSON parsing consumes substantial memory.

Mutation serialization ends when the handler's work ends, not when a slow client finishes downloading a response. Preserve the regression for that distinction. Read-only POST endpoints need not enter the mutation queue.

B's structural forest uses deterministic roots and authored edge preferences; semantic cross-links exert no layout forces. Highest structural outdegree with ID tie-breaking chooses roots, not invented topic semantics. Hash-derived branch directions, subtree/sheet-aware spacing, bounded grid collision relaxation and component offsets provide the layout. Native 2D positions are not rewritten. Preserve all older layout modes, exact spanning-edge classification and reversed-edge taper direction.

## 7. Ordered completion work packages

### P0-A: reproducible environment and dependency triage

**Owner:** build/dependency worker; parent owns upgrade boundaries. Work on A first, selectively repeat independent fixes on B with its own tests.

1. Verify a clean installation from the committed lockfile in an isolated location. Document supported tested Node/npm versions and exact setup.
2. Refresh the registry audit. The pre-patch snapshot had 104 vulnerable package records, 45 production-installed; these include build tools and are not a reachability analysis. Only `path-to-regexp` 0.1.12 → 0.1.13 was patched on both branches.
3. Inventory direct/transitive owners and runtime exposure. Prioritize compatible fixes. Review each semantic lockfile diff; avoid `npm audit fix --force`.
4. For Angular/MathJax/Express or loader changes requiring major compatibility work, write a staged proposal tied to scientific/editor/browser tests. Do not remove a loader before tracing its configuration uses.

**Gate:** fresh install, tests/build/browser suite pass; audit findings distinguished from demonstrated exposure; remaining advisories documented. Suggested commits: `build: document reproducible development setup`, then individual `fix(deps): ...` commits.

### P0-B: import crash consistency

**Owner:** backend worker, scoped to Canvas import orchestration and new recovery tests. Parent must review the persistence design before implementation.

1. Trace native insertion, schedule persistence and preview-token lifecycle. Characterize current partial-failure behavior on a disposable database.
2. Specify an optional versioned operation journal or equivalent recovery protocol. Record intent before writes; define idempotent recovery, ownership of inserted identities and when success is acknowledged. Do not introduce rollback that deletes unrelated documents or concurrent edits.
3. Inject failures before/after each persistence boundary and restart the process. Test retry, duplicate request, conflicting IDs, invalid schedule and interrupted journal updates.
4. Keep the adapter pure and existing native files backward compatible. Define how an older application version behaves with the optional recovery artifact.

**Gate:** interrupted imports reach a documented consistent state on restart without losing pre-existing content; exact document/schedule comparison; plain/native Canvas tests and full backend/browser regression pass. Commit characterization, protocol and recovery separately.

### P1-A: review workflow closure

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

| Check | Branch A | Branch B |
| --- | --- | --- |
| `npm test` | 80 passing; two existing lint warnings | 61 passing |
| `npm run build` | Pass; three existing bundle-size warnings | Pass; three existing bundle-size warnings |
| `npm run test:e2e` | 40 passing, 3.2 minutes | 39 passing, 3.3 minutes |

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
- `/home/pmk/cognimap-modernization-patched-e2e.log`
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
