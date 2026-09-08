# Reproducible development setup and dependency status

Verified 2026-09-08 on branch A (`feature/cognimap-modernization-2026`) and independently on branch B (`feature/3d-root-network-layout-2026`).

## Tested toolchain

| Component | Verified version | Notes |
| --- | --- | --- |
| Node | 22.13.1 | `package.json` declares `>= 18`; only 22.13.1 has been exercised end to end |
| npm | 11.1.0 | |
| Chrome | Playwright `channel: 'chrome'` | the browser suite uses the installed Chrome, so `npx playwright install` is not required |

The declared engine minimum is not evidence that every version in that range works. State the version you tested with.

## Installation

```bash
npm ci
npm test          # lint, typecheck, backend unit tests
npm run build     # production webpack build into dist/
npm run test:e2e  # Playwright browser suite (port 3311)
```

`npm ci` succeeds from the committed lockfile with no flags. It depends on the tracked `.npmrc`:

```
legacy-peer-deps=true
```

That line is required, not cosmetic. `@angular/compiler-cli@2.4.6` declares `peer typescript@^2.0.2`, while the build needs the TypeScript 3.9.10 that `awesome-typescript-loader`, `tslint` and `tsutils` resolve to. Without `.npmrc`, npm 7 and newer abort with `ERESOLVE`. Do not "fix" this by downgrading TypeScript — the build does not compile on 2.x. Copying only `package.json` and `package-lock.json` into a scratch directory reproduces the failure; copy `.npmrc` too.

Both worktrees carry byte-identical `package.json` and `package-lock.json`, so one installation procedure serves both. Give each worktree its own `node_modules` anyway: the browser suites both bind port 3311 and must run sequentially, and a shared tree makes it easy to run them concurrently by accident.

A clean installation produces 1458 packages. Three deprecation warnings (`protractor`, `eslint@8`, `core-js@2`) are expected and unrelated to installation success.

### Verified results on fresh installations

| Check | Branch A | Branch B |
| --- | --- | --- |
| `npm ci` | Pass, 1458 packages | Pass, 1458 packages |
| `npm test` | 98 passing, two pre-existing lint warnings | 61 passing |
| `npm run build` | Pass, three pre-existing bundle-size warnings | Pass, same three warnings |
| `npm run test:e2e` | 41 passing, 3.1 min | 39 passing, 3.2 min |

The two lint warnings are unused variables (`scene`, `graph`); the three build warnings are entrypoint and bundle-size recommendations. Neither set is new.

## Dependency status

Registry audit refreshed against the current lockfile. These are advisory records, not a reachability analysis: a record only means an installed package version matches a published advisory.

| Scope | Before this pass | After |
| --- | --- | --- |
| All dependencies | 104 records (historical), 103 at re-measurement | 85 (11 low, 28 moderate, 31 high, 15 critical) |
| Production install | 45 records (historical), 44 at re-measurement | 19 (0 low, 9 moderate, 8 high, 2 critical) |
| Production critical / high | 5 / 23 | 2 / 8 |

The only earlier patch was `path-to-regexp` 0.1.12 → 0.1.13, present in the lockfile on both branches. The all-dependency total falls less than the production total because the removed packages were mostly production-scoped; the development toolchain (webpack, eslint, protractor and their trees) is untouched by this pass.

Raw reports: `/home/pmk/cognimap-verification-2026/audit-a.json` and `audit-a-prod.json` before, `audit-a-after.json` and `audit-a-prod-after.json` after.

### Removed: unused production dependencies

`npm`, `@angularclass/conventions-loader` and `get-pixels` were declared runtime dependencies with no importer anywhere in `src/`, `server/`, `config/` or `e2e/`. `get-pixels` survives only in a commented-out line of the retired Electron media process (`legacy/electron/mediaprocess.js`). The `npm` CLI alone contributed thirteen high and critical records through `@npmcli/*`, `pacote`, `sigstore`, `tar`, `glob` and `minimatch`; `@angularclass/conventions-loader` contributed the critical `loader-utils` and `json5` records.

Removing all three eliminated 229 lockfile entries and added none, with no source change and every suite passing on both branches. A loader was only removed after tracing that no webpack configuration references it.

### Kept, with real exposure

`mathjax-node` is genuinely used — `server/routes/media.js` renders LaTeX with it — and it pulls the critical `request` and `form-data` records. This is the one production advisory chain with a traced runtime path, and it needs the staged proposal in the handoff's P0-A step 4 rather than an opportunistic bump: `mathjax-node@2` is the last release, so the fix is a rendering-backend change tied to the scientific-content test matrix, not a version bump.

### Remaining, requiring major upgrades

`@angular/common`, `@angular/compiler`, `@angular/core`, `@angular/platform-server`, `express` and `mathjax` have fixes only behind semver-major releases. These belong to the staged migration discussion in the handoff's §7 P2, not to this pass. The server binds `127.0.0.1` and is a local single-user application, which bounds — but does not remove — the exposure of the Express-side records.

### Deliberately not applied

`npm audit fix` without `--force` plans 310 changes, including `webpack` 5.99.9 → 5.110.3 and a transitive `selfsigned` 2.4.1 → 5.5.0 major. That is a wholesale build-toolchain upgrade, not a prioritized compatible fix: it would need its own verification pass and would obscure which change addressed which advisory. It was evaluated and rejected for this pass. `npm audit fix --force` was never run.

## Known repository artifacts

`package_new.json` is a second manifest last touched in `14203bc`, before the modernization work, and is referenced by no script. It still lists the dead dependencies removed here. It was left untouched; deciding whether to delete it is separate cleanup.
