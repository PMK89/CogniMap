# 3D Visualization Migration

## Short version: there is no destructive migration

The 3D view reads the existing concept-map documents as-is and stores
every bit of its own state in a separate versioned file
(`data/viz3d.json`). Consequences:

- legacy maps load in 3D immediately, with a deterministic layout
  derived from their existing 2D coordinates (`layered-depth` default)
- semantic content, IDs, relationships and media references are
  untouched by design — the 3D code path has no write access to
  `cme.db` beyond the pre-existing app behaviors
- removing `data/viz3d.json` (or `DELETE /api/viz3d`) resets the 3D
  view; a timestamped backup is always taken first
- migrations are idempotent because there is nothing to migrate: the
  same input data always derives the same hierarchy and layout

## Dry run

```bash
npm run migrate:dry-run          # or: node scripts/migrate3d-dry-run.js spherical
```

Reports node/edge counts, structural vs cross-link split, component
count, hierarchy depth and layout timing for the current database —
without writing anything.

## Backups

- `data/backups/viz3d.json.<timestamp>.bak` before the first write of a
  server run and before reset
- corrupted state files are moved aside as `viz3d.json.corrupt-<ts>`
- all other data files keep the backup behavior introduced by the
  modernization branch
