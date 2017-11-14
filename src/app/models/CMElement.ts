import { CMCoor } from './CMCoor';
import { CMObject } from './CMObject';
import { CMLine } from './CMLine';

export class CMElement {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  prio: number;
  title: string;
  types: [string];
  coor: CMCoor;
  cat: [string];
  z_pos: number;
  dragging: boolean;
  active: boolean;
  cmline: CMLine;
  cmobject: CMObject;
  prep: string;
}
