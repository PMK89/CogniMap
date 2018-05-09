import { CMEContent } from './CMEContent';
import { CMEMeta } from './CMEMeta';
import { CMELink } from './CMELink';

export class CMEObject {
  public content: [CMEContent];
  public meta: [CMEMeta];
  public style: {
    title: {
      size: number;
      font: string;
      color: string;
      deco: string;
      class_array: [string]
    };
    object: {
      color0: string;
      color1: string;
      trans: number;
      weight: number;
      str: string;
      num_array: [number];
      class_array: [string]
    }
  };
  public links: [CMELink];
}
