import { CMCoor } from './CMCoor';
import { CMLayout } from './CMLayout';
import { CMStyle } from './CMStyle';
import { CMTBObject } from './CMTBObject';
import { CMTBFont } from './CMTBFont';
import { CMTBLine } from './CMTBLine';


export class CMSettings {
  id: number;
  mode: string;
  coor: CMCoor;
  style: CMStyle;
  debug: boolean;
  dragging: boolean;
  tblayout0: CMLayout;
  tblayout1: CMLayout;
  wlayout0: CMLayout;
  wlayout1: CMLayout;
  menue: CMLayout;
  cmtbobject: CMTBObject;
  cmtbfont: CMTBFont;
  cmtbline: CMTBLine;
}
