# 3D Navigation

Toggle the 3D workspace with the **3D** button (bottom-right). The
classic 2D map stays one click away (**2D**) and remains the fallback
when WebGL is unavailable.

## Mouse / trackpad

| Action | Control |
|---|---|
| Orbit | left-drag on empty space |
| Pan | right-drag (or two-finger drag) |
| Zoom / dolly | wheel / pinch |
| Select node | click a node |
| Focus node | double-click a node (also selects) |
| Move node | drag a selected node (moves on the camera-facing plane) |

Camera limits prevent extreme zoom (min 2 / max 8000 units) and the
`Frame all` button always recovers the whole map if you get lost.

## Toolbar

- **Layout** — deterministic presets (`layered-depth` default keeps your
  2D arrangement and lifts children by hierarchy depth; `legacy-planar`
  is the flat arrangement in the 3D renderer)
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
