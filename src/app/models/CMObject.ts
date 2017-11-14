import { CMContent } from './CMContent';
import { CMMeta } from './CMMeta';
import { CMLink } from './CMLink';

export class CMObject {
  content: [CMContent];
  meta: [CMMeta];
  style: {
    title: {
      size: number;
      font: string;
      color: string;
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
  links: [CMLink];
  cdate: number;
  vdate: number;
}
