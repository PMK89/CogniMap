# CogniMap Architecture

## Overview

CogniMap is a browser-first, offline-capable concept-mapping application.
It consists of:

- **Frontend** (`src/`): an Angular application (legacy Angular 2.4 codebase,
  built with webpack 5) rendering the concept-map canvas with Snap.svg,
  toolbars, and dockable widgets.
- **Backend** (`server/`): a small Express server that serves the built
  frontend and exposes typed JSON APIs for persistence, media, rendering and
  import/export. It replaces the previous Electron main process entirely.
- **Data** (`data/`): local, file-based storage — a NeDB database
  (`cme.db`) for concept-map elements plus flat JSON files for settings,
  colors, buttons, templates, special characters, quiz scheduling and the
  minimap snapshot.

```
Browser (Chrome/Firefox/…)
  └─ Angular app  ── HTTP ──► Express backend (127.0.0.1:3210)
       │                        ├─ /api/settings|colors|buttons|templates|spechars
       │                        ├─ /api/cme/*      (NeDB: data/cme.db)
       │                        ├─ /api/quiz/*     (data/quizes.json, SM2 variant)
       │                        ├─ /api/media/*    (MathJax SVG, PNG transparency, open)
       │                        ├─ /api/assets/*   (asset browsing)
       │                        ├─ /api/db/*       (import/export/wipe)
       │                        └─ /files/*        (media file serving, src/ + dist/ only)
       └─ iframe plugins (JSME chemical editor, SVG editor) served as static assets
```

## How Electron was replaced

The old runtime was an Electron shell (`main.js`) with `nodeIntegration: true`
and `contextIsolation: false`, running database/media logic in the main
process and communicating over `ipcRenderer.send/sendSync`. That code is
preserved for reference under `legacy/electron/`.

The replacement has two layers:

1. **Backend APIs** (`server/routes/*.js`) are faithful ports of the old
   IPC handlers (`dbprocess.js`, `mediaprocess.js`, `settingsController.js`)
   with input validation (ajv), structured errors, traversal-safe path
   resolution and automatic backups before writes.
2. **`BackendService`** (`src/app/shared/backend.service.ts`) exposes an
   `ipcRenderer`-compatible facade (`send`/`sendSync`/`on`) that maps every
   legacy channel to an HTTP call. Async replies (`loadedCME`,
   `changedCME`, `selectedChildren`, …) are emitted to local listeners,
   mirroring the old main-process broadcasts. This let all ~40 call sites
   keep their semantics with a minimal diff.

### Known technical debt

- `sendSync` channels are implemented with synchronous XHR on localhost.
  The old Electron `sendSync` was equally blocking, so this is not a
  regression, but converting hot paths (settings load, MathJax render) to
  async calls is the natural next step.
- The frontend is still Angular 2.4 + RxJS 5 + @ngrx/store 2. A framework
  migration was intentionally out of scope for this pass; the UI was
  modernized at the design-system level (see below) and all Electron
  coupling was removed, which is the prerequisite for any future migration.
- Multi-tab use is not synchronized: each tab keeps its own event bus.
  The backend is single-user/localhost by design.

## Widget/plugin architecture

Widgets dock into two slots (`widget0`, `widget1`, persisted in settings).
`src/app/widgets/widget-registry.ts` is the single source of truth: each
widget declares `id`, `label`, `icon`, `kind` (`component` | `iframe` |
`none`), required assets, state inputs, output events and persistence.

- Component widgets: LaTeX editor (MathJax via backend), code editor
  (CodeMirror 5), mnemonics, navigator, minimap.
- Iframe plugins: JSME chemical editor and the SVG editor. Both expose the
  same same-origin DOM contract, accessed through the typed
  `WidgetIframeAdapter`:
  - `#svg_textarea` — output JSON `{ type: 'jsme-svg' | 'svg', object, info }`
  - `#cminput` — input content (dispatches a `cminput-changed` event)
  - `#structure` — JSME-only SMILES input
  Output reaches the map through the copy/paste flow: the plugin's JSON is
  pasted onto a selected element (`EventService` recognizes the types
  `png`, `LateX`, `svg`, `jsme-svg`).
- Iframe plugins load lazily — their assets are only fetched when the
  widget is selected. MathJax rendering happens in the backend process,
  keeping ~2 MB of MathJax out of the browser bundle.

## UI design system

`src/assets/styles/cognimap.css` defines CSS custom properties for
surfaces, text, borders, accent and shadows, with a dark theme driven by
`prefers-color-scheme` and a manual override (`html[data-theme]`,
persisted in localStorage, applied before first paint). It styles the
application chrome only — map elements keep their user-configurable,
data-driven styling from `data/colors.json` / settings.

## Data persistence

| Store | File | API |
|---|---|---|
| Concept-map elements | `data/cme.db` (NeDB) | `/api/cme/*` |
| Settings | `data/settings.json` | `/api/settings` |
| Colors | `data/colors.json` | `/api/colors` |
| Buttons | `data/buttons.json` | `/api/buttons` |
| Templates | `data/templates.json` | `/api/templates` |
| Special characters | `data/spechars.json` | `/api/spechars` |
| Quiz scheduling | `data/quizes.json` | `/api/quiz/*` |
| Minimap snapshot | `data/minimap.json` | `/api/minimap` |

All formats are unchanged from the Electron version — no migration is
required. Before the first write of each server run, the affected file is
copied to `data/backups/<name>.<timestamp>.bak`. The element database is
backed up before a wipe (`/api/db/delete`).

The data directory can be relocated with `COGNIMAP_DATA_DIR`.

## Security model

- The server binds to `127.0.0.1` by default; it is a single-user local
  application, not a network service.
- All filesystem access from routes goes through `resolveInside()`
  (`server/lib/paths.js`), which rejects paths escaping their root.
- `/files/` exposes only the `src/` and `dist/` subtrees (media assets).
- API payloads are validated with ajv; errors are structured
  (`{ error: { code, message, details } }`).
- The old Electron risks are gone: no Node integration in the renderer, no
  `shell.openExternal`/`exec("vlc " + path)` command construction —
  media opens as a browser tab/native player instead.
- Remaining: imported map JSON and SVG content are treated as trusted
  local user data, as before; a sanitization pass on pasted/imported
  SVG/HTML would harden this further.
