# 3D Navigation

Toggle the 3D workspace with the **3D** button (bottom-right). The
classic 2D map stays one click away (**2D**) and remains the fallback
when WebGL is unavailable.

The 3D view always loads the **whole map** (via a light server-side
projection without the pre-rendered SVG), independent of where the 2D
canvas is scrolled. Quiz covers, markings and signs are 2D overlay
artifacts and never appear as 3D nodes. On first open (or when a saved
camera no longer matches the content) the view lands on the largest
component's root and its first branch levels — `Frame all` shows the
entire map.

## Mouse / trackpad

| Action | Control |
|---|---|
| Orbit | left-drag on empty space |
| Pan | right-drag (or two-finger drag) |
| Zoom / dolly | wheel / pinch |
| Select node | click a node |
| Focus node | double-click a node (also selects) |
| Move node | drag a selected node (moves on the camera-facing plane) |
| Move subtree | dragging a parent moves all its children with it (relative positions kept) |

Nodes render as flat sheets in the proportions of their 2D objects.
Near the camera each sheet shows the node's REAL 2D rendering — text,
LaTeX formulas, chemical structures, images and diagrams — readable
from both sides; far sheets stay plain colored cards. Root/hub nodes
keep floating labels.

Camera limits prevent extreme zoom (min 2 / max 8000 units) and the
`Frame all` button always recovers the whole map if you get lost.

## Toolbar

- **Layout** — deterministic presets. `cognitive-tree` (default) builds a
  horizontal organic tree that mirrors your real map: the central concept
  sits at the map's center, major branches extend outward in the same
  directions they have in 2D, and children fan out around their parents.
  `legacy-planar` is the flat arrangement in the 3D renderer;
  `layered-depth` lifts children by hierarchy depth.
- **Relayout** — recompute the preset (drops manual 3D positions)
- **Frame all** — frame the complete map
- **Focus** — fly to the selected node
- **Shape** — geometry of the selected node (12 shapes; `auto` derives
  from content type)

## Persistence

Manual positions, shape overrides, the active preset and the camera are
saved automatically (debounced) and restored on the next visit.

## Selection and editing

Selecting a node in 3D selects it app-wide: open any widget (LaTeX,
code, JSME, SVG editor, mnemonics, navigator, minimap) and it operates
on that node exactly as in the 2D view. Editing workflows, quiz mode,
import/export and keyboard shortcuts are unchanged.
