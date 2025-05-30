// coordinate object
var CMCoor = {
  x: Number,
  y: Number
}

// general style settings
var CMStyle = {
  name: String,
  font: String,
  fontcolor: String,
  fontsize: Number,
  bgcolor: String,
  linecolor: String,
  shadowcolor: String,
  boxclass: String,
  btnbgcolor0: String,
  btnbgcolor1: String,
  btnclickcolor: String,
  btndeactcolor: String,
  btncontentcolor: String,
  btnbordercolor: String,
  btnclass: String
}

// copy object
var CMCopy = {
  type: String,
  strg: String,
  num: Number,
  numArray: [Number],
  strgArray: [Number]
}


// gui for objects
var CMTBObject = {
  color0: String,
  color1: String,
  zPos: [String],
  trans: [String],
  buttons: String
}

// gui for fonts
var CMTBFont = {
  color: String,
  size: [String],
  font: [String],
  buttons: String
}

// gui for lines
var CMTBLine = {
  color0: String,
  color1: String,
  size0: [String],
  size1: [String],
  zPos: [String],
  trans: [String],
  buttons: String
}

// layout object for gui elements
var CMLayout = {
  pos: CMCoor,
  zPos: Number,
  width: Number,
  height: Number,
  trans: Number,
  position: String,
  border: Boolean,
  b_width: Number,
  b_color: String,
  vis: Boolean
}

var CurrentMeta = {
  name: String,
  path: String,
  type: String,
  pos: String,
  comment: String,
}

// Basic settings for layout, style and basic work modes
var CMSettings = {
  id: Number,
  maxid: Number,
  mode: String,
  seltb: String,
  copy: CMCopy,
  copycolor: String,
  latexcolor: String,
  currentMeta: CurrentMeta,
  epath: String,
  coor: CMCoor,
  pointArray: [CMCoor],
  style: CMStyle,
  debug: Boolean,
  dragging: Boolean,
  minimapupdate: Number,
  deletedcme: [Number],
  zoom: Number,
  cmap: CMLayout,
  tblayout0: CMLayout,
  tblayout1: CMLayout,
  wlayout0: CMLayout,
  wlayout1: CMLayout,
  menue: CMLayout,
  cmtbobject: CMTBObject,
  cmtbline: CMTBLine,
  cmtbfont: CMTBFont
}

module.exports = CMSettings;
