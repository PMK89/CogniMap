'use strict';

/** Deterministic branching growth over the existing spanning forest.
 * No semantic inference and no forces from cross-links. Each branch has an
 * ID-stable direction, blended with its parent tangent. Subtree size controls
 * clearance; children progressively diverge instead of sitting on depth planes.
 * Iterative traversal keeps long historical chains safe.
 */
function rootLayout(graph, hierarchy, sizes, radii, hash) {
  const positions = new Map(), tangents = new Map();
  const unit = (x, y, z) => { const n = Math.hypot(x, y, z) || 1; return { x: x / n, y: y / n, z: z / n }; };
  const direction = id => {
    const y = hash(id, 31) * 1.8 - 0.9, a = hash(id, 97) * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r };
  };
  const roots = hierarchy.roots.slice().sort((a, b) => (sizes.get(b) || 1) - (sizes.get(a) || 1) || a - b);
  const mainRadius = Math.cbrt(sizes.get(roots[0]) || 1) * 130;
  roots.forEach((root, index) => {
    const axis = direction(root);
    const offset = index === 0 ? 0 : mainRadius + Math.sqrt(index) * 140;
    positions.set(root, { x: axis.x * offset, y: axis.y * offset, z: axis.z * offset });
    tangents.set(root, axis);
    const queue = [root];
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const parent = queue[cursor], origin = positions.get(parent), tangent = tangents.get(parent);
      const children = hierarchy.childrenOf.get(parent) || [];
      for (const id of children) {
        const spread = direction(id);
        let next;
        if (parent === root) next = spread;
        else {
          // Remove the backward component, giving each child a cone around
          // its parent tangent rather than a fresh random spatial heading.
          const dot = spread.x * tangent.x + spread.y * tangent.y + spread.z * tangent.z;
          next = unit(tangent.x + .65 * (spread.x - dot * tangent.x), tangent.y + .65 * (spread.y - dot * tangent.y), tangent.z + .65 * (spread.z - dot * tangent.z));
        }
        const clearance = (radii.get(id) || 6) + (radii.get(parent) || 6) + 18;
        const length = Math.max(clearance, 38 + 20 * Math.cbrt(sizes.get(id) || 1) + 5 * Math.sqrt(children.length));
        positions.set(id, { x: origin.x + next.x * length, y: origin.y + next.y * length, z: origin.z + next.z * length });
        tangents.set(id, next);
        queue.push(id);
      }
    }
  });
  return positions;
}
module.exports = { rootLayout };
