var CMEdb = {
  id: { type: Number, index: true, unique: true },
  x0: { type: Number, index: true },
  y0: { type: Number, index: true },
  x1: { type: Number, index: true },
  y1: { type: Number, index: true },
  cdate: { type: Number, index: true },
  vdate: { type: Number, index: true },
  prio: { type: Number, index: true },
  title: { type: String, index: true },
  types: [String],
  coor: {
    x: { type: Number, index: false },
    y: { type: Number, index: false }
  },
  cat: [String],
  state: { type: String, default: false },
  cmobject:{ type: String, index: false },
  prep: { type: String, index: false },
  prep1: { type: String, index: false }
}

module.exports = CMEdb;
