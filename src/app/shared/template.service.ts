import { Injectable, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import { Store } from '@ngrx/store';
import { ElectronService } from 'ngx-electron';
// import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';

import { SettingsService } from './settings.service';
import { ElementService } from './element.service';

// models and reducers
import { CMStore } from '../models/CMStore';
import { CMEo } from '../models/CMEo';
import { CMEl } from '../models/CMEl';

// import { nCMElement } from '../models/newCMElement';
// import { CMAction } from '../models/CMAction';
// import { CMCoor } from '../models/CMCoor';
import { CMSettings } from '../models/CMSettings';
// import { SettingsService } from './settings.service';

@Injectable()
export class TemplateService {
  public TempCMEos: CMEo[] = [];
  public TempCMEls: CMEl[] = [];
  public TempCMEo: CMEo;
  public TempCMEl: CMEl;
  public maxID: number;
  public cmsettings: CMSettings;

  constructor(private http: Http,
              private electronService: ElectronService,
              private elementService: ElementService,
              private ngZone: NgZone,
              private settingsService: SettingsService,
              private store: Store<CMStore>) {
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      if (data) {
                        this.cmsettings = data;
                      }
                    });
              }

  /*---------------------------------------------------------------------------
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  C------------Template Actions ----------------------------------------------M
  M---------------------------------------------------------------------------C
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  ---------------------------------------------------------------------------*/

  // set active CMEo template
  public setActiveTempCMEo(cmeoid: number) {
    if (this.TempCMEos) {
      for (let i in this.TempCMEos) {
        if (this.TempCMEos[i]) {
          console.log(this.TempCMEos[i].id);
          if (this.TempCMEos[i].id === cmeoid) {
            this.TempCMEos[i].state = 'active';
            this.TempCMEo = this.TempCMEos[i];
            this.elementService.setTempCMEo(this.TempCMEo);
          } else {
            this.TempCMEos[i].state = '';
          }
        }
      }
    }
  }

  // use selection as template
  public useSelectedCME() {
    if (this.elementService.selCMEo) {
      this.elementService.tempCMEo = JSON.parse(JSON.stringify(this.elementService.selCMEo));
    } else {
      if (this.TempCMEo) {
        this.elementService.tempCMEo = JSON.parse(JSON.stringify(this.TempCMEo));
      } else {
        this.elementService.tempCMEo = JSON.parse(JSON.stringify(this.TempCMEos[0]));
      }
    }
    if (this.elementService.tempCMEo) {
      this.elementService.tempCMEo.id = 0;
      this.elementService.tempCMEo.cmobject.links = undefined;
      this.elementService.tempCMEo.prep = '';
      this.elementService.tempCMEo.prep1 = '';
      this.elementService.tempCMEo.state = '';
    }
    if (this.elementService.selCMEl) {
      this.elementService.tempCMEl = JSON.parse(JSON.stringify(this.elementService.selCMEl));
    } else {
      if (this.TempCMEl) {
        this.elementService.tempCMEl = JSON.parse(JSON.stringify(this.TempCMEl));
      } else {
        this.elementService.tempCMEl = JSON.parse(JSON.stringify(this.TempCMEls[0]));
      }
    }
    if (this.elementService.tempCMEl) {
      this.elementService.tempCMEl.id = 0;
      this.elementService.tempCMEl.cmobject.markers = undefined;
      this.elementService.tempCMEl.prep = '';
      this.elementService.tempCMEl.prep1 = '';
      this.elementService.tempCMEl.state = '';
      if (this.elementService.tempCMEl.cmobject) {
        if (this.elementService.tempCMEl.cmobject.str === 'connector') {
          this.elementService.tempCMEl.cmobject.str = '';
        }
      }
    }
  }

  // set active CMEl template
  public setActiveTempCMEl(cmelid: number) {
    if (this.TempCMEls) {
      for (let i in this.TempCMEls) {
        if (this.TempCMEls[i]) {
          if (this.TempCMEls[i].id === cmelid) {
            this.TempCMEls[i].state = 'active';
            this.TempCMEl = this.TempCMEls[i];
            this.elementService.setTempCMEl(this.TempCMEl);
          } else {
            this.TempCMEls[i].state = '';
          }
        }
      }
    }
  }

  // saves a changed CMEo template to database
  public saveCMEo(cmoid: number) {
    if (this.elementService.selCMEo) {
      if (this.elementService.selCMEo.id === cmoid) {
        console.log(cmoid);
        this.changeTemplate(this.elementService.selCMEo);
      }
    }
  }

  // saves a changed CMEl template to database
  public saveCMEl(cmlid: number) {
    if (this.elementService.selCMEl) {
      if (this.elementService.selCMEl.id === cmlid) {
        console.log(cmlid);
        this.changeTemplate(this.elementService.selCMEl);
      }
    }
  }

  // saves a new CMEo template to database
  public newCMEo(title: string) {
    if (this.elementService.selCMEo) {
      let ncmeo = this.elementService.selCMEo;
      ncmeo.title = title;
      ncmeo.id = this.getMaxID() + 0.0001;
      ncmeo.prep = '';
      ncmeo.prep1 = '';
      ncmeo.cmobject.links[0].id = ncmeo.id * (-1);
      let ncmel;
      if (this.TempCMEl) {
        ncmel = this.TempCMEl;
      }
      if (ncmel !== undefined) {
        let coor = this.elementService.conectionCoor(ncmeo, ncmeo.cmobject.links[0]);
        ncmel.x0 = this.TempCMEl.x0;
        ncmel.y0 = this.TempCMEl.y0;
        ncmel.x1 = coor[0];
        ncmel.y1 = coor[1];
        ncmel.title = title;
        ncmel.id = ncmeo.cmobject.links[0].id;
        ncmel.cmobject.id1 = ncmeo.id;
        ncmeo.prep = '';
        ncmeo.prep1 = '';
        this.newTemplate(ncmel);
        this.newTemplate(ncmeo);
      }
    }
  }

  // gets maximum ID
  public getMaxID() {
    if (this.TempCMEos) {
      let idarray = [];
      for (let i in this.TempCMEos) {
        if (this.TempCMEos[i]) {
          idarray.push(this.TempCMEos[i].id);
        }
      }
      return Math.max.apply(null, idarray);
    }
  }

  // get Observable from CMEos array
  public getTempCMEos() {
    return this.TempCMEos;
  }

  // get Observable from CMEls array
  public getTempCMEls() {
    return this.TempCMEls;
  }

  // gets templates from electron
  public getTemplates() {
    let arg = this.electronService.ipcRenderer.sendSync('loadTemplates', '1');
    for (let i in arg) {
      if (arg[i]) {
        if (arg[i].id > 0) {
          this.TempCMEos.push(arg[i]);
        } else {
          this.TempCMEls.push(arg[i]);
        }
      }
    }
    this.elementService.setTempCMEo(this.TempCMEos[0]);
    this.elementService.setTempCMEl(this.TempCMEls[0]);
  }

  // sends changed stemplate back to electron
  public changeTemplate(template) {
    this.electronService.ipcRenderer.send('changeTemplate', template);
  }

  // sends new template to electron
  public newTemplate(template) {
    this.electronService.ipcRenderer.send('newTemplate', template);
  }

}
