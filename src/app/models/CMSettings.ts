import { CMCoor } from './CMCoor';
import { CMLayout } from './CMLayout';
import { CMStyle } from './CMStyle';
import { CMTBObject } from './CMTBObject';
import { CMTBMarking } from './CMTBMarking';
import { CMTBFont } from './CMTBFont';
import { CMTBLine } from './CMTBLine';

export class CMSettings {
  public id: number;
  public mode: string;
  public coor: CMCoor;
  public style: CMStyle;
  public debug: boolean;
  public cngtemp: boolean;
  public dragging: boolean;
  public cmap: CMLayout;
  public tblayout0: CMLayout;
  public tblayout1: CMLayout;
  public wlayout0: CMLayout;
  public widget0: string;
  public wlayout1: CMLayout;
  public widget1: string;
  public menue: CMLayout;
  public cmtbobject: CMTBObject;
  public cmtbmarking: CMTBMarking;
  public cmtbfont: CMTBFont;
  public cmtbline: CMTBLine;
}
