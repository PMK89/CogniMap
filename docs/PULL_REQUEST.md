# Modernize CogniMap UI, backend, and runtime

> This file is the prepared pull-request description for the
> `modernize-ui-backend-runtime` branch. Open the PR at:
> https://github.com/PMK89/CogniMap/compare/master...modernize-ui-backend-runtime

## Summary of user-visible changes

- **CogniMap now runs in a normal browser.** `npm start` serves the app at
  http://127.0.0.1:3210 — Electron is no longer needed and has been removed
  from dependencies and scripts (old runtime preserved under `legacy/electron/`).
- **Modern UI chrome**: a CSS design system for toolbars, panels, menus and
  widgets — elevated surfaces, consistent spacing/typography, hover/focus/
  disabled states, visible keyboard focus, reduced-motion support.
- **Dark/light theme** with OS-preference default and a persistent manual
  toggle (◐, bottom right), applied before first paint. Includes a dark
  canvas variant: the map itself is inverted at the presentation layer
  (stored element colors untouched; photos/videos counter-inverted to
  keep true colors). Complex embedded vector figures with gradient fills
  may show minor inversion artifacts — documented limitation.
- **SVG editor integration repaired**: the vector editor's CogniMap bridge
  (`cminterface.js`) was an empty stub — drawings could never be exported.
  It now exports `{type:'svg'}` JSON (CM button) and accepts input, matching
  the JSME editor's contract.
- **Empty-map-on-reload fixed**: element loading only triggered on scroll
  events; a browser reload restores scroll, so the map stayed empty until
  the user scrolled a full window width. The initial viewport now loads
  explicitly.
- **Navigator crash fixed**: opening the navigator with no element selected
  threw in the template and poisoned subsequent widget switching.
- Faster startup: backend cold start ≈ 240 ms / 76 MB RSS, versus the
  Electron shell with three BrowserWindows and forced DevTools.

## Architecture changes

```
Before: Electron main process (main.js, dbprocess.js, mediaprocess.js,
        settingsController.js) ⇄ ipcRenderer.send/sendSync (~40 channels)
        nodeIntegration: true, contextIsolation: false

After:  Express backend (server/) with typed JSON APIs + static serving
        ⇄ BackendService shim (ipcRenderer-compatible facade over HTTP)
```

- `server/routes/config.js` — settings / colors / buttons / templates /
  special characters (ports settingsController.js 1:1, including the
  mode-normalization quirk; button edits now persist to disk — old code
  silently dropped them on restart).
- `server/routes/cme.js` — element CRUD, viewport queries, graph traversal
  (`findChildren`/`findArea` including legacy quirks), minimap, quiz
  scheduling (hand-rolled SM2 variant ported verbatim into
  `server/lib/quiz.js`), import/export/wipe.
- `server/routes/media.js` — MathJax LaTeX→SVG (mathjax-node in-process,
  no hidden window), PNG transparency tool, clipboard-image upload,
  media-open URL resolution.
- `server/routes/assets.js` — recursive asset listing (navigator).
- All payloads validated with ajv; errors are structured
  `{error:{code,message,details}}`; all file access goes through
  traversal-safe `resolveInside()`; server binds to 127.0.0.1.
- Frontend: `src/app/shared/backend.service.ts` exposes
  `ipcRenderer.send/sendSync/on`; all 14 former `ElectronService` consumers
  switched with minimal diffs. `sendSync` = synchronous XHR on localhost
  (the Electron call was equally blocking); documented as tech debt.
- Clipboard: browser paste events with a `nextPaste()` bridge (keydown
  fires before the paste event); pasted images upload to the backend.

## How Electron was replaced or reduced

- Removed deps: `electron`, `ngx-electron`, `@electron/remote`,
  `electron-packager`, `@electron/rebuild` (+ dead `mongodb`).
- `main.js`, `menu.js`, `dbprocess*.js`, `mediaprocess.js`,
  `settingsController.js/.ts`, `models/` moved to `legacy/electron/`.
- The two hidden 1×1 BrowserWindows hosted nothing (they never loaded a
  URL) — their handlers ran in the main process and are now plain routes.
- Native menu Load/Save/Delete DB → `/api/db/*`; widget pop-out windows →
  browser popups; `shell.openExternal`/VLC/KolourPaint `exec()` calls →
  `/files/` URLs opened in tabs (see migration notes).

## Preserved features checklist

- [x] Visual concept-map editing, node + link creation/editing (canvas, Snap.svg, all modes)
- [x] Templates (load/change/new; duplicate-id conflict handling)
- [x] Styles, colors, fonts, line styles, object styles (data-driven, unchanged)
- [x] Toolbar workflows (all tb-* panels untouched; chrome restyled)
- [x] Settings panel + settings persistence (incl. legacy mode normalization)
- [x] Special characters (load/save)
- [x] Content editing
- [x] Quiz mode + spaced repetition (SM2-variant math ported verbatim, `quizes.json` format unchanged)
- [x] Map import/export (JSON, sorted by cdate like before)
- [x] Local/offline persistence (NeDB `cme.db` + JSON files, formats unchanged)
- [x] Multimedia: PDFs, text, links, images, audio, video (browser tabs/native players)
- [x] Minimap (snapshot load/save, delta sync channels)
- [x] Navigator (asset browsing, element tree; crash fix)
- [x] Mnemonics (images/actions/transforms untouched)
- [x] LaTeX/MathJax editor (server-side render, same response shape)
- [x] Code editor with all existing CodeMirror 5 language modes
- [x] JSME chemical editor (same iframe + DOM contract, now typed adapter)
- [x] SVG editor (bridge implemented — previously non-functional)
- [x] Keyboard shortcuts (in-app handlers untouched); Electron menu items replaced by APIs

## Plugin/widget checklist (registry: `src/app/widgets/widget-registry.ts`)

| id | kind | status |
|---|---|---|
| none | none | ✅ |
| equation | component (MathJax via backend) | ✅ e2e |
| formula | iframe (JSME) + typed adapter | ✅ e2e |
| svg | iframe (SVG-Edit) + typed adapter + new bridge | ✅ e2e |
| navigator | component | ✅ e2e |
| minimap | component | ✅ e2e |
| mnemo | component | ✅ e2e |
| codeeditor | component (CodeMirror 5) | ✅ e2e |

Slots `widget0`/`widget1` work unchanged (persisted ids stable). Iframe
plugins lazy-load on selection; MathJax renders server-side (≈2 MB kept out
of the bundle).

## Data migration notes

**None required.** All file formats and locations unchanged. Backups are
written to `data/backups/` before the first write of each run and before a
database wipe. `COGNIMAP_DATA_DIR` relocates the data directory. See
`docs/MIGRATION.md` for behavior changes (media opening, clipboard).

⚠️ Flagged during the audit (left untouched): `data/tmp/id_rsa` — an SSH
private key sits in the data directory; consider removing/rotating it.
`data/` also contains Syncthing conflict copies and LevelDB leftovers the
app never reads.

## Data-protection guarantees

- **Database files are never deleted.** The legacy "Delete DB" wipe is
  disabled (403) unless explicitly re-enabled via `COGNIMAP_ALLOW_DB_WIPE=1`
  — and even then the db file is backed up first and only emptied, never
  removed from disk.
- Exports (`/api/db/save`) refuse to write over live data files
  (`cme.db`, `settings.json`, `colors.json`, `buttons.json`,
  `templates.json`, `spechars.json`, `quizes.json`, `minimap.json`) and
  back up any existing export before overwriting it.
- Config writes snapshot the previous file state to `data/backups/` once
  per server run; writes are atomic (temp file + rename).

## Security notes

- Renderer no longer has Node access (was `nodeIntegration: true`,
  `contextIsolation: false`).
- Removed command-injection-shaped code (`exec('vlc ' + path)`).
- Path traversal blocked centrally (`resolveInside`); `/files/` limited to
  `src/` and `dist/`; e2e includes traversal attempts.
- ajv validation + structured errors on all APIs; server binds to loopback.
- Remaining: imported JSON/SVG is trusted local user data as before; a
  sanitization pass would harden further (documented).

## Performance notes

- Backend cold start ≈ 240 ms to first served request, RSS ≈ 76 MB
  (Electron: 3 BrowserWindows + DevTools forced open).
- Production build fixed (was broken: webpack-2-era extract-text plugin);
  bundles now minified: main 529 KB, vendor 1.29 MB.
- JSME/SVG-editor assets load only when the widget is selected; MathJax is
  server-side.
- 15 dead favicon links removed (eliminated 404 stream on every load).
- Canvas rendering path untouched (no regression risk taken there).

## Test commands and results

| Command | Result |
|---|---|
| `npm run test:backend` | **33/33 pass** (node:test; config, CME CRUD + traversals, quiz SM2, media, traversal attempts, backup behavior; fixtures extracted from real legacy data) |
| `npm run test:e2e` | **16/16 pass** against dev build **and** production build (Playwright, system Chrome) |
| `npm run lint` | pass (eslint over server/ + e2e/) |
| `npm run typecheck` | pass (new TS modules; legacy code has ~481 pre-existing errors masked by transpileOnly — untouched) |
| `npm run build` | pass (production, minified) |

## Browser verification results

Playwright e2e covers: app loads without Electron · canvas renders legacy
NeDB elements · settings/colors/buttons/templates/spechars load+save ·
node create/edit/delete round-trip with UI rendering · link traversal ·
all 8 widgets switch in both slots · minimap snapshot · JSME bridge · SVG
editor bridge export · MathJax SVG · quiz load/answer/reschedule + quiz
toolbar · import/export round-trip · media serving (PDF) · theme toggle
persistence · keyboard focus visibility. Screenshots verified manually
against the real 45k-element dataset (light, dark, edit mode with minimap).

## Verified against the release demo video

Every workflow shown in the YouTube demo (FcAghOkgQpI) was re-verified in
the browser build by driving a real browser: node creation with inline
title typing · automatic linking + link/shape styling · special-character
panel · map panning across large maps · image paste onto a selected node
(browser paste event → upload → content item) · LaTeX editor with symbol
palette, live render and save-to-node · embedded videos/media (open in
browser tab instead of VLC) · quiz mode (due list, check-answer boxes,
rating buttons, interval) · JSME SMILES import/export · selection,
dragging, deletion, undo. UI additions beyond the original: undo button +
Ctrl+Z, toolbar collapse, default area selection in edit mode, tooltips,
dark theme incl. dark canvas.

## Known limitations

- Frontend remains Angular 2.4 + RxJS 5 + ngrx 2 (framework migration out
  of scope for this pass; Electron decoupling was the prerequisite and is
  done). TSLint is retired; legacy TS is not linted/type-checked.
- `sendSync` shim uses synchronous XHR (parity with the old blocking IPC).
- Multi-tab sessions are not synchronized.
- Desktop packaging: recommend a thin Tauri wrapper later if wanted.
- Local editing of images via KolourPaint and VLC launching are not
  available from the browser (files open in tabs instead).

## Follow-up tasks

- Convert hot `sendSync` paths (settings bootstrap, MathJax) to async.
- Sanitize imported/pasted SVG/HTML.
- Framework migration (Angular 2.4 → modern) now unblocked.
- Clean `data/` clutter + remove `data/tmp/id_rsa`.
- MathJax 3 upgrade behind the existing service adapter.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
