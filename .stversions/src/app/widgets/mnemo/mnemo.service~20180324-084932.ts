import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
// import { Observable } from 'rxjs/Observable';
declare var Snap: any;

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// services
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';
import { WindowService } from '../../shared/window.service';
import { EventService } from '../../shared/event.service';
import { CMStore } from '../../models/CMStore';

// models and reducers
import { CMSettings } from '../../models/CMSettings';

@Injectable()
export class MnemoService {
  public cmsettings: CMSettings;
  public selCMEo: any;
  public isnew = false;
  public position = {
    disabled: true,
    left: 0,
    top: 0
  };

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private eventService: EventService,
              private store: Store<CMStore>,
              private windowService: WindowService) {
                this.store.select('selectedcmeo')
                .subscribe((data) => {
                  if (data ) {
                    if (data !== {}) {
                      this.selCMEo = data;
                      this.position.left = this.selCMEo.coor.x;
                      this.position.top = this.selCMEo.coor.y;
                      this.position.disabled = false;
                      this.isnew = false;
                    }
                  }
                  // console.log('settings ', data);
                });
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      if (data !== undefined) {
                        this.cmsettings = data;
                        // console.log(data);
                      }
                    });
              }

  // moves view to entered coordinates
  public sendMnemo(path: string, size: number, dx: number, dy: number) {
    console.log(path);
    // console.log(arg);
    let content = {
      cat: 'im',
      coor: {
        x: 0,
        y: 0
      },
      object: path,
      width: 100,
      info: 'mnemo',
      height: size,
      correct: true
    };
    if (this.cmsettings.mode === 'new') {
      if (this.elementService.tempCMEo) {
        let tempo0str = JSON.stringify(this.elementService.tempCMEo);
        this.elementService.tempCMEo0 = JSON.parse(tempo0str);
        this.elementService.tempCMEo.types = ['i', '0', '0'];
        if (this.elementService.tempCMEo.cmobject) {
          this.elementService.tempCMEo.cmobject.content = [content];
        }
      }
      if (this.elementService.tempCMEl) {
        let templ0str = JSON.stringify(this.elementService.tempCMEl);
        this.elementService.tempCMEl0 = JSON.parse(templ0str);
        if (this.elementService.tempCMEl.cmobject) {
          this.elementService.tempCMEl.cmobject.size0 = 0;
        }
      }
      this.elementService.mPmnemo = true;
      this.elementService.mPdx = dx;
      this.elementService.mPdy = dy;
      this.elementService.mPsize = size;
      this.elementService.mPpath = path;
    } else {
      if (this.selCMEo) {
        this.selCMEo.cmobject.content.push(content);
        this.selCMEo.state = 'new';
        this.elementService.updateSelCMEo(this.selCMEo);
      }
    }
  }

  // sets current meta in settings
  public changeCME(cme) {
    if (cme['id'] && cme['cmobject']) {
      this.elementService.updateSelCMEo(cme);
    }
  }

}
