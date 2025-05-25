import { CMSettings } from './models/CMSettings';

// TODO: Define specific types for each state slice by inspecting their reducers.
export interface AppState {
  settings: CMSettings;
  buttons: any; 
  colors: any; 
  cmes: any; 
  selectedcmeo: any; 
  selectedcmel: any; 
  cmeotemplate: any; 
  cmeltemplate: any;
}
