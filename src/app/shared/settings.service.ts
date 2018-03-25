import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'ngx-electron';
import { CMStore } from '../models/CMStore';
import { CMSettings } from '../models/CMSettings';
import { CMColorbar } from '../models/CMColorbar';
// import { CMElement } from '../models/CMElement';

// const ipcRenderer = require('electron').ipcRenderer;

@Injectable()
export class SettingsService {
  public cmsettings: Observable<CMSettings> = this.store.select('settings');

  constructor(private http: Http,
              private electronService: ElectronService,
              private store: Store<CMStore>) {
                this.electronService.ipcRenderer.on('changedColors', (event, arg) => {
                  console.log('changeAllcolors:', arg);
                  let action = {
                    type: 'ADD_CMC_FROM_DB',
                    payload: arg
                  };
                  store.dispatch(action);
                });
              }

  // reads data from Electron
  public getSettings() {
    // console.log('getSettings');
    let arg = this.electronService.ipcRenderer.sendSync('loadSettings', '1');
    this.store.dispatch({ type: 'ADD_CMS_FROM_DB', payload: arg });
  }

  // updates settings
  public updateSettings(cmsettings: CMSettings) {
    // console.log(cmsettings);
    if (cmsettings !== undefined) {
      let action = {type: 'ADD_CMS', payload: cmsettings };
      this.store.dispatch(action);
      this.changeSetting(cmsettings);
    }
  }

  // reads buttons from Database
  public getButtons() {
    // console.log('getButtons');
    this.electronService.ipcRenderer.send('loadButtons', '1');
    let store = this.store;
    this.electronService.ipcRenderer.on('loadedButtons', (event, arg) => {
      let action = {
        type: 'ADD_CMB_FROM_DB',
        payload: arg
      };
      store.dispatch(action);
    });
  }

  // reads colors from Database
  public getColors() {
    // console.log('getColors');
    this.electronService.ipcRenderer.send('loadColors', '1');
    let store = this.store;
    this.electronService.ipcRenderer.on('loadedColors', (event, arg) => {
      let action = {
        type: 'ADD_CMC_FROM_DB',
        payload: arg
      };
      store.dispatch(action);
    });
  }

  // posts changed settings
  public changeSetting (Settings: CMSettings) {
    this.electronService.ipcRenderer.send('changeSettings', Settings);
  }

  // posts changed Color
  public changeColors (Color: CMColorbar) {
    this.electronService.ipcRenderer.send('changeColors', Color);
  }

  // posts changed Color
  public changeAllColors (Colors: CMColorbar[]) {
    this.electronService.ipcRenderer.send('changeAllColors', Colors);
  }

  // posts new Colorbar
  public newColors (Color: CMColorbar) {
    this.electronService.ipcRenderer.send('addColors', Color);
  }

  // finds Errors in Database and Outputs effected entries
  public findErrors() {
    // console.log('getSettings');
    let arg = this.electronService.ipcRenderer.sendSync('searchDb', '1');
    console.log(arg);
  }
}
