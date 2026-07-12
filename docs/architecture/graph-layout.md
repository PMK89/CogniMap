# Graph Layout Architecture

## Graph model

CogniMap maps are general graphs: multiple parents, cross-links, cycles,
disconnected components, weighted and directed links all occur in real
data. `graph3d-core.buildGraph` reads the legacy node link metadata
(`cmobject.links`: `targetId`, `weight`, `start`) and produces a
deduplicated edge list (both endpoints of one link share the link id).

## Hierarchy derivation (deterministic)

Per connected component (union-find):
1. Root = node with the highest strong out-degree (`weight !== 0`,
   `start` at the node), ties broken by smallest id.
2. Rank-layered BFS builds a spanning tree: strong forward
   (parent→child) edges are exhausted first, then strong backward edges,
   then weak edges — hierarchy follows authoring direction wherever
   possible.
3. Tree edges are **structural branches**; every non-tree edge (incl.
   cycle-closing edges) and every weak (`weight === 0`) edge is a
   **cross-link**. No link is ever dropped.

Cycles therefore work naturally: the cycle-closing edge simply renders
as a cross-link.

## Layout presets (all deterministic)

| Preset | Description |
|---|---|
| `cognitive-tree` | **default** — horizontal organic tree: component roots at their real 2D centers, each subtree in an angular window whose direction is blended with the child's actual 2D bearing (semantic arrangement preserved), positions chaining outward from parents so branches split at several spatial levels, gentle deterministic height variation per major branch |
| `legacy-planar` | legacy 2D coordinates on the XZ plane (spatial memory preserved) |
| `layered-depth` | legacy XZ + hierarchy depth as height |
| `radial-tree` | subtree-size-weighted angular rings per depth |
| `spherical` | depth shells with golden-angle elevation |
| `organic` | radial + deterministic hash-based branch offsets |
| `force-3d` | bounded force relaxation from a spherical seed (no RNG) |
| `compact-clusters` | components packed on a grid, small spherical trees |

Determinism: identical data → identical positions (no `Math.random`
anywhere; jitter comes from integer hashes of node ids). Manual
positions are persisted overrides that always win; adding a node does
not move existing anchored nodes (`layered`/`planar` presets anchor to
persisted 2D coordinates — covered by a unit test).

## Collision relaxation

Spatial-hash grid (cell = min distance), bounded passes, deterministic
pair order. O(V·k): the naive O(V²) version took 213 s on the real
41k-node map; the grid version takes ~1.3 s.

## Relayout controls

The 3D toolbar offers preset switching and `Relayout` (drops manual 3D
positions for the current view). Per-node locking is stored in
`viz3d.locked` (schema v1).
