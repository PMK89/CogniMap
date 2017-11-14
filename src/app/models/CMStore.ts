import { CME } from './CME';
import { CMEo } from './CMEo';
import { CMEl } from './CMEl';
import { CMSettings } from './CMSettings';
import { CMColorbar } from './CMColorbar';
import { CMButton } from './CMButton';

export interface CMStore {
  settings: CMSettings;
  colors: CMColorbar[];
  buttons: CMButton[];
  cmes: CME[];
  selectedcmeo: CMEo;
  selectedcmel: CMEl;
  cmeotemplate: CMEo;
  cmeltemplate: CMEl;
};
