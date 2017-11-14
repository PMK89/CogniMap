import { Injectable, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import { Store } from '@ngrx/store';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { SettingsService } from '../settings.service';

// models and reducers
import { CMStore } from '../../models/CMStore';
import { CME } from '../../models/CME';
import { CMEo } from '../../models/CMEo';
import { CMEl } from '../../models/CMEl';

// import { nCMElement } from '../../models/newCMElement';
import { CMSettings } from '../../models/CMSettings';
// import { SettingsService } from './settings.service';

@Injectable()
export class ElementElectronService {
  public cmelements: Observable<[CME]>;
  public selCMEo: CMEo;
  public selCMEl: CMEl;
  public inputtext: string;
  public maxID: number;
  public cmsettings: CMSettings;
  public prod = true;

  constructor(private http: Http,
              private electronService: ElectronService,
              private ngZone: NgZone,
              private settingsService: SettingsService,
              private store: Store<CMStore>) {
                this.cmelements = store.select('cmes');
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      this.cmsettings = data;
                      // console.log('settings ', data);
                    });
                // let store = this.store;
                this.electronService.ipcRenderer.on('loadedCME', (event, arg) => {
                  ngZone.run(() => {
                    // console.log(arg);
                    let action = {
                      type: 'ADD_CME_FROM_DB',
                      payload: arg
                    };
                    store.dispatch(action);
                    // console.log('gotElements: ', Date.now());
                  });
                });
                this.electronService.ipcRenderer.on('changedCME', (event, arg) => {
                  if (arg) {
                    // console.log('changedCME: ', arg, Date.now());
                  }
                });
              }

  /*---------------------------------------------------------------------------
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  C------------Database Interaction ------------------------------------------M
  M---------------------------------------------------------------------------C
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  ---------------------------------------------------------------------------*/

  // gets data from database/server
  public getElements(parameters) {
    if (parameters) {
      // Catches Data from Element-Service
      this.electronService.ipcRenderer.send('loadCME', parameters);
      console.log('getElements: ', Date.now());
      // this.elementService.cleanStore(parameters);
    }
  }

  public getPicture() {
    let arg = this.electronService.ipcRenderer.sendSync('getPicture', '1');
    console.log(arg);
    if (this.selCMEo) {
      let content = {
        cat: 'i',
        coor: {x: 0, y: 0},
        object: arg,
        width: 100,
        height: 100
      };
      this.selCMEo.title = 'Bild';
      this.selCMEo.types = ['i', '0', '0'];
      this.selCMEo.cmobject.content.push(content);
      this.store.dispatch({type: 'ADD_SCMEO', payload: this.selCMEo });
      // this.store.dispatch({type: 'UPDATE_CME', payload: this.newCME(this.selCMEo) });
    }
  }

  // gets data from database/server
  public getMaxID() {
    // Pro: gets data from electron
    let maxID = this.electronService.ipcRenderer.sendSync('maxID', '1');
    if (typeof maxID === 'number') {
      this.maxID = maxID;
      console.log(this.maxID);
    } else {
      console.log(maxID);
    }
  }

  // makes picture background transparent
  public makeTrans(color0) {
    if (this.selCMEo) {
      if (this.selCMEo.cmobject.content.length > 0) {
        if (this.selCMEo.cmobject.content[0].object.indexOf('.png')) {
          let arg = {
            color: color0,
            file: this.selCMEo.cmobject.content[0].object
          };
          this.electronService.ipcRenderer.send('makeTrans', arg);
        }
      }
    }
  }

  // Creates a new database entry
  public newDBCME(cme: CME) {
    if (cme) {
      console.log('new id:', cme.id, Date.now());
      cme.state = '';
      this.electronService.ipcRenderer.send('newCME', cme);
    }
  }

  // changes CME in database
  public changeDBCME(dbcme: CME) {
    console.log('change id:', dbcme.id, Date.now());
    dbcme.state = '';
    this.electronService.ipcRenderer.send('changeCME', dbcme);
  }

  // delete CME in database
  public deleteDBCME(id: number) {
    console.log('delete id:', id, Date.now());
    this.electronService.ipcRenderer.send('delCME', id);
  }
}
