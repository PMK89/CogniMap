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
export class NavigatorService {
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
