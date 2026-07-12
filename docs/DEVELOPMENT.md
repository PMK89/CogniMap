# Local Development

## Requirements

- Node.js ≥ 18 (developed against Node 22)
- Chrome/Chromium (for Playwright end-to-end tests)

## Quick start

```bash
npm install
npm run build        # build the frontend into dist/
npm start            # start the local backend + app at http://127.0.0.1:3210
```

Open http://127.0.0.1:3210 in a browser. Electron is not involved.

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | Serve the built app + APIs (production-style) |
| `npm run dev` | Backend + webpack dev server with live rebuild (app at :3000, APIs proxied to :3210) |
| `npm run build` | Development frontend build into `dist/` |
| `npm run build:prod` | Minified production build into `dist/` |
| `npm run preview` | Production build, then serve it |
| `npm test` | Backend tests + lint |
| `npm run test:backend` | Backend unit/integration tests (`node --test`) |
| `npm run test:e2e` | Playwright browser tests (needs `npm run build` first) |
| `npm run lint` | TSLint over `src/**/*.ts` |
| `npm run typecheck` | TypeScript no-emit check |

## Ports and environment

- `PORT` (default `3210`) — backend port
- `HOST` (default `127.0.0.1`) — bind address; keep loopback unless you
  know what you are doing (APIs are unauthenticated by design)
- `COGNIMAP_DATA_DIR` — override the data directory (default `./data`)

## Testing

- Backend: `server/test/*.test.js`, plain `node --test`, run against a
  temp copy of fixtures in `server/test/fixtures/data` (never the real
  `data/`). Includes compatibility tests that load representative legacy
  documents from the historical NeDB format.
- Browser: `e2e/*.spec.js` with Playwright against a production-like
  server on its own port with its own temp data copy. Uses the system
  Chrome (`channel: 'chrome'`).

## Repository layout

```
server/          Express backend (routes/, lib/, test/)
src/app/         Angular application
src/app/widgets/ widget components + widget-registry.ts + iframe adapter
src/assets/      static assets, iframe plugins (JSME, svgeditor), styles
config/          webpack build configs
data/            user data (never committed; backups in data/backups/)
docs/            architecture / development / migration docs
legacy/electron/ retired Electron runtime, kept for reference
e2e/             Playwright tests
```
