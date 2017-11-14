import { Injectable, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import { Store } from '@ngrx/store';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { SettingsService } from './settings.service';

// models and reducers
import { CMStore } from '../models/CMStore';
import { CME } from '../models/CME';
import { CMEo } from '../models/CMEo';
import { CMEl } from '../models/CMEl';

// import { nCMElement } from '../models/newCMElement';
import { CMAction } from '../models/CMAction';
import { CMCoor } from '../models/CMCoor';
import { CMSettings } from '../models/CMSettings';
// import { SettingsService } from './settings.service';

@Injectable()
export class ElementService {
  public cmelements: Observable<[CME]>;
  public selCMEo: CMEo;
  public selCMEl: CMEl;
  public tempCMEo: CMEo;
  public tempCMEl: CMEl;
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
                      this.setmode();
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
                    console.log('gotElements: ', Date.now());
                  });
                });
                this.electronService.ipcRenderer.on('changedCME', (event, arg) => {
                  if (arg) {
                    console.log('changedCME: ', arg, Date.now());
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
      this.store.dispatch({type: 'UPDATE_CME', payload: this.newCME(this.selCMEo) });
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

  /*---------------------------------------------------------------------------
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  C------------Store Interaction ---------------------------------------------M
  M---------------------------------------------------------------------------C
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  ---------------------------------------------------------------------------*/

  // removes elements outside the view from the store
  public cleanStore(parameters) {
    this.cmelements
      .subscribe((x) => {
        for (let i in x) {
          if (x[i]) {
            if (x[i].prio > 3) {
              if (((parameters.r + 1000) <= x[i].x0 || x[i].x0 <= (parameters.l - 1000)) &&
              ((parameters.r + 1000) <= x[i].x1 || x[i].x1 <= (parameters.l - 1000))) {
                let action = {
                  type: 'DEL_CME',
                  payload: x[i]
                };
                this.store.dispatch(action);
                console.log('del: ', x[i].id);
              } else if (((parameters.b + 1000) <= x[i].y0 || x[i].y0 <= (parameters.t - 1000)) &&
              ((parameters.b + 1000) <= x[i].y1 || x[i].y1 <= (parameters.t - 1000))) {
                let action = {
                  type: 'DEL_CME',
                  payload: x[i]
                };
                this.store.dispatch(action);
                console.log('del: ', x[i].id);
              }
            }
          }
        }
      });
  }

  // updates selected cmeo and matching dbcme
  public updateSelCMEo(cmeo: CMEo) {
    if (this.selCMEo) {
      this.selCMEo = cmeo;
      // console.log('this.selCME0o: ', this.selCMEo);
      this.store.dispatch({type: 'ADD_SCMEO', payload: cmeo });
      let newCME = this.newCME(cmeo);
      this.changeDBCME(newCME);
      // console.log('newCME : ', newCME);
      this.store.dispatch({type: 'UPDATE_CME', payload: newCME });
    }
  }

  // updates selected cmel and matching dbcme
  public updateSelCMEl(cmel: CMEl) {
    if (this.selCMEl) {
      this.selCMEl = cmel;
      this.store.dispatch({type: 'ADD_SCMEL', payload: cmel });
      let newCME = this.newCME(cmel);
      this.changeDBCME(newCME);
      this.store.dispatch({type: 'UPDATE_CME', payload: newCME });
    }
  }

  // updates element
  public updateCMEol(cme) {
    if (cme.state === 'new') {
      if (cme.cmobject.links[0]) {
        this.selCMEo = cme;
        this.changeCon(cme.cmobject.links[0].con, cme.cmobject.links[0].start);
      }
    } else {
      let newCME = this.newCME(cme);
      let action = {type: 'UPDATE_CME', payload: newCME };
      this.store.dispatch(action);
      this.changeDBCME(newCME);
    }
  }

  // set TempCMEo
  public setTempCMEo(cme: CMEo) {
    cme.prep = '';
    cme.prep1 = '';
    if (this.tempCMEo) {
      if (this.tempCMEo.id !== cme.id) {
        this.store.dispatch({type: 'DEL_CME', payload: this.newCME(this.tempCMEo)});
        this.tempCMEo = cme;
        this.store.dispatch({type: 'ADD_CME', payload: this.newCME(this.tempCMEo)});
      }
    } else {
      this.tempCMEo = cme;
      this.store.dispatch({type: 'ADD_CME', payload: this.newCME(this.tempCMEo)});
    }
  }

  // set TempCMEl
  public setTempCMEl(cme: CMEl) {
    cme.prep = '';
    cme.prep1 = '';
    if (this.tempCMEl) {
      if (this.tempCMEl.id !== cme.id) {
        this.store.dispatch({type: 'DEL_CME', payload: this.newCME(this.tempCMEl)});
        this.tempCMEl = cme;
        this.store.dispatch({type: 'ADD_CME', payload: this.newCME(this.tempCMEl)});
      }
    } else {
      this.tempCMEl = cme;
      this.store.dispatch({type: 'ADD_CME', payload: this.newCME(this.tempCMEl)});
    }
  }

  // updates element in database
  public updateCME(cme: CME) {
    let action = {type: 'UPDATE_CME', payload: cme };
    this.store.dispatch(action);
    this.changeDBCME(cme);
  }

  // sets selected CMEo or CMEl
  public setSelectedCME(id: number) {
    console.log('setSelectedCME start:', id, Date.now());
    if (this.selCMEo && id > 0) {
      if (this.selCMEo.id !== id) {
        this.selCMEo.state = '';
        let newCME = this.newCME(this.selCMEo);
        this.store.dispatch({type: 'UPDATE_CME', payload: newCME });
        // this.changeDBCME(newCME);
      }
    }
    if (this.selCMEl && id < 0) {
      if (this.selCMEl.id !== id) {
        this.selCMEl.state = '';
        let newCME = this.newCME(this.selCMEl);
        this.store.dispatch({type: 'UPDATE_CME', payload: newCME });
        // this.changeDBCME(newCME);
      }
    }
    this.cmelements
        .subscribe((data) => {
            for (let key in data) {
              if (data[key]) {
                if (data[key].id === id) {
                  let cme;
                  data[key].state = 'selected';
                  data[key].prep = '';
                  data[key].prep1 = '';
                  cme = this.CMEtoCMEol(data[key]);
                  if (id > 0) {
                    if (this.cmsettings.mode === 'dragging') {
                      if (data[key].id < -1 || data[key].id >= 1) {
                        data[key].state = 'dragging';
                        cme.state = 'dragging';
                      }
                    } else if (this.cmsettings.mode === 'progress') {
                      if (data[key].id < -1 || data[key].id >= 1) {
                        data[key].state = 'typing';
                        cme.state = 'typing';
                      }
                    }
                    this.store.dispatch({type: 'ADD_SCMEO', payload: cme });
                    console.log('setSelectedCME ADD_SCMEO:', data[key], Date.now());
                    this.store.dispatch({type: 'UPDATE_CME', payload: data[key] });
                    this.selCMEo = cme;
                  } else if (id < 0) {
                    this.store.dispatch({type: 'ADD_SCMEL', payload: cme });
                    this.store.dispatch({type: 'UPDATE_CME', payload: data[key] });
                    this.selCMEl = cme;
                  } else {
                    console.log('irregular CME!');
                  }
                  console.log('setSelectedCME end:', data[key], Date.now());
                  id = 0;
                  break;
                }
              }
            }
          },
          (error) => console.log(error),
         );
  }

  /*---------------------------------------------------------------------------
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  C------------Class transformation-------------------------------------------M
  M---------------------------------------------------------------------------C
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  ---------------------------------------------------------------------------*/

  // returns an CMEo/l from an CMEdb
  public CMEtoCMEol(cme: CME) {
    if (cme !== undefined) {
      let cmeol = {
        id: cme.id,
        x0: cme.x0,
        y0: cme.y0,
        x1: cme.x1,
        y1: cme.y1,
        prio: cme.prio,
        title: cme.title,
        types: cme.types,
        coor: cme.coor,
        cat: cme.cat,
        state: cme.state,
        cmobject: JSON.parse(cme.cmobject),
        prep: cme.prep,
        prep1: cme.prep1
      };
      // console.log('CMEtoCMEol: ', cmeol);
      return cmeol;
    } else {
      return undefined;
    }
  }

  public newCME(cme) {
    if (cme !== undefined) {
      let CME = {
        id: cme.id,
        x0: cme.x0,
        y0: cme.y0,
        x1: cme.x1,
        y1: cme.y1,
        cdate: Date.now(),
        vdate: Date.now(),
        prio: cme.prio,
        title: cme.title,
        types: cme.types,
        coor: cme.coor,
        cat: cme.cat,
        state: cme.state,
        cmobject: JSON.stringify(cme.cmobject),
        prep: cme.prep,
        prep1: cme.prep1
      };
      return CME;
    } else {
      return undefined;
    }
  }

  /*---------------------------------------------------------------------------
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  C------------Element creation- ---------------------------------------------M
  M---------------------------------------------------------------------------C
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  ---------------------------------------------------------------------------*/

  // generates a new CMEo element
  public newCMEo(oldcme: CMEo, cmcoor: CMCoor) {
    if (this.tempCMEo) {
      console.log('newCMEo start: ', Date.now());
      let newElemObj: CMEo = new CMEo(); // maybe an error
      this.maxID++;
      newElemObj = JSON.parse(JSON.stringify(this.tempCMEo));
      newElemObj.cmobject.links = undefined;
      this.cmsettings.mode = 'progress';
      this.settingsService.updateSettings(this.cmsettings);
      newElemObj.id = this.maxID;
      newElemObj.prio = oldcme.prio + 1;
      newElemObj.coor = cmcoor;
      newElemObj.x0 = cmcoor.x;
      newElemObj.y0 = cmcoor.y;
      newElemObj.x1 = cmcoor.x + 50;
      newElemObj.y1 = cmcoor.y + 20;
      newElemObj.title = '';
      newElemObj.state = 'typing';
      newElemObj.cmobject.links = [{
        id: 0,
        targetId: oldcme.id,
        title: oldcme.title,
        peerCoor: oldcme.coor,
        weight: -1,
        con: 'e',
        start: false
      }];
      let newCME = this.newCME(newElemObj);
      this.newDBCME(newCME);
      let action = {type: 'ADD_CME', payload: newCME };
      this.store.dispatch(action);
      oldcme.cmobject.links.push({
        id: 0,
        targetId: newElemObj.id,
        title: newElemObj.title,
        peerCoor: cmcoor,
        weight: -1,
        con: 'e',
        start: true
      });
      this.updateCMEol(oldcme);
      this.setSelectedCME(newElemObj.id);
      console.log('old: ', oldcme, ' new: ', newElemObj);
      this.newCMEl(oldcme, newElemObj);
      // console.log('Object: ', action);
    }
  }

  // connects two CMEo elements
  public newConnector(id: number) {
    if (this.selCMEo) {
      this.cmelements
          .subscribe((data) => {
              for (let key in data) {
                if (data[key]) {
                  if (data[key].id === id) {
                    id = 0;
                    let ccme = this.CMEtoCMEol(data[key]);
                    ccme.cmobject.links.push({
                      id: 0,
                      targetId: this.selCMEo.id,
                      title: this.selCMEo.title,
                      peerCoor: this.selCMEo.coor,
                      weight: -1,
                      con: 'e',
                      start: false
                    });
                    this.selCMEo.cmobject.links.push({
                      id: 0,
                      targetId: ccme.id,
                      title: ccme.title,
                      peerCoor: ccme.coor,
                      weight: -1,
                      con: 'e',
                      start: true
                    });
                    this.selCMEo.state = '';
                    this.updateSelCMEo(this.selCMEo);
                    // console.log('old: ', oldcme, ' new: ', newElemObj);
                    this.newCMEl(this.selCMEo, ccme);
                    // console.log('Object: ', action);
                    this.setSelectedCME(ccme.id);
                  }
                }
              }
            },
            (error) => console.log(error),
           );
    }
  }

  // generates a new line element
  public newCMEl(oldcme: CMEo, newcme: CMEo) {
    if (this.tempCMEl) {
      let oldlink = oldcme.cmobject.links;
      let oldxy = this.conectionCoor(oldcme, oldlink[oldlink.length - 1]);
      let newlink = newcme.cmobject.links;
      let newxy = this.conectionCoor(newcme, newlink[0]);
      let newElem: CMEl = {
        id: (-1) * parseInt(String(oldcme.id) + String(newcme.id), 10),
        title: String(oldcme.id) + '-' + String(newcme.id),
        prio: oldcme.prio + 1,
        x0: oldxy[0],
        y0: oldxy[1],
        x1: newxy[0],
        y1: newxy[1],
        types: this.tempCMEl.types,
        coor: {x: 0, y: 0},
        cat: this.tempCMEl.cat,
        state: 'selected',
        cmobject: this.tempCMEl.cmobject,
        prep: '',
        prep1: ''
      };
      newElem.cmobject.title0 = oldcme.title;
      newElem.cmobject.title1 = newcme.title;
      newElem.cmobject.id0 = oldcme.id;
      newElem.cmobject.id1 = newcme.id;
      // console.log('before: ', newElem.coor);
      if (newElem.x1 >= newElem.x0) {
        newElem.coor.x = newElem.x0;
        // console.log('x1>=x0: ', newElem.coor);
      } else {
        newElem.coor.x = newElem.x1;
        // console.log('x1<=x0: ', newElem.coor);
      }
      if (newElem.y1 >= newElem.y0) {
        newElem.coor.y = newElem.y0;
        // console.log('y1>=y0: ', newElem.coor);
      } else {
        newElem.coor.y = newElem.y1;
        // console.log('y1<=y0: ', newElem.coor);
      }
      // console.log('after: ', newElem.coor);
      oldlink[oldcme.cmobject.links.length - 1].id = newElem.id;
      this.updateCMEol(oldcme);
      newcme.cmobject.links[0].id = newElem.id;
      this.updateSelCMEo(newcme);
      // console.log('functions: ', newElem.coor);
      let newCME = this.newCME(newElem);
      let action = {type: 'ADD_CME', payload: newCME };
      this.store.dispatch(action);
      this.newDBCME(newCME);
      if (this.cmsettings.mode === 'progress') {
        this.cmsettings.mode = 'new';
        this.settingsService.updateSettings(this.cmsettings);
      }
      this.setSelectedCME(newElem.id);
      // console.log('after dispatch: ', newElem.coor);
      // console.log('old: ', oldcme, ' new: ', newcme, ' newLine: ', newElem);
      // console.log('Line: ', action);
    }
  }

  // generates a new pointer line
  public newPointer(coor) {
    if (this.selCMEo) {
      let idstring = (this.selCMEo.id.toString() + parseInt(coor.x, 10).toString()
      + parseInt(coor.y, 10).toString());
      let nid = (-1) * parseInt(idstring, 10);
      this.selCMEo.cmobject.links.push({
        id: nid,
        targetId: 0,
        title: 'Pointer',
        peerCoor: coor,
        weight: -1,
        con: 'e',
        start: true
      });
      let oldxy = this.conectionCoor(this.selCMEo,
         this.selCMEo.cmobject.links[this.selCMEo.cmobject.links.length - 1]);
      // console.log(newlink);
      let newElem: CMEl = {
        id: nid,
        title: String(this.selCMEo.id) + '-' + String('Pointer'),
        prio: this.selCMEo.prio + 1,
        x0: oldxy[0],
        y0: oldxy[1],
        x1: coor.x,
        y1: coor.y,
        types: ['p', 'p', '0'],
        coor: {x: 0, y: 0},
        cat: this.tempCMEl.cat,
        state: 'selected',
        cmobject: this.tempCMEl.cmobject,
        prep: '',
        prep1: ''
      };
      newElem.cmobject.title0 = this.selCMEo.title;
      newElem.cmobject.title1 = 'Pointer';
      newElem.cmobject.id0 = this.selCMEo.id;
      newElem.cmobject.id1 = 0;
      // console.log('before: ', newElem.coor);
      if (newElem.x1 >= newElem.x0) {
        newElem.coor.x = newElem.x0;
        // console.log('x1>=x0: ', newElem.coor);
      } else {
        newElem.coor.x = newElem.x1;
        // console.log('x1<=x0: ', newElem.coor);
      }
      if (newElem.y1 >= newElem.y0) {
        newElem.coor.y = newElem.y0;
        // console.log('y1>=y0: ', newElem.coor);
      } else {
        newElem.coor.y = newElem.y1;
        // console.log('y1<=y0: ', newElem.coor);
      }
      // console.log('after: ', newElem.coor);
      this.updateCMEol(this.selCMEo);
      // console.log('functions: ', newElem.coor);
      let newCME = this.newCME(newElem);
      let action = {type: 'ADD_CME', payload: newCME };
      this.store.dispatch(action);
      this.newDBCME(newCME);
      this.cmsettings.mode = 'pointing';
      this.settingsService.updateSettings(this.cmsettings);
      this.setSelectedCME(newElem.id);
      // console.log('after dispatch: ', newElem.coor);
      // console.log('old: ', oldcme, ' new: ', newcme, ' newLine: ', newElem);
      // console.log('Line: ', action);
    }
  }

  // generates connection coordinates
  public conectionCoor(cmelement, link) {
    let width = cmelement.x1 - cmelement.x0;
    let height = cmelement.y1 - cmelement.y0;
    let modx = 5;
    let mody = 5;
    if (cmelement.types[1] === 'c') {
      modx += (width / 4);
      mody += (height / 4);
    } else if (cmelement.types[1] === 'e') {
      modx += (width / 3);
      mody += (height / 3);
    } else if (cmelement.types[1] === 'a') {
      modx += (width / 10);
      mody += (height / 10);
    } else if (cmelement.types[1] === 't') {
      link.con = 't';
      mody = height - 3;
      if (link.peerCoor.x >= (cmelement.coor.x + width)) {
        modx = width - 3;
      } else {
        modx = 3;
      }
    }
    switch (link.con) {
      case 'a':
        return [cmelement.x0 + modx, cmelement.y0 + mody];
      case 'ab':
        return [(cmelement.x0 + (width / 2) ), cmelement.y0];
      case 'b':
        return [(cmelement.x0 + width - modx ), cmelement.y0 + mody];
      case 'bc':
        return [(cmelement.x0 + width), (cmelement.y0 + (height / 2 ))];
      case 'c':
        return [(cmelement.x0 + width - modx), (cmelement.y0 + height - mody)];
      case 'cd':
        return [(cmelement.x0 + (width / 2 )), (cmelement.y0 + height)];
      case 'd':
        return [cmelement.x0 + modx, (cmelement.y0 + height - mody)];
      case 'da':
        return [cmelement.x0, (cmelement.y0 + (height / 2 ))];
      case 'e':
        // console.log(cmelement.x0, width, cmelement.y0, height);
        return [(cmelement.x0 + (width / 2 )), (cmelement.y0
          + (height / 2 ))];
      case 't':
        // console.log(cmelement.x0, width, cmelement.y0, height);
        return [(cmelement.x0 + modx), (cmelement.y0 + mody)];
      default:
        return [cmelement.x0, cmelement.y0];
    }
  }

  /*---------------------------------------------------------------------------
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  C------------Dragging ------------------------------------------------------M
  M---------------------------------------------------------------------------C
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  ---------------------------------------------------------------------------*/

  // if dragging is activated set selected CMEo state to dragging
  public setmode() {
    if (this.cmsettings) {
      console.log(this.cmsettings.mode);
      if (this.cmsettings.mode === 'dragging') {
        if (this.selCMEo) {
          // console.log(this.selCMEo);
          this.selCMEo.state = 'dragging';
          this.updateSelCMEo(this.selCMEo);
        }
      } else {
        if (this.selCMEo) {
          if (this.selCMEo.state === 'dragging') {
            this.selCMEo.state = 'selected';
            this.updateSelCMEo(this.selCMEo);
          }
        }
      }
      if (this.cmsettings.mode === 'templateEdit') {
        if (this.selCMEo) {
          this.updateSelCMEo(this.selCMEo);
        }
        if (this.selCMEl) {
          this.updateSelCMEl(this.selCMEl);
        }
        this.setTempCMEo(this.tempCMEo);
        this.setTempCMEl(this.tempCMEl);
        this.setSelectedCME(this.tempCMEo.id);
        this.setSelectedCME(this.tempCMEl.id);
      }
    }
  }

  // moves element by dragging differences
  public moveElement(x, y) {
    if (this.selCMEo && x && y) {
      if (this.selCMEo.state === 'dragging') {
        this.selCMEo.coor.x += x;
        this.selCMEo.coor.y += y;
        this.selCMEo.x0 += x;
        this.selCMEo.y0 += y;
        this.selCMEo.x1 += x;
        this.selCMEo.y1 += y;
        this.selCMEo.prep = '';
        this.selCMEo.state = 'selected';
        // console.log(this.selCMEo);
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
        this.updateSelCMEo(this.selCMEo);
        for (let i in this.selCMEo.cmobject.links) {
          if (this.selCMEo.cmobject.links[i]) {
            let link = this.selCMEo.cmobject.links[i];
            let conxy = this.conectionCoor(this.selCMEo, link);
            this.changeLink(link.id, conxy[0], conxy[1], link.start);
            // console.log('move: ', link.id);
          }
        }
      }
    }
  }

  // changes link if object is moved
  public changeLink(id: number, x: number, y: number, start: boolean) {
    this.cmelements
        .subscribe((data) => {
            for (let key in data) {
              if (data[key]) {
                if (data[key].id === id) {
                  if (start) {
                    data[key].x0 = x;
                    data[key].y0 = y;
                  } else {
                    data[key].x1 = x;
                    data[key].y1 = y;
                  }
                  if (data[key].x1 >= data[key].x0) {
                    data[key].coor.x = data[key].x0;
                    // console.log('x1>=x0: ', data[key].coor);
                  } else {
                    data[key].coor.x = data[key].x1;
                    // console.log('x1<=x0: ', data[key].coor);
                  }
                  if (data[key].y1 >= data[key].y0) {
                    data[key].coor.y = data[key].y0;
                    // console.log('y1>=y0: ', data[key].coor);
                  } else {
                    data[key].coor.y = data[key].y1;
                    // console.log('y1<=y0: ', data[key].coor);
                  }
                  data[key].prep = '';
                  console.log('link: ', data[key].id);
                  if (this.selCMEl) {
                    if (this.selCMEl.id === id) {
                      this.selCMEl.x0 = data[key].x0;
                      this.selCMEl.y0 = data[key].y0;
                      this.selCMEl.x1 = data[key].x1;
                      this.selCMEl.y1 = data[key].y1;
                      this.selCMEl.coor = data[key].coor;
                      this.selCMEl.prep = '';
                    }
                  }
                  this.updateCME(data[key]);
                  id = 0;
                }
              }
            }
          },
          (error) => console.log(error),
         );
  }

  /*---------------------------------------------------------------------------
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  C------------Element changes -----------------------------------------------M
  M---------------------------------------------------------------------------C
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  ---------------------------------------------------------------------------*/

  // changes link titles if title of object is changed
  public changeLinkTitle(id: number, title: string, start: boolean) {
    console.log(id);
    this.cmelements
        .subscribe((data) => {
            for (let key in data) {
              if (data[key]) {
                if (data[key].id === id) {
                  let cme = this.CMEtoCMEol(data[key]);
                  if (start) {
                    cme.cmobject.title0 = title;
                  } else {
                    cme.cmobject.title1 = title;
                  }
                  console.log(cme);
                  this.updateCMEol(cme);
                  id = 0;
                }
              }
            }
          },
          (error) => console.log(error),
         );
  }

  // changes object link titles if title of object is changed
  public changeObjectTitle(id: number, title: string, linkid: number) {
    this.cmelements
        .subscribe((data) => {
            for (let key in data) {
              if (data[key]) {
                if (data[key].id === id) {
                  let cme = this.CMEtoCMEol(data[key]);
                  for (let i in cme.cmobject.links) {
                    if (cme.cmobject.links[i]) {
                      if (cme.cmobject.links[i].id === linkid) {
                        cme.cmobject.links[i].title = title;
                      }
                    }
                  }
                  this.updateCMEol(cme);
                  id = 0;
                }
              }
            }
          },
          (error) => console.log(error),
         );
  }

  // changes links if connections are changed
  public changeCon(con: string, start: boolean) {
    if (this.selCMEo) {
      console.log(this.selCMEo);
      if (this.selCMEo.state === 'new') {
        this.selCMEo.state = 'selected';
      }
      for (let i in this.selCMEo.cmobject.links) {
        if (this.selCMEo.cmobject.links[i]) {
          if (this.selCMEo.cmobject.links[i].start === start) {
            let link = this.selCMEo.cmobject.links[i];
            link.con = con;
            let conxy = this.conectionCoor(this.selCMEo, link);
            this.changeLink(link.id, conxy[0],
              conxy[1], link.start);
          }
        }
      }
      this.selCMEo.prep = '';
      this.updateSelCMEo(this.selCMEo);
    }
  }

  // changes element with input in form of CMAction
  public changeCMEo(action: CMAction) {
    if (this.selCMEo) {
      let variable = action.variable;
      let n = variable.length;
      switch (n) {
        case 1:
          if (variable[0] === 'types') {
            this.selCMEo.types[0] = action.value[0];
            this.selCMEo.types[1] = action.value[1];
            this.selCMEo.types[2] = action.value[2];
          } else if (variable[0] === 'title') {
            this.cmsettings.mode = 'edit';
            this.settingsService.updateSettings(this.cmsettings);
            if (action.value === '') {
              this.delCME(this.selCMEo.id);
              break;
            } else {
              this.selCMEo.state = 'new';
              this.selCMEo.title = action.value;
            }
            for (let i in this.selCMEo.cmobject.links) {
              if (this.selCMEo.cmobject.links[i]) {
                // console.log(this.selCMEo.cmobject.links[i]);
                this.changeLinkTitle(this.selCMEo.cmobject.links[i].id, action.value,
                  this.selCMEo.cmobject.links[i].start);
                this.changeObjectTitle(this.selCMEo.cmobject.links[i].targetId, action.value,
                  this.selCMEo.cmobject.links[i].id);
              }
            }
          } else {
            this.selCMEo[variable[0]] = action.value;
          }
          break;
        case 2:
          this.selCMEo[variable[0]][variable[1]] = action.value;
          break;
        case 3:
          this.selCMEo[variable[0]][variable[1]][variable[2]] = action.value;
          break;
        case 4:
          this.selCMEo[variable[0]][variable[1]][variable[2]][variable[3]]
           = action.value;
          break;
        default:
          console.log('ERROR: changeCMEo(): no fitting property');
      }
      if (this.selCMEo) {
        console.log(this.selCMEo);
        this.selCMEo.prep = '';
        this.selCMEo.prep1 = '';
        this.updateSelCMEo(this.selCMEo);
      }
    }
  }

  // changes element with input in form of CMAction
  public changeCMEl(action: CMAction) {
    // console.log(action);
    if (this.selCMEl) {
      let variable = action.variable;
      let n = variable.length;
      switch (n) {
        case 1:
          if (variable[0] === 'types') {
            this.selCMEl.types[0] = action.value[0];
            this.selCMEl.types[1] = action.value[1];
            this.selCMEl.types[2] = action.value[2];
          } else {
            this.selCMEl[variable[0]] = action.value;
          }
          break;
        case 2:
          this.selCMEl[variable[0]][variable[1]] = action.value;
          break;
        case 3:
          this.selCMEl[variable[0]][variable[1]][variable[2]] = action.value;
          break;
        case 4:
          this.selCMEl[variable[0]][variable[1]][variable[2]][variable[3]]
           = action.value;
          break;
        default:
          console.log('ERROR: changeCMEl(): no fitting property');
      }
      // console.log(this.selCMEl);
      this.selCMEl.prep = '';
      this.selCMEl.prep1 = '';
      this.updateSelCMEl(this.selCMEl);
    }
  }

  // deletes selected element
  public delCME(id: number) {
    if (id < -1) {
      if (id === this.selCMEl.id) {
        this.delLink(this.selCMEl.cmobject.id0, id);
        this.delLink(this.selCMEl.cmobject.id1, id);
        let action = {
          type: 'DEL_CME',
          payload: this.selCMEl
        };
        this.store.dispatch(action);
        this.store.dispatch({ type: 'DEL_SCMEL', payload: ''});
        this.deleteDBCME(this.selCMEl.id);
        this.selCMEl = undefined;
      }
    } else if (id >= 1) {
      if (id === this.selCMEo.id) {
        for (let key in this.selCMEo.cmobject.links) {
          if (this.selCMEo.cmobject.links[key]) {
            this.delCMEl(this.selCMEo.cmobject.links[key].id);
          }
        }
        let action = {
          type: 'DEL_CME',
          payload: this.selCMEo
        };
        this.store.dispatch(action);
        this.store.dispatch({ type: 'DEL_SCMEO', payload: ''});
        this.deleteDBCME(this.selCMEo.id);
        this.selCMEo = undefined;
      }
    }
  }

  public delCMEl(linkid: number) {
    this.cmelements
        .subscribe((data) => {
            for (let key in data) {
              if (data[key]) {
                if (data[key].id === linkid) {
                  if (data[key].id < -1) {
                    let cme = this.CMEtoCMEol(data[key]);
                    this.delLink(cme.cmobject.id0, linkid);
                    this.delLink(cme.cmobject.id1, linkid);
                    let action = {
                      type: 'DEL_CME',
                      payload: cme
                    };
                    this.store.dispatch(action);
                    this.deleteDBCME(cme.id);
                  }
                  linkid = 0;
                }
              }
            }
          },
          (error) => console.log(error),
        );
  }

  public delLink(cmeid: number, linkid: number) {
    if (cmeid >= 1 && linkid < -1) {
      let data = this.electronService.ipcRenderer.sendSync('getCME', cmeid);
      if (data) {
        let cme = this.CMEtoCMEol(data);
        let pos;
        for (let i = 0; i < cme.cmobject.links.length; i++) {
          if (cme.cmobject.links[i]) {
            if (cme.cmobject.links[i].id === linkid) {
              pos = i;
            }
          }
        }
        if (pos) {
          cme.cmobject.links.splice(pos, 1);
          let newCME = this.newCME(cme);
          this.updateCME(newCME);
        }
      }
    }
  }

}
