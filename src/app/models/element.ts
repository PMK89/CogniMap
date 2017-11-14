export class CMCoor {
  x: number;
  y: number;
}

export class CMObject {
  content: [{
    cat: string;
    coor: CMCoor;
    z_pos: number;
    object: string;
    width: number;
    height: number
  }];
  meta: [{
    name: string;
    cat: string;
    content: string;
    comment: string;
  }];
  style: {
    title: {
      size: number;
      font: string;
      color: string;
      class_array: Array<string>
    };
    object: {
      shape: string;
      color0: string;
      color1: string;
      trans: number;
      weight: number;
      str: string;
      num_array: Array<number>;
      class_array: Array<string>
    }
  };
  links: [{
    id: number;
    title: string;
    peer_coor: CMCoor;
    weight: number;
    con: string;
    link_coor: CMCoor;
    start: boolean
  }];
  cdate: Date;
  vdate: Date;
}

export class CMLine {
  prep: string;
  shape: string;
  end: string;
  color0: string;
  color1: string;
  size0: number;
  size1: number;
  trans: number;
  id0: number;
  title0: string;
  id1: number;
  title1: string;
  property: Array<string>;
  str: string;
  num_array: Array<number>;
  class_array: Array<string>;
  markers: [{
    cat: string;
    coor: CMCoor;
    z_pos: number;
    title: string;
    font: string;
    size: number;
    object: string;
    color: string;
    target_coor: CMCoor;
    width: number;
    height: number
  }];
}

export class CMElement {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  prio: number;
  title: string;
  type: string;
  coor: CMCoor;
  cat: [string];
  z_pos: number;
  cmline: CMLine;
  cmobject: CMObject;
}
