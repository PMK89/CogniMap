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
export class MinimapService {
  public cmsettings: CMSettings;
  public selCMEo: any;
  public isnew = false;
  public selecting = false;
  public zoom = 1;
  public lastevent: any;
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

  // sets current meta in settings
  public changeCME(cme) {
    if (cme['id'] && cme['cmobject']) {
      this.elementService.updateSelCMEo(cme);
    }
  }

  // sets  settings
  public setSettings(settings) {
    this.settingsService.updateSettings(settings);
  }

  // moves element to entered coordinates
  public moveTo(x: number, y: number) {
    try {
      this.windowService.scrollXY(x, y);
      if (this.isnew) {
        let oldcme = JSON.parse(JSON.stringify(this.selCMEo));
        let coor = {
          x: x,
          y: y
        };
        this.elementService.newCMEo(oldcme, coor);
        this.eventService.position = undefined;
      } else {
        let xdif = x - this.selCMEo.coor.x;
        let ydif = y - this.selCMEo.coor.y;
        this.elementService.moveElement(xdif, ydif, true);
      }

    } catch (err) {
      console.log(err);
    }
  }

  // allows area selection on the minimap
  public minimapSelection(e) {
    this.lastevent = e;
    this.eventService.minimapevent = e;
    this.eventService.minimapselect = this.zoom;
    console.log(this.eventService.minimapselect);
    this.eventService.onMouseDown(e);
  }

}
