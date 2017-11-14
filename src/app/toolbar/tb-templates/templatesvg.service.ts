import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ElectronService } from 'ngx-electron';
// import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';

import { SettingsService } from '../shared/settings.service';
import { ElementService } from '../shared/element.service';

// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMEo } from '../../models/CMEo';
import { CMEl } from '../../models/CMEl';

import { CMSettings } from '../../models/CMSettings';

@Injectable()
export class TemplateSvgService {
  public TempCMEo: CMEo;
  public TempCMEl: CMEl;
  public maxID: number;
  public cmsettings: CMSettings;

  constructor(private http: Http,
              private electronService: ElectronService,
              private elementService: ElementService,
              private settingsService: SettingsService,
              private store: Store<CMStore>) {
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      if (data) {
                        this.cmsettings = data;
                      }
                    });
                store.select('cmeotemplate')
                  .subscribe((data) => {
                    if (data) {
                      if (data instanceof CMEo) {
                        this.TempCMEo = data;
                      }
                    }
                  });
                store.select('cmeltemplate')
                  .subscribe((data) => {
                    if (data) {
                      if (data instanceof CMEl) {
                        this.TempCMEl = data;
                      }
                    }
                  });
              }
  // set active CMEo template
  public setActiveTempCMEo(cmeoid: number) {
    if (this.TempCMEo) {
      for (let i in this.TempCMEos) {
        if (this.TempCMEos[i]) {
          console.log(this.TempCMEos[i].id);
          if (this.TempCMEos[i].id === cmeoid) {
            this.TempCMEos[i].state = 'active';
            this.TempCMEo = this.TempCMEos[i];
            this.setTempCMEo(this.TempCMEo);
          } else {
            this.TempCMEos[i].state = '';
          }
        }
      }
    }
  }


}
