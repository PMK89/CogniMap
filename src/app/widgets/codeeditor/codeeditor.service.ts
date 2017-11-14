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
  public processCode(code) {
    // this.codeedit.instance.runMode(this.code, 'text/x-go', this.cmOutput());
    let codestring = '<foreignObject width="' + code.lastWrapWidth
    + 'px" height="' + code.lastWrapHeight + 'px"><body xmlns="http://www.w3.org/1999/xhtml">' + code.wrapper.outerHTML +
    '</body></foreignObject>';
    // console.log(this.codeedit.instance);
    /*
    let codearray = code.renderedView;
    let codestring = '';
    for (let i in codearray) {
      if (codearray[i]) {
        codestring += codearray[i].node.innerHTML;
      }
    }
    */
    console.log(codestring);
    if (this.elementService.selCMEo) {
      let content = {
        cat: 'html',
        coor: {
          x: 0,
          y: 0
        },
        object: codestring,
        width: code.lastWrapWidth,
        info: 'insert corect code',
        height: code.lastWrapHeight
      };
      this.elementService.selCMEo.cmobject.content.push(content);
      this.elementService.selCMEo.state = 'new';
      this.elementService.updateSelCMEo(this.elementService.selCMEo);
    } else {
      alert('Please choose an Element to insert the code');
    }
  }
}
