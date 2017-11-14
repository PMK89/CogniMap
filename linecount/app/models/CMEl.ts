import { CMCoor } from './CMCoor';
import { CMELine } from './CMELine';

export class CMEl {
  public id: number;
  public x0: number;
  public y0: number;
  public x1: number;
  public y1: number;
  public prio: number;
  public title: string;
  public types: [string];
  public coor: CMCoor;
  public cat: [string];
  public state: string;
  public cmobject: CMELine;
  public prep: string;
  public prep1: string;
}
