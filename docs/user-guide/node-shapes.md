# Node Shapes

Every node in the 3D workspace is a real 3D object. The shape is chosen
automatically from the node's content and can be overridden per node
(toolbar → Shape, persisted in the visualization state).

## Automatic mapping (`auto`)

| Content | Shape |
|---|---|
| image content | image plane |
| LaTeX / SVG / chemical structure | flat panel |
| source code | triangular prism |
| quiz node | octahedron |
| mnemonic/marker node | capsule |
| component root | sphere |
| everything else | rounded box |

## Available shapes

`sphere`, `rounded-box`, `cube`, `capsule`, `cylinder`, `cone`,
`torus`, `prism`, `octahedron`, `lowpoly` (icosahedron), `panel`,
`image-plane`.

## Materials

Node color comes from the node's own configured style colors (the same
colors the 2D map uses); nodes without an explicit color get a neutral
depth-tinted default. Materials use conservative roughness/metalness so
shapes stay readable in every theme. Selection shows a restrained blue
emissive highlight; hover a subtle grey one.
