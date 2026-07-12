# Visualization State (viz3d schema v1)

Stored in `data/viz3d.json`, served by `GET/PUT/DELETE /api/viz3d`.
Concept-map data is **never** modified by the 3D view; legacy maps load
with defaults and require no migration (see
`docs/migrations/3d-visualization-migration.md`).

```json
{
  "version": 1,
  "preset": "layered-depth",
  "positions": { "<nodeId>": { "x": 0, "y": 0, "z": 0 } },
  "shapes":    { "<nodeId>": "torus" },
  "locked":    { "<nodeId>": true },
  "camera":    { "position": [x,y,z], "target": [x,y,z] },
  "viewpoints": [],
  "scenePreset": "neutral"
}
```

- `positions` — manual node positions (override the preset layout)
- `shapes` — per-node geometry override (`sphere`, `rounded-box`,
  `cube`, `capsule`, `cylinder`, `cone`, `torus`, `prism`,
  `octahedron`, `lowpoly`, `panel`, `image-plane`)
- `camera` — last camera state, restored on load
- writes are atomic (temp file + rename); the previous state is backed
  up once per server run to `data/backups/`
- a corrupted file is moved aside and defaults served
- `DELETE /api/viz3d` resets the visualization (backup first)

Unknown properties are preserved on round-trip by the client (the
component only touches the keys it owns), keeping the schema forward-
extensible; bump `version` for breaking changes.
