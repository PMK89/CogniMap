import { CMElement } from './CMElement';
import { CMSettings } from './CMSettings';
import { CMColorbar } from './CMColorbar';
import { CMButton } from './CMButton';

export interface CMStore {
  elements: CMElement[];
  selectedElement: CMElement;
  settings: CMSettings;
  colors: CMColorbar[];
  buttons: CMButton[];
};
