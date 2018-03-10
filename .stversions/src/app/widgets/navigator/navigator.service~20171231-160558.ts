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
export class NavigatorService {
  public cmsettings: CMSettings;
  public selCMEo: any;
  public new = false;
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
                      this.new = false;
                    }
                  }
                  // console.log('settings ', data);
                });
                this.eventService.keyUp()
                .subscribe(
                  (data) => {
                    if (data) {
                      if (data['y'] && data['x']) {
                        this.position.left = data['x'];
                        this.position.top = data['y'];
                        this.position.disabled = false;
                        this.new = true;
                        // console.log(data);
                      } else {
                        if (this.selCMEo) {
                          this.position.left = this.selCMEo.coor.x;
                          this.position.top = this.selCMEo.coor.y;
                          this.position.disabled = false;
                          this.new = false;
                        } else {
                          this.position.disabled  = true;
                          this.new = false;
                        }
                      }
                    } else {
                      if (this.selCMEo) {
                        this.position.left = this.selCMEo.coor.x;
                        this.position.top = this.selCMEo.coor.y;
                        this.position.disabled = false;
                        this.new = false;
                      } else {
                        this.position.disabled  = true;
                        this.new = false;
                      }
                    }
                  },
                  (error) => console.log(error)
                );
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      if (data !== undefined) {
                        this.cmsettings = data;
                        // console.log(data);
                      }
                    });
              }

  // moves view to entered coordinates
  public goTo(x: string, y: string) {
    try {
      let x1 = parseInt(x, 10);
      let y1 = parseInt(y, 10);
      this.windowService.scrollXY(x1, y1);
    } catch (err) {
      console.log(err);
    }
  }

  // sets current meta in settings
  public setCurrentMeta(settings) {
    this.settingsService.updateSettings(settings);
  }

  // sets current meta in settings
  public changeCME(cme) {
    if (cme['id'] && cme['cmobject']) {
      this.elementService.updateSelCMEo(cme);
    }
  }

  // add value to current coordinates
  public addCoor(coor: string, n0, n1) {
    try {
      let nn0 = parseFloat(n0);
      let nn1 = parseFloat(n1);
      if (coor === 'x') {
        this.position.left = nn0 + nn1;
      } else {
        this.position.top = nn0 + nn1;
      }
    } catch (err) {
      console.log(err);
    }
  }

  // moves element to entered coordinates
  public moveTo(x: string, y: string) {
    try {
      let x1 = parseFloat(x);
      let y1 = parseFloat(y);
      this.windowService.scrollXY(x1, y1);
      if (this.new) {
        let oldcme = JSON.parse(JSON.stringify(this.selCMEo));
        let coor = {
          x: x1,
          y: y1
        }
        this.elementService.newCMEo(oldcme, coor);
        this.eventService.position = undefined;
      } else {
        let xdif = x1 - this.selCMEo.coor.x;
        let ydif = y1 - this.selCMEo.coor.y;
        this.elementService.moveElement(xdif, ydif, true);
      }

    } catch (err) {
      console.log(err);
    }
  }

  // finds element by title
  public findTitle(title: string) {
    if (title !== '') {
      return this.elementService.getDBCMEbyTitle(title);
    }
  }

  // finds element by id
  public findID(id: number) {
    return [this.elementService.getDBCMEbyId(id)];
  }

  // get all linked elements
  public findAll(cme) {
    let cmeo = this.elementService.CMEtoCMEol(cme);
    let cmearray = [];
    if (cmeo) {
      if (cmeo.cmobject.links.length > 0) {
        for (let key in cmeo.cmobject.links) {
          if (cmeo.cmobject.links[key]) {
            if (cmeo.cmobject.links[key].targetId !== cmeo.id) {
              cmearray.push(this.elementService.getDBCMEbyId(cmeo.cmobject.links[key].targetId));
            }
          }
        }
        return cmearray;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

}
