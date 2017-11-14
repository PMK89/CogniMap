import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
declare var Snap: any;

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// services
import { SettingsService } from '../../shared/settings.service';

// models and reducers
import { CMSettings } from '../../models/CMSettings';

@Injectable()
export class MjEditorService {
  public cmsettings: CMSettings;
  public caretPos = 0;
  public selCMEo: any;
  public inputtext: string = '';
  public svgoutput;

  constructor(private settingsService: SettingsService,
              private electronService: ElectronService) {

              }

  // moves element to entered coordinates
  public makeLatex(oField, tex) {
    if (oField.selectionStart || oField.selectionStart == '0') {
       this.caretPos = oField.selectionStart;
       console.log(this.caretPos);
    }
    this.svgoutput = this.electronService.ipcRenderer.sendSync('makeMjSVG', tex);
    if (this.svgoutput.svg) {
      let s = Snap('#mjeditorsvg');
      s.clear();
      let mjo = Snap.parse(this.svgoutput.svg);
      s.add(mjo);
    }
  }


}
