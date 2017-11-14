import { CMCoor } from './CMCoor';

export class CME {
  public id: number;
  public x0: number;
  public y0: number;
  public x1: number;
  public y1: number;
  public cdate: number;
  public vdate: number;
  public prio: number;
  public title: string;
  public types: [string];
  public coor: CMCoor;
  public cat: [string];
  public state: string;
  public cmobject: string;
  public prep: string;
  public prep1: string;
}
