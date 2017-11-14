import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
declare var Snap: any;

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// services
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';

// models and reducers
import { CMSettings } from '../../models/CMSettings';

@Injectable()
export class MjEditorService {
  public cmsettings: CMSettings;
  public selectionStart = 0;
  public selectionEnd = 0;
  public inputtext: string = '';
  public svgStrg: string = '';
  public svgoutput;

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private electronService: ElectronService) {

              }

  // moves element to entered coordinates
  public makeLatex(oField, tex) {
    if (oField.selectionStart || oField.selectionStart == '0') {
       this.selectionStart = oField.selectionStart;
       this.selectionEnd = oField.selectionEnd;
       // console.log(this.selectionStart, this.selectionEnd);
    }
    this.placeSvg(tex);
  }

  // handles button input
  public buttonInput(cell, inputtext) {
    if (inputtext) {
      this.inputtext = inputtext;
    }
    if (cell.string) {
      if (!cell.substring || this.selectionStart === this.selectionEnd) {
        this.inputtext = this.inputtext.substr(0, this.selectionStart) + cell.string + this.inputtext.substr(this.selectionStart);
      } else {
        this.inputtext = this.inputtext.substr(0, this.selectionStart) + cell.string.substr(0, cell.pos)
        + this.inputtext.substr(this.selectionStart, this.selectionEnd) + cell.string.substr(cell.pos) + this.inputtext.substr(this.selectionEnd);
      }
      this.placeSvg(this.inputtext);
      return this.inputtext;
    }
  }

  // save Latex
  public saveLateX(element, key) {
    if (element) {
      if (element.cmobject) {
        if (element.cmobject.content) {
          if (element.cmobject.content[key]) {
            element.cmobject.content[key].info = this.inputtext;
            element.cmobject.content[key].content = this.svgStrg;
            console.log(element.cmobject.content[key]);
            this.elementService.updateSelCMEo(element);
          }
        }
      }
    }
  }

  // place svg with snap
  public placeSvg(tex) {
    if (tex) {
      this.inputtext = tex;
      this.svgoutput = this.electronService.ipcRenderer.sendSync('makeMjSVG', tex);
      if (this.svgoutput.svg) {
        this.svgStrg = JSON.stringify(this.svgoutput.svg);
        console.log(this.svgStrg);
        let s = Snap('#mjeditorsvg');
        s.clear();
        let mjo = Snap.parse(this.svgoutput.svg);
        s.add(mjo);
      }
    }
  }

}
