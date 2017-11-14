import { CMCoor } from './CMCoor';
import { nCMObject } from './newCMObject';
import { CMLine } from './CMLine';

export class nCMElement {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  prio: number;
  title: string;
  type: [string];
  coor: CMCoor;
  cat: [string];
  z_pos: number;
  dragging: boolean;
  active: boolean;
  cmline: CMLine;
  cmobject: nCMObject;
  prep: string;
}
