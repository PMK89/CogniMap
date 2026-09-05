import * as CodeMirror from 'codemirror';
import 'codemirror/addon/runmode/runmode';
const { codeSvg } = require('./code-serialization');
import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
declare var Snap: any;

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// services
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';
import { WindowService } from '../../shared/window.service';

// models and reducers
import { CMSettings } from '../../models/CMSettings';

@Injectable()
export class CodeeditorService {
  public cmsettings: CMSettings;
  public code: string;

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private windowService: WindowService) {
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      if (data !== undefined) {
                        this.cmsettings = data;
                        // console.log(data);
                      }
                    });
              }

  // finds element by title
  public processCode(text: string, language: string, change: boolean) {
    const rendered = codeSvg(text, (source, emit) => (CodeMirror as any).runMode(source, language, emit));
    const codestring = rendered.svg;
    if (this.elementService.selCMEo) {
      if (change) {
        for (let key in this.elementService.selCMEo.cmobject.content) {
          if (this.elementService.selCMEo.cmobject.content[key]) {
            let content = this.elementService.selCMEo.cmobject.content[key];
            if (content.cat === 'html') {
              content.info = text;
              content.language = language;
              content.width = rendered.width;
              content.height = rendered.height;
              content.object = codestring;
            }
          }
        }
      } else {
        let content = {
          cat: 'html',
          language: language,
          coor: {
            x: 0,
            y: 0
          },
          object: codestring,
          width: rendered.width,
          info: text,
          height: rendered.height,
          correct: true
        };
        this.elementService.selCMEo.cmobject.content.push(content);
      }
      if (this.cmsettings.mode === 'typing') {
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
      }
      if (this.elementService.selCMEo.types[0] !== 'i') {
        if (this.elementService.selCMEo.types[2] !== 'b') {
          this.elementService.selCMEo.types[2] = 'b';
          this.elementService.selCMEo.cmobject.style.object.color1 = JSON.parse(
            JSON.stringify(this.elementService.selCMEo.cmobject.style.object.color0));
          this.elementService.selCMEo.cmobject.style.object.color0 = 'none';
        }
      }
      this.elementService.selCMEo.state = 'selected';
      this.elementService.updateSelCMEo(this.elementService.selCMEo);
    } else {
      alert('Please choose an Element to insert the code');
    }
  }

  // reads code from cognimap
  public readCode(code) {
    this.code = code;
  }
}
