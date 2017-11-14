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
  public processCode(code, text, change) {
    // this.codeedit.instance.runMode(this.code, 'text/x-go', this.cmOutput());
    let codestring = '<svg><foreignObject id="fo" width="' + code.sizer.clientWidth
    + 'px" height="' + code.sizer.clientHeight +
     'px"><body>' +
     '<div style="overflow: hidden; width:' + code.sizer.clientWidth
     + 'px; height:' + code.sizer.clientHeight + 'px; z-index: -1;" class="CodeMirror cm-s-default">'
      + code.scroller.innerHTML + '</div></body></foreignObject></svg>';
    // console.log(this.codeedit.instance);
    /*
    let codearray = code.renderedView;
    let codestring = '';
    for (let i in codearray) {
      if (codearray[i]) {
        codestring += codearray[i].node.innerHTML;
      }
    }
    codestring = codestring.replace('position: absolute', 'position: relative');
    codestring = codestring.replace('z-index: 1;', '');
    */
    // console.log(codestring);
    if (this.elementService.selCMEo) {
      if (change) {
        for (let key in this.elementService.selCMEo.cmobject.content) {
          if (this.elementService.selCMEo.cmobject.content[key]) {
            let content = this.elementService.selCMEo.cmobject.content[key];
            if (content.cat === 'html') {
              content.info = text;
              content.width = code.sizer.clientWidth;
              content.height = code.sizer.clientHeight;
              content.object = codestring;
            }
          }
        }
      } else {
        let content = {
          cat: 'html',
          coor: {
            x: 0,
            y: 0
          },
          object: codestring,
          width: code.sizer.clientWidth,
          info: text,
          height: code.sizer.clientHeight
        };
        this.elementService.selCMEo.cmobject.content.push(content);
      }
      if (this.cmsettings.mode === 'typing') {
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
      }
      this.elementService.selCMEo.types = ['i', 'i', '0'];
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
