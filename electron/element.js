var CMElement = {
  id: { type: Number, index: true, unique: true },
  x0: { type: Number, index: true },
  y0: { type: Number, index: true },
  x1: { type: Number, index: true },
  y1: { type: Number, index: true },
  prio: { type: Number, index: true },
  title: { type: String, index: true },
  types: [String],
  coor: {
    x: { type: Number, index: false },
    y: { type: Number, index: false }
  },
  cat: [String],
  z_pos: { type: Number, index: false },
  dragging: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  cmline: { type: String, index: false },
  cmobject:{ type: String, index: false },
  prep: { type: String, index: false }
}

module.exports = CMElement;
