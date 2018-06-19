import { CMEMarker } from './CMEMarker';

export class CMELine {
  public end: string;
  public color0: string;
  public color1: string;
  public size0: number;
  public size1: number;
  public trans: number;
  public id0: number;
  public title0: string;
  public id1: number;
  public title1: string;
  public property: [string];
  public dasharray: string;
  public str: string;
  public numArray: [number];
  public cmclass: string;
  public markers: [CMEMarker];
}
