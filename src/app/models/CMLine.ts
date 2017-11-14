import { CMMarker } from './CMMarker';

export class CMLine {
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
  dasharray: string;
  str: string;
  num_array: Array<number>;
  cmclass: string;
  markers: [CMMarker];
}
