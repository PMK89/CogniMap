# Migration Notes: Electron → Browser + Local Backend

## For users

Nothing to migrate. All data files keep their exact formats and locations:

- `data/cme.db`, `data/settings.json`, `data/colors.json`,
  `data/buttons.json`, `data/templates.json`, `data/spechars.json`,
  `data/quizes.json`, `data/minimap.json` are read and written unchanged.
- Start the app with `npm start` and open http://127.0.0.1:3210 instead of
  launching Electron.
- Before the first write in each session, the server snapshots the
  affected file to `data/backups/` — old states can be restored by copying
  a backup over the live file.

## Behavior changes

| Area | Electron behavior | Browser behavior |
|---|---|---|
| Opening PDFs/text | `shell.openExternal` (OS default app) | opens in a new browser tab (`/files/...`; PDF page anchors work in the built-in viewer) |
| Audio/video | spawned VLC | opens in a new tab with the browser's native player |
| Editing pictures | copied file + spawned KolourPaint | not available from the app; edit files under `src/assets/images/` with any editor |
| Clipboard paste | Electron clipboard API polled on Ctrl+V | browser paste events (Ctrl+V works as before; pasted images upload to the backend and land in `assets/images/cm/`) |
| Widget pop-out windows | new `BrowserWindow` | browser popup window |
| App menu (Load/Save/Delete DB with native dialogs) | native menu + dialogs | import/export APIs (`/api/db/save`, `/api/db/load`) — file names resolve inside the project directory |
| Delete DB | wiped all elements | **disabled — database files are never deleted.** Exports also refuse to overwrite live data files and back up existing exports first. The legacy wipe can only be re-enabled with `COGNIMAP_ALLOW_DB_WIPE=1` (backup still taken, file only emptied, never removed) |
| `getAllCME` / `getPicture` IPC channels | dead (no handler; always returned `undefined`) | unchanged (shim returns `undefined`) |

## Removed components

- `electron`, `ngx-electron`, `@electron/remote`, `electron-packager`,
  `@electron/rebuild` dependencies.
- Hidden 1×1 background `BrowserWindow`s (they hosted nothing; the DB and
  media logic ran in the main process).
- `dbprocess_mongo.js`, `dbprocess_linvodb.js`, `settingsController.ts` —
  dead alternative backends, moved to `legacy/electron/`.

## Desktop packaging (future option)

If a desktop shell is wanted again, the recommended path is a thin wrapper
(e.g. Tauri) around `server/` + `dist/` — the backend already has clean
boundaries. Electron remains possible (`legacy/electron/`) but is no
longer maintained here.

## Data-directory hygiene (pre-existing, flagged during migration)

- `data/` contains Syncthing conflict copies and one-off exports that the
  app never reads (`*.sync-conflict-*`, `quizes0.json`, `cognimap25.json`,
  `test.json`, `cmesdb.zip`, LevelDB leftovers under `data/versions/`,
  `data/color/`, `data/button/`, `data/settings/`, `data/templates/`).
  They were left untouched.
- **`data/tmp/id_rsa` + `id_rsa.pub`: an SSH keypair sits in the data
  directory.** It was left untouched, but consider removing it and, if it
  was ever committed, rotating the key.
