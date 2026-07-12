# Plugin Integration in the 3D Workspace

## Principle

The 3D workspace does not replace any editor — it **drives the same
application-wide selection state** the 2D canvas uses. Picking a node in
3D calls `ElementService.setSelectedCME(id)`, exactly like clicking it
on the classic canvas. Every existing plugin therefore operates on
3D-selected nodes without modification:

| Plugin | Behavior in 3D mode | Verified |
|---|---|---|
| LaTeX editor (MathJax) | opens in its widget slot, renders the selected node's equations | browser test: 3D-selected node → editor renders its SVG |
| Code editor (CodeMirror 5, all modes) | widget slot, reads selected node's `html` content | e2e (2D suite) + shared selection path |
| Chemical editor (JSME) | iframe widget, adaptive sizing, CM export | e2e |
| SVG editor (SVG-Edit + CM bridge) | iframe widget | e2e |
| Mnemonics | widget slot, edits selected node | e2e |
| Navigator | widget slot | e2e |
| Minimap | widget slot (2D overview of the same map — an orthographic complement to the 3D view) | e2e |
| Quiz mode | unchanged (toolbar0 + settings mode) | e2e |
| Multimedia (pdf/video/audio/images/links) | `/api/media/open` + `/files/` | e2e |

Heavy editors never render on 3D nodes; nodes show shape/color/label
(content-type is reflected in the automatic shape mapping: images →
image-plane, LaTeX/SVG/JSME → panel, code → prism, quiz → octahedron,
mnemonic → capsule).

## Old → new interaction mapping

| Old (2D) | New (3D) |
|---|---|
| click node on canvas | click node mesh (raycast) |
| scroll canvas | orbit / pan / dolly |
| drag node (Ctrl+D mode) | drag selected node on the camera plane |
| minimap for overview | `Frame all` + minimap widget still available |
| widget slots for editors | unchanged (same slots, same switcher) |
| 2D positions | preserved; `legacy-planar` / `layered-depth` presets anchor to them |

The classic 2D canvas remains fully functional behind the 3D overlay and
is one click away (2D/3D toggle) — it is the planar fallback required
for WebGL-less environments.
