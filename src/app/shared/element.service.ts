import { Injectable, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import { Store } from '@ngrx/store';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
declare var Snap: any;

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

@Injectable()
export class ElementService {
  public cmelements: Observable<[CME]>;
  public selCMEo: CMEo;
  public selCMEl: CMEl;
  public tempCMEo: CMEo;
  public tempCMEl: CMEl;
  public tempCMEo0: CMEo;
  public tempCMEl0: CMEl;
  public markCMEo: CMEo;
  public tempMarkCMEo: CMEo;
  public quizCMEo: CMEo;
  public quizmode = '';
  public tempQuizCMEo: CMEo;
  public cmap = true;
  public allCME = [];
  public selCME = [];
  public inputtext: string;
  public maxID = 0;
  public counter = 0;
  public startPos: CMCoor;
  public selCMEoArray: number[] = [];
  public selCMElArray: number[] = [];
  public selCMElArrayBorder: number[] = [];
  public cmsettings: CMSettings;
  public mPmnemo = false;
  public mPdx = 0.5;
  public mPdy = 0.5;
  public mPsize = 50;
  public mPpath = '';

  constructor(private http: Http,
              private electronService: ElectronService,
              private ngZone: NgZone,
              // private snapsvgService: SnapsvgService,
              private settingsService: SettingsService,
              private store: Store<CMStore>) {
                this.cmelements = store.select('cmes');
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      this.cmsettings = data;
                      if (this.cmsettings) {
                        if (this.cmsettings.maxid > this.maxID) {
                          this.maxID = this.cmsettings.maxid;
                        }
                      }
                      this.setmode();
                      // console.log('settings ', data);
                    });
                // let store = this.store;
                this.electronService.ipcRenderer.on('loadedCME', (event, arg) => {
                  ngZone.run(() => {
                    // console.log(arg);
                    if (this.cmsettings.mode !== 'minimap') {
                      let action = {
                        type: 'ADD_CME_FROM_DB',
                        payload: arg
                      };
                      if (this.cmsettings.mode === 'cutting' || this.cmsettings.mode === 'typing') {
                        action.type = 'ADD_CME';
                      }
                      store.dispatch(action);
                      // console.log('gotElements: ', Date.now());
                    }
                  });
                });
                this.electronService.ipcRenderer.on('changedCME', (event, arg) => {
                  if (arg) {
                    if (Array.isArray(arg)) {
                      for (let key in arg) {
                        if (arg[key]) {
                          this.store.dispatch({type: 'UPDATE_CME', payload: arg[key] });
                        }
                      }
                      // console.log('changedCME: ', arg);
                    } else {
                      console.log('changedCME: ', arg);
                    }
                  }
                });
                this.electronService.ipcRenderer.on('selectedChildren', (event, arg) => {
                  if (arg) {
                    console.log('selectedChildren: ', arg);
                    this.selCMElArray = arg.selCMElArray;
                    this.selCMElArrayBorder = arg.selCMElArrayBorder;
                    this.selCMEoArray = arg.selCMEoArray;
                    this.selCME = arg.selarray;
                    this.selCMEo = undefined;
                    this.selectionGroup(this.selCMEoArray, this.selCMElArray);
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
    if (parameters && this.cmap) {
      // Catches Data from Element-Service
      this.electronService.ipcRenderer.send('loadCME', parameters);
      // console.log('getElements: ', Date.now());
      // this.elementService.cleanStore(parameters);
    }
  }

  // gets data from database/server
  public getAllElements() {
    if (this.cmap === false) {
      // Catches Data from Element-Service
      this.allCME = this.electronService.ipcRenderer.sendSync('getAllCME', '1');
      console.log(this.allCME.length);
    }
  }

  // gets CME from database/server by ID
  public getDBCMEbyId(id: number) {
    return this.electronService.ipcRenderer.sendSync('getCME', id);
  }

  // gets CME from database/server by title
  public getDBCMEbyTitle(title: string) {
    return this.electronService.ipcRenderer.sendSync('getCMETitle', title);
  }

  // depreciated remove at time
  public getPicture() {
    let arg = this.electronService.ipcRenderer.sendSync('getPicture', '1');
    console.log(arg);
    if (this.selCMEo) {
      let content = {
        cat: 'i',
        coor: {x: 0, y: 0},
        object: arg,
        info: 'png',
        width: 100,
        height: 100,
        correct: true
      };
      this.selCMEo.title = 'Bild';
      this.selCMEo.types = ['i', '0', '0'];
      this.selCMEo.cmobject.content.push(content);
      this.store.dispatch({type: 'ADD_SCMEO', payload: this.selCMEo });
      this.store.dispatch({type: 'UPDATE_CME', payload: this.newCME(this.selCMEo) });
    }
  }

  // makes picture background transparent
  public makeTrans(color0, tolerance0) {
    if (this.selCMEo) {
      if (this.selCMEo.cmobject.content.length > 0) {
        for (let key in this.selCMEo.cmobject.content) {
          if (this.selCMEo.cmobject.content[key]) {
            if (this.selCMEo.cmobject.content[key].object.indexOf('.png') !== -1
            || this.selCMEo.cmobject.content[key].object.indexOf('.PNG') !== -1) {
              let arg = {
                tolerance: tolerance0,
                color: color0,
                file: this.selCMEo.cmobject.content[key].object
              };
              let newpic = this.electronService.ipcRenderer.sendSync('makeTrans', arg);
              if (newpic.indexOf('.png') !== -1 || newpic.indexOf('.PNG') !== -1) {
                this.selCMEo.cmobject.content[key].object = newpic;
              } else {
                console.log('error: ', newpic);
              }
            }
          }
        }
        this.updateSelCMEo(this.selCMEo);
      }
    }
  }

  // Creates a new database entry
  public newDBCME(cme: CME) {
    if (cme) {
      // console.log('new id:', cme.id, Date.now());
      cme.state = '';
      if (cme.id >= 1) {
        this.maxID = cme.id;
        this.cmsettings.maxid = this.maxID;
        console.log(this.maxID);
        this.settingsService.changeSetting(this.cmsettings);
        this.electronService.ipcRenderer.send('newCME', cme);
      } else if (cme.id !== 0) {
        this.electronService.ipcRenderer.send('newCME', cme);
      }
    }
  }

  // changes CME in database
  public changeDBCME(dbcme: CME) {
    console.log('change id:', dbcme.id, Date.now());
    dbcme.state = '';
    this.counter++;
    if ((this.counter % 100) === 0) {
      console.log(this.counter, dbcme);
    }
    if (dbcme.id !== 0) {
      this.electronService.ipcRenderer.send('changeCME', dbcme);
    }
  }

  // delete CME in database
  public deleteDBCME(id: number) {
    // console.log('delete id:', id, Date.now());
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
                  payload: x[i].id
                };
                this.store.dispatch(action);
                console.log('del: ', x[i].id);
              } else if (((parameters.b + 1000) <= x[i].y0 || x[i].y0 <= (parameters.t - 1000)) &&
              ((parameters.b + 1000) <= x[i].y1 || x[i].y1 <= (parameters.t - 1000))) {
                let action = {
                  type: 'DEL_CME',
                  payload: x[i].id
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
      cmeo.prep = '';
      cmeo.prep1 = '';
      this.selCMEo = cmeo;
      // console.log('this.selCME0o: ', this.selCMEo);
      this.store.dispatch({type: 'ADD_SCMEO', payload: cmeo });
      let newCME = this.newCME(cmeo);
      // console.log('newCME : ', newCME);
      this.store.dispatch({type: 'UPDATE_CME', payload: newCME });
    }
  }

  // updates selected cmel and matching dbcme
  public updateSelCMEl(cmel: CMEl) {
    if (this.selCMEl) {
      // console.log('updateSelCMEl: ', cmel.id);
      cmel.prep = '';
      cmel.prep1 = '';
      this.selCMEl = cmel;
      this.store.dispatch({type: 'ADD_SCMEL', payload: cmel });
      if (this.cmsettings.mode !== 'marking') {
        let newCME = this.newCME(cmel);
        this.store.dispatch({type: 'UPDATE_CME', payload: newCME });
      }
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
      if (this.selCMEo) {
        if (this.selCMEo.id !== cme.id) {
          cme.state = '';
        }
      }
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
        this.store.dispatch({type: 'DEL_CME', payload: this.newCME(this.tempCMEo).id});
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
        this.store.dispatch({type: 'DEL_CME', payload: this.newCME(this.tempCMEl).id});
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

  // select array of elements
  public selectLinks(cme) {
    // console.log(cme);
    if (cme.cmobject.links) {
      let ids = [];
      let links = [];
      for (let key in cme.cmobject.links) {
        if (cme.cmobject.links[key]) {
          let link = cme.cmobject.links[key];
          if (link.start) {
            // console.log(link);
            if (ids.indexOf(link.id) === -1) {
              ids.push(link.id);
            }
            if (ids.indexOf(link.targetId) === -1) {
              ids.push(link.targetId);
            }
          } else if (this.selCMEo) {
            if (this.selCMEo.id === cme.id) {
              this.selCMElArrayBorder.push(link.id);
            }
          }
        }
      }
      // console.log(ids);
      this.cmelements
          .subscribe((data) => {
              for (let key in data) {
                if (data[key]) {
                  let idindex = ids.indexOf(data[key].id);
                  if (idindex !== -1) {
                    // console.log(data[key]);
                    ids.splice(idindex, 1);
                    links.push(data[key]);
                  }
                }
              }
            }).unsubscribe();
      // console.log(ids);
      if (ids.length > 0) {
        for (let id in ids) {
          if (ids[id]) {
            let link = this.getDBCMEbyId(ids[id]);
            if (link) {
              if (link !== undefined && link !== null) {
                this.store.dispatch({type: 'ADD_CME', payload: link });
                links.push(link);
              }
            }
          }
        }
      }
      return links;
    }
  }

  // select child nodes
  public selectChildren() {
    if (this.selCMEo) {
      this.clearAreaSelection();
      this.cmsettings.mode = 'selecting';
      this.settingsService.updateSettings(this.cmsettings);
      this.startPos = {
        x: this.selCMEo.coor.x,
        y: this.selCMEo.coor.y
      };
      this.electronService.ipcRenderer.send('findChildren', this.selCMEo);
    } else {
      alert('please select an element.');
    }
  }

  // selects all CME in area
  public areaSelection(x0: number, y0: number, x1: number, y1: number) {
    this.selCMEl = undefined;
    this.selCMEo = undefined;
    if (this.cmap) {
      this.clearAreaSelection();
      this.cmelements
          .subscribe((data) => {
              for (let key in data) {
                if (data[key]) {
                  // select elements within the selcted area
                  if (x0 < data[key].x0 && data[key].x0 < x1 && y0 < data[key].y0 && data[key].y0 < y1) {
                    if (data[key].id < 0) {
                      if (x0 < data[key].x1 && data[key].x1 < x1 && y0 < data[key].y1 && data[key].y1 < y1) {
                        if (this.selCMElArray.indexOf(data[key].id) === -1) {
                          this.selCMElArray.push(data[key].id);
                          this.selCME.push(data[key]);
                        }
                      } else {
                        if (this.selCMElArrayBorder.indexOf(data[key].id) === -1) {
                          this.selCMElArrayBorder.push(data[key].id);
                          this.selCME.push(data[key]);
                          this.startPos = {
                            x: data[key].x0,
                            y: data[key].y0
                          };
                        }
                      }
                    } else {
                      if (x0 < data[key].x1 && data[key].x1 < x1 && y0 < data[key].y1 && data[key].y1 < y1) {
                        if (this.selCMEoArray.indexOf(data[key].id) === -1) {
                          this.selCME.push(data[key]);
                          this.selCMEoArray.push(data[key].id);
                        }
                      }
                    }
                  } else if (x0 < data[key].x1 && data[key].x1 < x1 && y0 < data[key].y1 && data[key].y1 < y1) {
                    if (data[key].id < 0) {
                      if (this.selCMElArrayBorder.indexOf(data[key].id) === -1) {
                        this.selCME.push(data[key]);
                        this.selCMElArrayBorder.push(data[key].id);
                        this.startPos = {
                          x: data[key].x1,
                          y: data[key].y1
                        };
                      }
                    }
                  }
                }
              }
              console.log('CMEls: ', this.selCMElArrayBorder, this.selCMElArray, ', CMEos: ', this.selCMEoArray);
              this.selectionGroup(this.selCMEoArray, this.selCMElArray);
            }).unsubscribe();
    } else {
      x0 *= 100;
      x1 *= 100;
      y0 *= 100;
      y1 *= 100;
      // console.log(x0, x1, y0, y1);
      for (let key in this.allCME) {
        if (this.allCME[key]) {
          // select elements within the selcted area
          let data = this.allCME[key];
          if (x0 < data.x0 && data.x0 < x1 && y0 < data.y0 && data.y0 < y1) {
            if (data.id < 0) {
              if (x0 < data.x1 && data.x1 < x1 && y0 < data.y1 && data.y1 < y1) {
                if (this.selCMElArray.indexOf(data.id) === -1) {
                  this.selCMElArray.push(data.id);
                }
              } else {
                if (this.selCMElArrayBorder.indexOf(data.id) === -1) {
                  this.selCMElArrayBorder.push(data.id);
                  this.startPos = {
                    x: data.x0,
                    y: data.y0
                  };
                }
              }
            } else {
              if (x0 < data.x1 && data.x1 < x1 && y0 < data.y1 && data.y1 < y1) {
                if (this.selCMEoArray.indexOf(data.id) === -1) {
                  this.selCMEoArray.push(data.id);
                }
              }
            }
          } else if (x0 < data.x1 && data.x1 < x1 && y0 < data.y1 && data.y1 < y1) {
            if (data.id < 0) {
              if (this.selCMElArrayBorder.indexOf(data.id) === -1) {
                this.selCMElArrayBorder.push(data.id);
                this.startPos = {
                  x: data.x1,
                  y: data.y1
                };
              }
            }
          }
        }
      }
      console.log('CMEls: ', this.selCMElArrayBorder, this.selCMElArray, ', CMEos: ', this.selCMEoArray);
    }

  }

  // cleans area selection before a new one
  public clearAreaSelection() {
    this.selCME = [];
    this.selCMElArray = [];
    this.selCMEoArray = [];
    this.selCMElArrayBorder = [];
  }

  // sets selected CMEo or CMEl
  public setSelectedCME(id: number) {
    // console.log('setSelectedCME start:', id, Date.now());
    if (this.selCMEo && id > 0) {
      if (this.selCMEo.id !== id) {
        this.selCMEo.state = '';
        this.updateSelCMEo(this.selCMEo);
        // if a marker is the current selected element update settings
        if (this.selCMEo.types[0] === 'm') {
          this.cmsettings.cmtbmarking.types = this.selCMEo.types;
          this.cmsettings.cmtbmarking.prio = this.selCMEo.prio;
          this.cmsettings.cmtbmarking.trans = this.selCMEo.cmobject.style.object.trans;
          this.cmsettings.cmtbmarking.color0 = this.selCMEo.cmobject.style.object.color0;
          this.cmsettings.cmtbmarking.color1 = this.selCMEo.cmobject.style.object.color1;
          this.settingsService.updateSettings(this.cmsettings);
        }
        // this.changeDBCME(newCME);
      }
    }
    if (this.selCMEl && id < 0) {
      if (this.selCMEl.id !== id) {
        this.selCMEl.state = '';
        this.updateSelCMEl(this.selCMEl);
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
                  cme = this.CMEtoCMEol(data[key]);
                  if (id > 0) {
                    let selectioncondition = false;
                    if (this.cmsettings.mode === 'marking') {
                      if (cme.types[0] === 'm') {
                        selectioncondition = true;
                      } else {
                        this.markCMEo = cme;
                      }
                    } else if (this.cmsettings.mode === 'quiznew') {
                      if (cme.types[0] === 'q') {
                        selectioncondition = true;
                      } else {
                        this.quizCMEo = cme;
                      }
                    } else {
                      selectioncondition = true;
                    }
                    if (selectioncondition) {
                      if (this.cmsettings.mode === 'dragging') {
                        if (data[key].id < -1 || data[key].id >= 1) {
                          data[key].state = 'dragging';
                          cme.state = 'dragging';
                          data[key].prep = '';
                          data[key].prep1 = '';
                        }
                      } else if (this.cmsettings.mode === 'progress') {
                        if (data[key].id < -1 || data[key].id >= 1) {
                          data[key].state = 'typing';
                          cme.state = 'typing';
                        }
                      }
                      // checks if selected element is a marker and changes the mode accordingly
                      if (cme.types[0] === 'm') {
                        if (cme.cmobject.links.length > 0) {
                          let protomark = this.getDBCMEbyId(cme.cmobject.links[0].targetId);
                          if (protomark) {
                            this.markCMEo = this.CMEtoCMEol(protomark);
                            this.cmsettings.mode = 'marking';
                            this.settingsService.updateSettings(this.cmsettings);
                          }
                        }
                      } else if (cme.types[0] === 'q') {
                        if (cme.cmobject.links.length > 0) {
                          let protoquiz = this.getDBCMEbyId(cme.cmobject.links[0].targetId);
                          if (protoquiz && this.cmsettings.mode !== 'progress') {
                            this.markCMEo = this.CMEtoCMEol(protoquiz);
                            this.cmsettings.mode = 'quizedit';
                            this.settingsService.updateSettings(this.cmsettings);
                          }
                        }
                      }
                      this.startPos = {
                        x: cme.coor.x,
                        y: cme.coor.y
                      };
                      if (cme.cmobject.content.length > 0) {
                        this.cmsettings.contentPos = 0;
                        this.settingsService.updateSettings(this.cmsettings);
                      } else {
                        this.cmsettings.contentPos = -1;
                        this.settingsService.updateSettings(this.cmsettings);
                      }
                      this.store.dispatch({type: 'ADD_SCMEO', payload: cme });
                      this.store.dispatch({type: 'UPDATE_CME', payload: data[key] });
                      this.selCMEo = cme;
                    }
                  } else if (id < 0) {
                    // console.log('setSelCME: ', cme.id);
                    this.store.dispatch({type: 'ADD_SCMEL', payload: cme });
                    this.store.dispatch({type: 'UPDATE_CME', payload: data[key] });
                    this.selCMEl = cme;
                  } else {
                    // console.log('irregular CME!');
                  }
                  // console.log('setSelectedCME end:', data[key], Date.now());
                  id = 0;
                }
              }
            }
          },
          (error) => console.log(error),
         ).unsubscribe();
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
      if (typeof cme['cmobject'] === 'string') {
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
        if (cme !== null) {
          return cme;
        } else {
          return undefined;
        }
      }
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
      newElemObj.cat = oldcme.cat;
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
        weight: -1,
        con: 'e',
        start: false
      }];
      // handles placement of mnemo objects
      if (this.mPmnemo) {
        newElemObj.x0 = cmcoor.x - (this.mPsize * this.mPdx);
        newElemObj.y0 = cmcoor.y - (this.mPsize * this.mPdy);
        newElemObj.x1 = cmcoor.x + (this.mPsize * (1 - this.mPdx));
        newElemObj.y1 = cmcoor.y + (this.mPsize * (1 - this.mPdy));
        newElemObj.cmobject.style.object.str = '';
      }
      if (newElemObj.cat.length < 8 && oldcme.title !== '' &&
      oldcme.title !== ' ' && newElemObj.cat.indexOf(oldcme.title) === -1) {
        newElemObj.cat.push(oldcme.title);
      }
      let newCME = this.newCME(newElemObj);
      this.newDBCME(newCME);
      let action = {type: 'ADD_CME', payload: newCME };
      this.store.dispatch(action);
      oldcme.cmobject.links.push({
        id: 0,
        targetId: newElemObj.id,
        title: newElemObj.title,
        weight: -1,
        con: 'e',
        start: true
      });
      this.updateCMEol(oldcme);
      this.setSelectedCME(newElemObj.id);
      // console.log('old: ', oldcme, ' new: ', newElemObj);
      this.newCMEl(oldcme, newElemObj);
      // console.log('Object: ', action);
    }
  }

  // generates a new marking element
  public newCMMarking(x0: number, y0: number, x1: number, y1: number) {
    if (this.markCMEo && this.tempMarkCMEo) {
      console.log('newCMEo start: ', Date.now());
      let newElemObj: CMEo = new CMEo(); // maybe an error
      this.maxID++;
      newElemObj = JSON.parse(JSON.stringify(this.tempMarkCMEo));
      newElemObj.cmobject.links = undefined;
      newElemObj.id = this.maxID;
      newElemObj.prio = this.markCMEo.prio - 1;
      newElemObj.cat = this.markCMEo.cat;
      newElemObj.coor = {
        x: x0,
        y: y0
      };
      newElemObj.x0 = x0;
      newElemObj.y0 = y0;
      newElemObj.x1 = x1;
      newElemObj.y1 = y1;
      newElemObj.title = 'marking';
      newElemObj.state = '';
      newElemObj.cmobject.style.title.class_array.push('hidden');
      newElemObj.cmobject.links = [{
        id: 0,
        targetId: this.markCMEo.id,
        title: this.markCMEo.title,
        weight: -1,
        con: 'e',
        start: false
      }];
      if (newElemObj.cat.length < 8 && this.markCMEo.title !== '' &&
       this.markCMEo.title !== ' ' && newElemObj.cat.indexOf(this.markCMEo.title) === -1) {
        newElemObj.cat.push(this.markCMEo.title);
      }
      let newCME = this.newCME(newElemObj);
      this.newDBCME(newCME);
      let action = {type: 'ADD_CME', payload: newCME };
      this.store.dispatch(action);
      this.markCMEo.cmobject.links.push({
        id: 0,
        targetId: newElemObj.id,
        title: newElemObj.title,
        weight: -1,
        con: 'e',
        start: true
      });
      this.updateCMEol(this.markCMEo);
      this.setSelectedCME(newElemObj.id);
      console.log('marked Element: ', this.markCMEo, ' marking: ', newElemObj);
      // console.log('Object: ', action);
    }
  }

  // generates a new quiz element
  public newCMQuiz(x0: number, y0: number, x1: number, y1: number) {
    if (this.quizCMEo && this.tempQuizCMEo) {
      let newElemObj: CMEo = new CMEo(); // maybe an error
      this.maxID++;
      newElemObj = JSON.parse(JSON.stringify(this.tempQuizCMEo));
      newElemObj.cmobject.links = undefined;
      newElemObj.id = this.maxID;
      newElemObj.prio = this.quizCMEo.prio - 1;
      newElemObj.cat = this.quizCMEo.cat;
      newElemObj.coor = {
        x: x0,
        y: y0
      };
      newElemObj.x0 = x0;
      newElemObj.y0 = y0;
      newElemObj.x1 = x1;
      newElemObj.y1 = y1;
      newElemObj.title = '';
      newElemObj.state = 'typing';
      newElemObj.cmobject.links = [{
        id: 0,
        targetId: this.quizCMEo.id,
        title: this.quizCMEo.title,
        weight: -1,
        con: 'e',
        start: false
      }];
      if (newElemObj.cat.length < 8 && this.quizCMEo.title !== '' &&
      this.quizCMEo.title !== ' ' && newElemObj.cat.indexOf(this.quizCMEo.title) === -1) {
        newElemObj.cat.push(this.quizCMEo.title);
      }
      let newCME = this.newCME(newElemObj);
      this.newDBCME(newCME);
      let action = {type: 'ADD_CME', payload: newCME };
      this.store.dispatch(action);
      this.quizCMEo.cmobject.links.push({
        id: 0,
        targetId: newElemObj.id,
        title: newElemObj.title,
        weight: -1,
        con: 'e',
        start: true
      });
      console.log('quized Element: ', this.quizCMEo, ' quiz: ', newElemObj);
      this.updateSelCMEo(this.quizCMEo);
      this.cmsettings.mode = 'progress';
      this.settingsService.updateSettings(this.cmsettings);
      this.setSelectedCME(newElemObj.id);
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
                    let weight0 = -1;
                    let ccme = this.CMEtoCMEol(data[key]);
                    if (Math.abs(ccme.coor.x - this.selCMEo.coor.x) > 2000 || Math.abs(ccme.coor.y - this.selCMEo.coor.y) > 2000) {
                      for (let i in ccme.cmobject.links) {
                        if (ccme.cmobject.links[i]) {
                          if (!ccme.cmobject.links[i].start) {
                            weight0 = 0;
                            console.log('end found');
                          }
                        }
                      }
                    }
                    ccme.cmobject.links.push({
                      id: (-1) * parseInt(String(this.selCMEo.id) + String(ccme.id), 10),
                      targetId: this.selCMEo.id,
                      title: this.selCMEo.title,
                      weight: weight0,
                      con: 'e',
                      start: false
                    });
                    this.selCMEo.cmobject.links.push({
                      id: (-1) * parseInt(String(this.selCMEo.id) + String(ccme.id), 10),
                      targetId: ccme.id,
                      title: ccme.title,
                      weight: weight0,
                      con: 'e',
                      start: true
                    });
                    this.selCMEo.state = '';
                    this.updateSelCMEo(this.selCMEo);
                    // console.log('old: ', this.selCMEo, ' new: ', ccme);
                    this.newCMEl(this.selCMEo, ccme);
                    // console.log('Object: ', action);
                    this.setSelectedCME(ccme.id);
                  }
                }
              }
            },
            (error) => console.log(error),
           ).unsubscribe();
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
      // indicates an connector
      if (this.cmsettings.mode === 'connecting') {
        newElem.cmobject.str = 'connector';
      } else {
        newElem.cmobject.str = newElem.cmobject.str.replace('connector', '');
      }
      oldlink[oldcme.cmobject.links.length - 1].id = newElem.id;
      this.updateCMEol(oldcme);
      newcme.cmobject.links[newcme.cmobject.links.length - 1].id = newElem.id;
      this.updateSelCMEo(newcme);
      // console.log('functions: ', newElem.coor);
      let newCME = this.newCME(newElem);
      let action = {type: 'ADD_CME', payload: newCME };
      this.store.dispatch(action);
      this.newDBCME(newCME);
      if (this.cmsettings.mode === 'progress') {
        this.cmsettings.mode = 'typing';
        this.settingsService.updateSettings(this.cmsettings);
      }
      // changes everything back to normal after a mnemo object is placed
      if (this.mPmnemo) {
        if (this.tempCMEo0) {
          let tempo0str = JSON.stringify(this.tempCMEo0);
          this.tempCMEo = JSON.parse(tempo0str);
        }
        if (this.tempCMEl0) {
          let templ0str = JSON.stringify(this.tempCMEl0);
          this.tempCMEl = JSON.parse(templ0str);
        }
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
        this.mPmnemo = false;
      }
      this.setSelectedCME(newElem.id);
      // console.log('after dispatch: ', newElem.coor);
      console.log('old: ', oldcme, ' new: ', newcme, ' newLine: ', newElem);
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
        prio: this.selCMEo.prio - 1,
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
      if (newElem.x1 >= newElem.x0) {
        newElem.coor.x = newElem.x0;
      } else {
        newElem.coor.x = newElem.x1;
      }
      if (newElem.y1 >= newElem.y0) {
        newElem.coor.y = newElem.y0;
      } else {
        newElem.coor.y = newElem.y1;
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
      modx = width - 3;
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
  C----------- Positioning ---------------------------------------------------M
  M---------------------------------------------------------------------------C
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  ---------------------------------------------------------------------------*/

  // if dragging is activated set selected CMEo state to dragging
  public setmode() {
    if (this.cmsettings) {
      console.log(this.cmsettings.mode);
      if (this.cmsettings.mode === 'edit') {
        if (this.selCMEo) {
          if (this.selCMEo.types[0] === 'q') {
            this.cmsettings.mode = 'quizedit';
            this.settingsService.updateSettings(this.cmsettings);
          }
        }
      } else if (this.cmsettings.mode === 'dragging') {
        if (this.selCMEo) {
          // console.log(this.selCMEo);
          this.selCMEo.state = 'dragging';
          this.updateSelCMEo(this.selCMEo);
        } else if (this.selCMEoArray.length > 0) {
          this.selectionGroup(this.selCMEoArray, this.selCMElArray);
        }
      } else if (this.cmsettings.mode === 'minimap') {
        this.cmap = false;
        this.getAllElements();
        this.makeMiniCmap();
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.cmsettings.mode === 'cmap') {
        this.cmap = true;
        this.clearMiniCmap();
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.cmsettings.mode === 'marking') {
        if (this.selCMEo) {
          if (this.selCMEo.types[0] !== 'm') {
            this.selCMEo.state = '';
            this.markCMEo = JSON.parse(JSON.stringify(this.selCMEo));
            let newCME = this.newCME(this.selCMEo);
            this.store.dispatch({type: 'UPDATE_CME', payload: newCME });
          }
        }
        if (this.markCMEo) {
          console.log(this.selCMEo, this.tempCMEo);
          this.tempMarkCMEo = JSON.parse(JSON.stringify(this.tempCMEo));
          this.tempMarkCMEo.types = this.cmsettings.cmtbmarking.types;
          this.tempMarkCMEo.prio = this.cmsettings.cmtbmarking.prio;
          this.tempMarkCMEo.cmobject.style.object.trans = this.cmsettings.cmtbmarking.trans;
          this.tempMarkCMEo.cmobject.style.object.color0 = this.cmsettings.cmtbmarking.color0;
          this.tempMarkCMEo.cmobject.style.object.color1 = this.cmsettings.cmtbmarking.color1;
        } else {
          alert('Please select an Element to mark.');
          this.cmsettings.mode = 'edit';
          this.settingsService.updateSettings(this.cmsettings);
        }
      } else if (this.cmsettings.mode === 'quiznew') {
        if (this.selCMEo) {
          if (this.selCMEo.types[0] !== 'q') {
            this.selCMEo.state = '';
            this.quizCMEo = JSON.parse(JSON.stringify(this.selCMEo));
            let newCME = this.newCME(this.selCMEo);
            this.store.dispatch({type: 'UPDATE_CME', payload: newCME });
          }
        }
        if (this.quizCMEo && this.selCMEo) {
          console.log(this.selCMEo, this.tempCMEo);
          this.tempQuizCMEo = JSON.parse(JSON.stringify(this.tempCMEo));
          this.tempQuizCMEo.types = this.cmsettings.cmtbquizedit.types;
          this.tempQuizCMEo.prio = this.selCMEo.prio;
          this.tempQuizCMEo.cmobject.style.object.str = '1';
          this.tempQuizCMEo.cmobject.style.object.weight = this.cmsettings.cmtbquizedit.difficulty;
        } else {
          alert('Please select an Element to quiz about.');
          this.cmsettings.mode = 'edit';
          this.settingsService.updateSettings(this.cmsettings);
        }
        if (this.quizmode !== 'quiz') {
          this.quizmode = 'quiz';
        }
      } else if (this.cmsettings.mode === 'quizedit') {
        this.quizmode = 'quiz';
      } else if (this.cmsettings.mode === 'quizing') {
        // will initiate loading of due quizes
      } else if (this.cmsettings.mode === 'templateEdit') {
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
      } else {
        if (this.selCMEo) {
          if (this.selCMEo.state === 'dragging') {
            this.selCMEo.state = 'selected';
            this.updateSelCMEo(this.selCMEo);
          }
        }
      }
      if (this.cmsettings.mode !== 'selecting' && this.cmsettings.mode !== 'dragging') {
        this.clearselectionGroup();
      }
      if (this.cmsettings.mode !== 'marking') {
        this.markCMEo = undefined;
      }
      if (this.cmsettings.mode !== 'quiznew') {
        this.quizCMEo = undefined;
      }
      if (this.cmsettings.mode.indexOf('quiz') === -1 || this.cmsettings.mode === 'quizing') {
        this.quizmode = '';
      }
      if (this.cmsettings.mode !== 'draw_poly') {
        if (this.cmsettings.pointArray.length > 0) {
          this.cmsettings.pointArray = [];
          this.settingsService.updateSettings(this.cmsettings);
        }
      }
    }
  }

  // creates a miniature Cmap for all elements
  public makeMiniCmap() {
    if (this.allCME) {
      if (this.allCME.length > 0) {
        let len = this.allCME.length;
        let i = 0;
        let cmsvg = Snap('#cmsvg');
        let minigroup = cmsvg.select('#minicmap');
        let width = this.cmsettings.cmap.width / 100;
        let height = this.cmsettings.cmap.height / 100;
        let border = cmsvg.rect(0, 0, width, height).attr({
          fill: 'none',
          strokeWidth: 1,
          stroke: '#000000',
        });
        for (let j = 0; j < height; j += 10) {
          let newline = cmsvg.line(0, j, width, j).attr({
            stroke: '#000000',
            fill: 'none',
          });
          if ((j % 1000) === 0) {
            newline.attr({
              strokeWidth: 0.8,
              opacity: 0.8
            });
            console.log(newline);
          } else if ((j % 100) === 0) {
            newline.attr({
              strokeWidth: 0.6,
              opacity: 0.5
            });
          } else {
            newline.attr({
              strokeWidth: 0.5,
              opacity: 0.4
            });
          }
          minigroup.add(newline);
        }
        for (let j = 0; j < width; j += 10) {
          let newline = cmsvg.line(j, 0, j, height).attr({
            stroke: '#000000',
            fill: 'none',
          });
          if ((j % 1000) === 0) {
            newline.attr({
              strokeWidth: 0.8,
              opacity: 0.8
            });
            console.log(newline);
          } else if ((j % 100) === 0) {
            newline.attr({
              strokeWidth: 0.6,
              opacity: 0.5
            });
          } else {
            newline.attr({
              strokeWidth: 0.5,
              opacity: 0.4
            });
          }
          minigroup.add(newline);
        }
        minigroup.add(border);
        for (i = 0; i < len; i++) {
          if (this.allCME[i]) {
            if ((i % 1000) === 0) {
              console.log(i);
            }
            let obj = this.allCME[i];
            // console.log(color);

            if (obj.id >= 1) {
              if (obj.prio < 7 || (i % 10) === 0) {
                let x0 = obj.x0 / 100;
                let x1 = obj.x1 / 100;
                let y0 = obj.y0 / 100;
                let y1 = obj.y1 / 100;
                let pos = obj.cmobject.indexOf('color0');
                let color = obj.cmobject.slice((pos + 9), (pos + 16));
                let size = Math.ceil(Math.max((x1 - x0), (y1 - y0)));
                let rect = cmsvg.rect((obj.coor.x / 100), (obj.coor.y / 100), size, size);
                rect.attr({
                  stroke: 'none',
                  fill: color,
                });
                minigroup.add(rect);
              }
            } else if (obj.id <= -1) {
              let x0 = obj.x0 / 100;
              let x1 = obj.x1 / 100;
              let y0 = obj.y0 / 100;
              let y1 = obj.y1 / 100;
              if ((x1 - x0) > 5 || (y1 - y0) > 5) {
                let pos = obj.cmobject.indexOf('color0');
                let color = obj.cmobject.slice((pos + 9), (pos + 16));
                let path = 'M' + x0 + ' ' + y0 + 'L' + x1 + ' ' + y1;
                let p = cmsvg.path(path);
                p.attr({
                  stroke: color,
                  strokeWidth: 1,
                  fill: 'none',
                });
                minigroup.add(p);
              }
            }
          }
        }
      }
    }
  }

  // cleares the miniature Cmap
  public clearMiniCmap() {
    let minigroup = Snap('#cmsvg').select('#minicmap');
    if (minigroup) {
      minigroup.selectAll().remove();
    }
  }

  // cuts element or group and pastes it at choosen point

  // moves element by dragging differences
  public moveElement(x, y, keymove?) {
    // moves a single selected element
    if (this.selCMEo && (typeof x === 'number') && (typeof y === 'number')) {
      if (this.selCMEo.state === 'dragging' || this.selCMEo.state === 'cutting' || keymove) {
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
            console.log('move: ', link.id);
          }
        }
      } // moves elements on the minimap
    } else if ((typeof x === 'number') && (typeof y === 'number') && this.cmap === false) {
      if (this.allCME.length > 0) {
        this.counter = 0;
        let locCMEArray0 = this.selCMEoArray.concat(this.selCMElArray);
        let borderLinks0 = [];
        let dataArray = [];
        let len = this.allCME.length;
        x *= 100;
        y *= 100;
        console.log(x, y);
        let i;
        for (i = 0; i < len; i++) {
          if (this.allCME[i]) {
            let pos = locCMEArray0.indexOf(this.allCME[i].id);
            if (pos !== -1) {
              let cme = this.allCME[i];
              // console.log(cme);
              cme.coor.x += x;
              cme.coor.y += y;
              cme.x0 += x;
              cme.y0 += y;
              cme.x1 += x;
              cme.y1 += y;
              cme.prep = '';
              cme.prep1 = '';
              // data[key] = this.newCME(cme);
              locCMEArray0.splice(pos, 1);
              if (cme.id > 0) {
                cme = this.CMEtoCMEol(this.allCME[i]);
                for (let j in cme.cmobject.links) {
                  if (cme.cmobject.links[j]) {
                    let link = cme.cmobject.links[j];
                    if (this.selCMElArrayBorder.indexOf(link.id) !== -1) {
                      // console.log(cme);
                      borderLinks0.push(cme);
                    }
                  }
                }
                cme = this.newCME(cme);
              }
              dataArray.push(cme);
            }
          }
        }
        if (borderLinks0.length > 0) {
          this.counter = 0;
          for (let n in borderLinks0) {
            if (borderLinks0[n]) {
              for (let j in borderLinks0[n].cmobject.links) {
                if (borderLinks0[n].cmobject.links[j]) {
                  let link = borderLinks0[n].cmobject.links[j];
                  if (this.selCMElArrayBorder.indexOf(link.id) !== -1) {
                    let conxy = this.conectionCoor(borderLinks0[n], link);
                    this.changeLink(link.id, conxy[0], conxy[1], link.start);
                  }
                }
              }
            }
          }
        }
        this.store.dispatch({type: 'ADD_CME_FROM_DB', payload: dataArray });
      } // moves multiple elements
    } else if (this.selCMEoArray.length > 0 && this.selCMElArray.length > 0
       && (typeof x === 'number') && (typeof y === 'number') && this.cmap) {
      this.counter = 0;
      let locCMEArray = this.selCMEoArray.concat(this.selCMElArray);
      let borderLinks = [];
      if (this.selCME.length > 0) {
        for (let key in this.selCME) {
          if (this.selCME[key]) {
            // select elements within the selcted area
            if (this.selCME[key]['id']) {
              let pos = locCMEArray.indexOf(this.selCME[key].id);
              if (pos !== -1) {
                let cme;
                if (this.selCME[key].id > 0) {
                  cme = this.CMEtoCMEol(this.selCME[key]);
                } else {
                  cme = this.selCME[key];
                }
                // console.log(cme);
                cme.coor.x += x;
                cme.coor.y += y;
                cme.x0 += x;
                cme.y0 += y;
                cme.x1 += x;
                cme.y1 += y;
                cme.prep = '';
                cme.prep1 = '';
                // data[key] = this.newCME(cme);
                locCMEArray.splice(pos, 1);
                if (cme.id > 0) {
                  for (let i in cme.cmobject.links) {
                    if (cme.cmobject.links[i]) {
                      let link = cme.cmobject.links[i];
                      if (this.selCMElArrayBorder.indexOf(link.id) !== -1) {
                        // console.log(cme);
                        borderLinks.push(cme);
                      }
                    }
                  }
                  cme = this.newCME(cme);
                }
                let storeaction = {type: 'UPDATE_CME', payload: cme };
                this.store.dispatch(storeaction);
              }
            }
          }
        }
        if (borderLinks.length > 0) {
          for (let i in borderLinks) {
            if (borderLinks[i]) {
              for (let j in borderLinks[i].cmobject.links) {
                if (borderLinks[i].cmobject.links[j]) {
                  let link = borderLinks[i].cmobject.links[j];
                  if (this.selCMElArrayBorder.indexOf(link.id) !== -1) {
                    let conxy = this.conectionCoor(borderLinks[i], link);
                    this.changeLink(link.id, conxy[0], conxy[1], link.start);
                  }
                }
              }
            }
          }
          this.clearselectionGroup();
        }
      } else {
        alert('no Elements selected');
      }
    }
  }

  // changes link if object is moved
  public changeLink(id: number, x: number, y: number, start: boolean) {
    let changeData = (data) => {
      for (let key in data) {
        if (data[key]) {
          if (data[key].id === id) {
            console.log('changeData', id);
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
            // console.log('link: ', data[key].id);
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
    };
    if (this.cmap) {
      this.cmelements
          .subscribe((data) => {
              if (data) {
                changeData(data);
              }
            },
            (error) => console.log(error),
           ).unsubscribe();
    } else {
      changeData(this.allCME);
    }
  }

  // hide cutted element
  public hideCMEs() {
    let cmsvg = Snap('#cmsvg');
    if (this.selCMEo) {
      if (cmsvg.select('#g' + this.selCMEo.id)) {
        cmsvg.select('#g' + this.selCMEo.id).attr({opacity: 0});
      }
    } else if (this.selCMEoArray.length > 0 && this.selCMElArray.length > 0) {
      if (cmsvg.select('#cmeselection')) {
        cmsvg.select('#cmeselection').attr({opacity: 0});
      }
    } else {
      alert('Nothing selected to cut.');
      if (this.cmsettings.mode === 'cutting') {
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
      }
    }
  }

  // move after cutting
  public cutPaste(x: number, y: number) {
    if (this.startPos) {
      if (this.cmap === false) {
        this.startPos.x /= 100;
        this.startPos.y /= 100;
        console.log(this.startPos);
      }
      let xdif = x - this.startPos.x;
      let ydif = y - this.startPos.y;
      if (this.allCME.length > 0) {
        this.store.dispatch({
          type: 'ADD_CME',
          payload: this.allCME
        });
      }
      console.log(xdif, ydif);
      this.moveElement(xdif, ydif);
    }
  }

  // handles multiple selection as one group
  public selectionGroup(CMEoArray: number[], CMElArray: number[]) {
    let cmsvg = Snap('#cmsvg');
    let cmeselect = cmsvg.select('#cmeselection');
    let cmeselection = cmeselect.select('#cmeselectiongroup');
    if (cmeselection) {
      cmeselection.remove();
    }
    cmeselection = cmeselect.g({id: 'cmeselectiongroup'});
    if (CMEoArray.length === 1) {
      if (!this.selCMEo || this.selCMEo['id'] !== CMEoArray[0]) {
        this.setSelectedCME(CMEoArray[0]);
      }
    } else {
      let i = 0;
      let color = '';
      if (this.cmsettings.mode === 'dragging') {
        color = '#ff0000';
        try {
          for (i = 0; i < CMElArray.length; i++) {
            if (cmsvg.select('#g' + CMElArray[i])) {
              cmeselection.add(cmsvg.select('#g' + CMElArray[i]).clone());
            }
          }
        } catch (err) {
          console.log(err, CMElArray[i]);
        }
        try {
          for (i = 0; i < CMEoArray.length; i++) {
            if (cmsvg.select('#g' + CMEoArray[i])) {
              cmeselection.add(cmsvg.select('#g' + CMEoArray[i]).clone());
            }
          }
        } catch (err) {
          console.log(err, CMEoArray[i]);
        }
        let move = function(dx, dy) {
          this.attr({
                    transform: this.data('origTransform') +
                     (this.data('origTransform') ? 'T' : 't') + [dx, dy]
                  });
                };
        let start = function() {
            this.data('origTransform', this.transform().local );
          };
        let stop = function() {
            // console.log('finished dragging');
            document.getElementById('TPid').title = '0';
            // document.getElementById('TPy').title = this.cmgroup.attr('y');
          };
        cmeselection.drag(move, start, stop);
      } else {
        cmeselection.undrag();
        color = '#0000ff';
        try {
          for (i = 0; i < CMElArray.length; i++) {
            if (cmsvg.select('#g' + CMElArray[i])) {
              cmeselection.add(cmsvg.select('#g' + CMElArray[i]).clone());
            }
          }
        } catch (err) {
          console.log(err, CMElArray[i]);
        }
        try {
          for (i = 0; i < CMEoArray.length; i++) {
            if (cmsvg.select('#g' + CMEoArray[i])) {
              cmeselection.add(cmsvg.select('#g' + CMEoArray[i]).clone());
            }
          }
        } catch (err) {
          console.log(err, CMEoArray[i]);
        }
      }
      let BBox = cmeselection.getBBox();
      let marking = cmsvg.rect(BBox.x, BBox.y, (BBox.w), (BBox.h));
      marking.attr({
        fill: 'none',
        opacity: 0.5,
        strokeWidth: 5,
        id: 'cmeselectionmark',
        stroke: color
      });
      cmeselection.add(marking);
    }
  }

  // clears selection as one group
  public clearselectionGroup() {
    try {
      let cmeselection = Snap('#cmsvg').select('#cmeselection').select('#cmeselectiongroup');
      if (cmeselection) {
        cmeselection.remove();
      }
    } catch (err) {
      // console.log(err);
    }
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
    this.cmelements
        .subscribe((data) => {
            let cme = undefined;
            for (let key in data) {
              if (data[key]) {
                if (data[key].id === id) {
                  cme = this.CMEtoCMEol(data[key]);
                  id = 0;
                }
              }
            }
            if (cme === undefined) {
              cme = this.getDBCMEbyId(id);
            }
            if (cme) {
              if (start) {
                cme.cmobject.title0 = title;
              } else {
                cme.cmobject.title1 = title;
              }
              console.log(cme);
              this.updateCMEol(cme);
            }
          },
          (error) => console.log(error),
         ).unsubscribe();
  }

  // changes object link titles if title of object is changed
  public changeObjectTitle(id: number, title: string, linkid: number) {
    this.cmelements
        .subscribe((data) => {
          let cme = undefined;
          for (let key in data) {
            if (data[key]) {
              if (data[key].id === id) {
                cme = this.CMEtoCMEol(data[key]);
                id = 0;
              }
            }
          }
          if (cme === undefined) {
            cme = this.getDBCMEbyId(id);
          }
          if (cme) {
            for (let i in cme.cmobject.links) {
              if (cme.cmobject.links[i]) {
                if (cme.cmobject.links[i].id === linkid) {
                  cme.cmobject.links[i].title = title;
                }
              }
            }
          }
        },
        (error) => console.log(error),
         ).unsubscribe();
  }

  // inserts content
  public pasteContent() {
    if (this.selCMEo && this.cmsettings.copy) {
      if (this.cmsettings.copy.type === 'content') {
        try {
          let newcontent = JSON.parse(this.cmsettings.copy.strg);
          if (newcontent) {
            if (newcontent['info'] && newcontent['object']) {
              this.selCMEo.cmobject.content.push(newcontent);
              this.updateSelCMEo(this.selCMEo);
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  }

  // changes object link weight
  public changeLinkWeight(id: number, linkid: number, weight: number) {
    this.cmelements
        .subscribe((data) => {
            for (let key in data) {
              if (data[key]) {
                if (data[key].id === id) {
                  let cme = this.CMEtoCMEol(data[key]);
                  for (let i in cme.cmobject.links) {
                    if (cme.cmobject.links[i]) {
                      if (cme.cmobject.links[i].id === linkid) {
                        cme.cmobject.links[i].weight = weight;
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
         ).unsubscribe();
  }

  // adds content from a clicked object to the selected quiz
  public addQuizContent(id: number) {
    if (this.selCMEo) {
      if (this.selCMEo.types[0] === 'q') {
        this.cmelements
            .subscribe((data) => {
                for (let key in data) {
                  if (data[key]) {
                    if (data[key].id === id) {
                      let cme = this.CMEtoCMEol(data[key]);
                      console.info(cme);
                      if (cme.cmobject.content.length > 0) {
                        if (cme.cmobject.content.length === 1) {
                          this.selCMEo.cmobject.content.push(cme.cmobject.content[0]);
                        } else {
                          let joinedarray = cme.cmobject.content.concat(this.selCMEo.cmobject.content);
                          this.selCMEo.cmobject.content = joinedarray;
                        }
                      } else {
                        this.selCMEo.cmobject.content.push({
                          cat: 'title',
                          coor: {
                            x: 0,
                            y: 0
                          },
                          object: cme.title,
                          width: 100,
                          info: JSON.stringify(cme.cmobject.style.title),
                          height: 100,
                          correct: true
                        });
                      }
                      id = 0;
                      this.selCMEo.state = 'new';
                      this.updateSelCMEo(this.selCMEo);
                    }
                  }
                }
              },
              (error) => console.log(error),
             ).unsubscribe();
      }
    }
  }

  // adds content from a clicked object to the selected quiz
  public addLatexQuiz(id: number) {
    if (this.selCMEo) {
      if (this.selCMEo.types[0] === 'q') {
        if (this.selCMEo.cmobject.content.length === 0) {
          this.cmelements
              .subscribe((data) => {
                  for (let key in data) {
                    if (data[key]) {
                      if (data[key].id === id) {
                        let cme = this.CMEtoCMEol(data[key]);
                        console.info(cme);
                        if (cme.cmobject.content.length > 0) {
                          if (cme.cmobject.content.length === 1) {
                            if (cme.cmobject.content[0].cat === 'LateX') {
                              cme.cmobject.content[0].correct = true;
                              this.selCMEo.cmobject.content.push(cme.cmobject.content[0]);
                              let latexcompare = cme.cmobject.content[0].info;
                              this.selCMEo.cmobject.meta = [{
                                name: cme.title,
                                pos: '0',
                                type: 'LaTeXquiz',
                                path: latexcompare,
                                comment: 'LaTeX'
                              }];
                              this.selCMEo.state = 'new';
                            } else {
                              console.log('This function only allows LaTeX content to quiz.');
                            }
                          } else {
                            console.log('This function only allows a single LaTeX content to quiz.');
                          }
                        }
                        id = 0;
                        this.updateSelCMEo(this.selCMEo);
                      }
                    }
                  }
                },
                (error) => console.log(error),
               ).unsubscribe();
        } else {
          console.log('Only one LateX Quiz is allowed per object.');
        }
      }
    }
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
            if (this.selCMEo.types[0] === 'q') {
              if (action.value[0] !== 'q') {
                alert('A quiz element cannot be changed to another type of element!');
                break;
              }
              if (this.cmsettings) {
                this.cmsettings.cmtbquizedit.types[0] = action.value[0];
                this.cmsettings.cmtbquizedit.types[1] = action.value[1];
                this.cmsettings.cmtbquizedit.types[2] = action.value[2];
              }
            }
            if (this.selCMEo.types[0] === 'm') {
              if (action.value[0] !== 'm') {
                alert('A marker cannot be changed to another type of element!');
                break;
              }
            }
            this.selCMEo.types[0] = action.value[0];
            this.selCMEo.types[1] = action.value[1];
            this.selCMEo.types[2] = action.value[2];
            if (this.cmsettings.cngtemp) {
              if (action.value[0] === 'm') {
                if (action.value[1] === 't') {
                  this.tempCMEo.types[0] = 't';
                } else {
                  this.tempCMEo.types[0] = 'a';
                }
              } else {
                this.tempCMEo.types[0] = action.value[0];
              }
              this.tempCMEo.types[1] = action.value[1];
              this.tempCMEo.types[2] = action.value[2];
            }
          } else if (variable[0] === 'title') {
            this.cmsettings.mode = 'edit';
            this.settingsService.updateSettings(this.cmsettings);
            if (action.value === '') {
              this.delCME(this.selCMEo.id);
              break;
            } else {
              if (action.value.indexOf('$$') !== -1) {
                action.value = action.value.replace('$$', '');
                action.value = action.value.replace('$$', '');
                let content = {
                  cat: 'LateX',
                  coor: {
                    x: 0,
                    y: 0
                  },
                  object: action.value,
                  width: 100,
                  info: action.value,
                  height: 100,
                  correct: true
                };
                this.selCMEo.cmobject.content.push(content);
              } else {
                let catpos = this.selCMEo.cat.indexOf(this.selCMEo.title);
                if (catpos > -1) {
                  this.selCMEo.cat[catpos] = action.value;
                }
                this.selCMEo.title = action.value;
              }
              this.selCMEo.state = 'new';
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
            if (this.cmsettings.cngtemp) {
              this.tempCMEo[variable[0]] = action.value;
            }
          }
          break;
        case 2:
          this.selCMEo[variable[0]][variable[1]] = action.value;
          if (this.cmsettings.cngtemp) {
            this.tempCMEo[variable[0]][variable[1]] = action.value;
          }
          break;
        case 3:
          this.selCMEo[variable[0]][variable[1]][variable[2]] = action.value;
          if (this.cmsettings.cngtemp) {
            this.tempCMEo[variable[0]][variable[1]][variable[2]] = action.value;
          }
          break;
        case 4:
          this.selCMEo[variable[0]][variable[1]][variable[2]][variable[3]]
           = action.value;
           if (this.cmsettings.cngtemp) {
             this.tempCMEo[variable[0]][variable[1]][variable[2]][variable[3]]
              = action.value;
           }
          break;
        default:
          console.log('ERROR: changeCMEo(): no fitting property');
      }
      if (this.selCMEo) {
        console.log(this.selCMEo);
        this.selCMEo.prep = '';
        this.selCMEo.prep1 = '';
        this.updateSelCMEo(this.selCMEo);
        if (this.cmsettings.cngtemp) {
          this.setTempCMEo(this.tempCMEo);
        }
      }
    } else if (this.selCMEoArray.length !== 0) {
      this.clearselectionGroup();
      let variable = action.variable;
      let locCMEoArray = this.selCMEoArray.slice();
      let n = variable.length;
      this.cmelements
          .subscribe((data) => {
              for (let key in data) {
                if (data[key]) {
                  // select elements within the selcted area
                  let pos = locCMEoArray.indexOf(data[key].id);
                  if (pos !== -1) {
                    let cme = this.CMEtoCMEol(data[key]);
                    // console.log(cme);
                    switch (n) {
                      case 1:
                        if (variable[0] === 'types') {
                          cme.types[0] = action.value[0];
                          cme.types[1] = action.value[1];
                          cme.types[2] = action.value[2];
                        } else {
                          cme[variable[0]] = action.value;
                        }
                        break;
                      case 2:
                        cme[variable[0]][variable[1]] = action.value;
                        break;
                      case 3:
                        cme[variable[0]][variable[1]][variable[2]] = action.value;
                        break;
                      case 4:
                        cme[variable[0]][variable[1]][variable[2]][variable[3]]
                         = action.value;
                        break;
                      default:
                        console.log('ERROR: changeCMEo(): no fitting property');
                    }
                    cme.prep = '';
                    cme.prep1 = '';
                    // data[key] = this.newCME(cme);
                    locCMEoArray.splice(pos, 1);
                    let storeaction = {type: 'UPDATE_CME', payload: this.newCME(cme) };
                    this.store.dispatch(storeaction);
                  }
                }
              }
            }).unsubscribe();
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
            if (this.cmsettings.cngtemp) {
              this.tempCMEl.types[0] = action.value[0];
              this.tempCMEl.types[1] = action.value[1];
              this.tempCMEl.types[2] = action.value[2];
            }
          } else {
            this.selCMEl[variable[0]] = action.value;
            if (this.cmsettings.cngtemp) {
              this.tempCMEl[variable[0]] = action.value;
            }
          }
          break;
        case 2:
          this.selCMEl[variable[0]][variable[1]] = action.value;
          if (this.cmsettings.cngtemp) {
            this.tempCMEl[variable[0]][variable[1]] = action.value;
          }
          break;
        case 3:
          this.selCMEl[variable[0]][variable[1]][variable[2]] = action.value;
          if (this.cmsettings.cngtemp) {
            this.tempCMEl[variable[0]][variable[1]][variable[2]] = action.value;
          }
          break;
        case 4:
          this.selCMEl[variable[0]][variable[1]][variable[2]][variable[3]]
           = action.value;
          if (this.cmsettings.cngtemp) {
            this.tempCMEl[variable[0]][variable[1]][variable[2]][variable[3]]
             = action.value;
          }
          break;
        default:
          console.log('ERROR: changeCMEl(): no fitting property');
      }
      // console.log(this.selCMEl);
      this.selCMEl.prep = '';
      this.selCMEl.prep1 = '';
      this.updateSelCMEl(this.selCMEl);
      if (this.cmsettings.cngtemp) {
        this.setTempCMEl(this.tempCMEl);
      }
    } else if (this.selCMElArray.length !== 0) {
      this.clearselectionGroup();
      let variable = action.variable;
      let locCMElArray = this.selCMElArray.slice();
      let n = variable.length;
      this.cmelements
          .subscribe((data) => {
              for (let key in data) {
                if (data[key]) {
                  // select elements within the selcted area
                  let pos = locCMElArray.indexOf(data[key].id);
                  if (pos !== -1) {
                    let cme = this.CMEtoCMEol(data[key]);
                    // console.log(cme);
                    switch (n) {
                      case 1:
                        if (variable[0] === 'types') {
                          cme.types[0] = action.value[0];
                          cme.types[1] = action.value[1];
                          cme.types[2] = action.value[2];
                        } else {
                          cme[variable[0]] = action.value;
                        }
                        break;
                      case 2:
                        cme[variable[0]][variable[1]] = action.value;
                        break;
                      case 3:
                        cme[variable[0]][variable[1]][variable[2]] = action.value;
                        break;
                      case 4:
                        cme[variable[0]][variable[1]][variable[2]][variable[3]]
                         = action.value;
                        break;
                      default:
                        console.log('ERROR: changeCMEo(): no fitting property');
                    }
                    cme.prep = '';
                    cme.prep1 = '';
                    // data[key] = this.newCME(cme);
                    locCMElArray.splice(pos, 1);
                    let storeaction = {type: 'UPDATE_CME', payload: this.newCME(cme) };
                    this.store.dispatch(storeaction);
                  }
                }
              }
            }).unsubscribe();
    }
  }

  // creates beam component
  public makeBeam(coor, id) {
    if (this.selCMEo && coor.x && coor.y) {
      this.selCMEo.cmobject.style.object.num_array = [coor.x, coor.y];
      let newlink = {
        id: 0,
        targetId: id,
        title: 'beam',
        weight: 0,
        con: 'e',
        start: true
      };
      if (this.selCMEo.cmobject.style.object.class_array.indexOf('beam') === -1) {
        this.selCMEo.cmobject.style.object.class_array.push('beam');
        this.selCMEo.cmobject.links.push(newlink);
      } else {
        for (let key in this.selCMEo.cmobject.links) {
          if (this.selCMEo.cmobject.links[key]) {
            if (this.selCMEo.cmobject.links[key].title === 'beam') {
              this.selCMEo.cmobject.links[key] = newlink;
            }
          }
        }
      }
      this.updateSelCMEo(this.selCMEo);
    }

  }

  // deletes selected elements
  public delSel() {
    if (this.cmsettings.mode === 'selecting') {
      if (this.selCMEoArray.length > 0 && this.selCMElArray.length > 0) {
        let allIdArray = this.selCMEoArray.concat(this.selCMElArray);
        if (this.selCMElArrayBorder.length > 0) {
          for (let key in this.selCMElArrayBorder) {
            if (this.selCMElArrayBorder[key]) {
              this.setSelectedCME(this.selCMElArrayBorder[key]);
              this.delCME(this.selCMElArrayBorder[key]);
            }
          }
        }
        for (let key in allIdArray) {
          if (allIdArray[key]) {
            let action = {
              type: 'DEL_CME',
              payload: allIdArray[key]
            };
            this.store.dispatch(action);
            this.deleteDBCME(allIdArray[key]);
          }
        }
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
      }
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
          payload: this.selCMEl.id
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
          payload: this.selCMEo.id
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
                      payload: cme.id
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
        ).unsubscribe();
  }

  // deletes link from parent element
  public delLink(cmeid: number, linkid: number) {
    if (cmeid >= 1 && linkid < -1) {
      let data = this.getDBCMEbyId(cmeid);
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
        if (typeof pos === 'number') {
          cme.cmobject.links.splice(pos, 1);
          let newCME = this.newCME(cme);
          this.updateCME(newCME);
        }
      }
    }
  }

}
