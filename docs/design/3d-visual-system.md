# 3D Visual System

## Design intent

A restrained scientific visualization workspace: dark or light theme
(reusing the app-wide design tokens in `assets/styles/cognimap.css`),
soft hemisphere lighting with one key light, matte materials
(roughness 0.82, metalness 0.06), fog for depth cueing, no glow, no
particles, no idle animation. Selection is a quiet blue emissive lift;
hover a grey one.

## Tokens

The scene derives its colors from the existing CSS custom properties
(`--cm-bg`, theme attribute) so 2D chrome and 3D scene always agree;
node colors are data-driven from each node's stored style (same source
as the 2D canvas), with a neutral depth-tinted default.

## Structural language

- **Structural branches**: soft grey-blue tube curves with a gentle
  upward bow — readable "branch" language without organic noise.
- **Cross-links**: thin, 28%-opacity straight lines — present but never
  competing with structure.
- **Labels**: billboard sprites with theme-aware translucent backing,
  distance-attenuated size, nearest-N budget.

## Motion

Only functional motion: camera damping and focus transitions. The
render loop is on-demand; nothing animates at rest. (A global
reduced-motion/no-animation preference already governs the 2D chrome
via `prefers-reduced-motion` in the design system CSS.)
