import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

// electron specific
declare var electron: any;
const elementController = electron.remote.require('./elementController');

import { SettingsService } from './settings.service';

// models and reducers
import { CMEStore } from '../models/CMEstore';
import { CMElement } from '../models/CMElement';
import { CMAction } from '../models/CMAction';
import { CMCoor } from '../models/CMCoor';
import { CMSettings } from '../models/CMSettings';
// import { SettingsService } from './settings.service';

@Injectable()
export class ElementService {
  cmelements: Observable<[CMElement]>;
  currentElement: CMElement;
  newElementObject: CMElement;
  newElementLine: CMElement;
  maxID: number;
  cmsettings: CMSettings;

  constructor(private http: Http,
              private settingsService: SettingsService,
              private store: Store<CMEStore>) {
                elementController.test('start')
                        .subscribe(id => {
                          if (id) {
                            console.log('ng2: ', id);
                          }
                        });
                this.settingsService.cmsettings
                    .subscribe(data => {
                      this.cmsettings = data;
                      // console.log(data);
                    });
              }

  // gets data from database/server
  getElements(parameters) {
    // Pro: gets data from electron
    /*
    return elementController.load(parameters);
    */
    // Dev: gets data from testserver
    // /*
    let url = 'http://localhost:80/load?l=' + parameters.l + '&t=' + parameters.t + '&r=' + parameters.r + '&b=' + parameters.b + '&z=0';
    return this.http.get(url)
         .map((response: Response) => response.json());
    // */
  }

  // gets data from database/server
  getMaxID() {
    // Pro: gets data from electron
    /*
    return elementController.findmax()
            .subscribe(id => {
              if (id) {
                this.maxID = id;
                console.log(this.maxID);
              }
            });
    */
    // Dev: gets data from testserver
    // /*
    let url = 'http://localhost:80/max';
    return this.http.get(url)
          .map((response: Response) => response.json())
          .subscribe(id => {
            if (id) {
              this.maxID = id;
              // console.log(this.maxID);
            }
          });
    // */
  }

  // sets current element
  setSelectedElement(id: number) {
    this.store.select('elements')
        .subscribe(data => {
            for (let key in data) {
              if (data[key]) {
                if (data[key].id === id) {
                  // let action = {type: 'ADD_SCME', payload: data[key] };
                  // his.store.dispatch(action);
                  this.currentElement = data[key];
                  id = 0;
                  // console.log(this.currentElement, '!');
                }
              }
            }
          },
          error => console.log(error),
         );
  }

  // updates element
  updateElement(cmelement: CMElement) {
    let action = {type: 'UPDATE_CME', payload: cmelement };
    this.store.dispatch(action);
  }

  // updates element in database
  updateDBElement(cmelement: CMElement) {
    // Pro: gets data from electron
    /*
    return elementController.change()
            .subscribe(cme => {
              if (cme) {
                console.log(cme);
              }
            });
    */
    // Dev: gets data from testserver
    // /*
    let url = 'http://localhost:80/change';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify( cmelement );
    this.http.post(url, body, options)
      .subscribe(res => console.log(res));
    // console.log(cmelement.id);
    // */
  }

  // generates a new element
  newElementObj(oldcme: CMElement, cmcoor: CMCoor) {
    if (this.currentElement) {
      let newElemObj: CMElement = new CMElement;
      newElemObj = this.assignElement(this.newElementObject);
      // console.log(newElem);
      this.cmsettings.mode = 'progress';
      this.settingsService.updateSettings(this.cmsettings);
      newElemObj.id = this.maxID++;
      newElemObj.prio = oldcme.prio + 1;
      newElemObj.z_pos = 300 - newElemObj.prio;
      newElemObj.coor = cmcoor;
      newElemObj.x0 = cmcoor.x;
      newElemObj.y0 = cmcoor.y;
      newElemObj.x1 = cmcoor.x + 50;
      newElemObj.y1 = cmcoor.y + 20;
      newElemObj.title = '';
      newElemObj.active = true;
      newElemObj.cmobject.links = [{
        id: 0,
        target_id: oldcme.id,
        title: oldcme.title,
        peer_coor: oldcme.coor,
        weight: -1,
        con: 'e',
        link_coor: {x: -1, y: -1},
        start: false
      }];
      // this.currentElement = this.assignElement(newElemObj);
      // console.log(newElem);
      let action = {type: 'ADD_CME', payload: newElemObj };
      this.store.dispatch(action);
      oldcme.cmobject.links.push({
        id: 0,
        target_id: newElemObj.id,
        title: newElemObj.title,
        peer_coor: cmcoor,
        weight: -1,
        con: 'e',
        link_coor: {x: -1, y: -1},
        start: true
      });
      this.updateElement(oldcme);
      // console.log('old: ', oldcme, ' new: ', newElemObj);
      this.newElementLin(oldcme, newElemObj);
      // console.log('Object: ', action);
    }
  }

  // generates a new element
  newElementLin(oldcme: CMElement, newcme: CMElement) {
    if (this.currentElement) {
      let oldlink = oldcme.cmobject.links;
      console.log(oldlink);
      let oldxy = this.conectionCoor(oldcme, oldlink[oldlink.length - 1]);
      let newlink = newcme.cmobject.links;
      console.log(newlink);
      let newxy = this.conectionCoor(newcme, newlink[0]);
      let newElem: CMElement = {
        id: (-1) * parseInt(String(oldcme.id) + String(newcme.id), 10),
        prio: oldcme.prio + 1,
        z_pos: 100 - (oldcme.prio + 1),
        x0: parseInt(oldxy[0], 10),
        y0: parseInt(oldxy[1], 10),
        x1: parseInt(newxy[0], 10),
        y1: parseInt(newxy[1], 10),
        title: String(oldcme.id) + '-' + String(newcme.id),
        type: this.newElementLine.type,
        coor: {x: 0, y: 0},
        cat: this.newElementLine.cat,
        dragging: false,
        active: false,
        cmline: this.newElementLine.cmline,
        cmobject: this.newElementLine.cmobject,
        prep: ''
      };
      // console.log('before: ', newElem.coor);
      if (newElem.x1 >= newElem.x0) {
            newElem.coor.x = newElem.x0;
            // console.log('x1>=x0: ', newElem.coor);
          } else {
            newElem.coor.x = newElem.x1;
            // console.log('x1<=x0: ', newElem.coor);
          };
          if (newElem.y1 >= newElem.y0) {
            newElem.coor.y = newElem.y0;
            // console.log('y1>=y0: ', newElem.coor);
          } else {
            newElem.coor.y = newElem.y1;
            // console.log('y1<=y0: ', newElem.coor);
          };
      // console.log('after: ', newElem.coor);
      oldlink[oldcme.cmobject.links.length - 1].id = newElem.id;
      oldlink[oldcme.cmobject.links.length - 1].link_coor = newElem.coor;
      this.updateElement(oldcme);
      newlink[0].id = newElem.id;
      newlink[0].link_coor = newElem.coor;
      this.updateElement(newcme);
      // console.log('functions: ', newElem.coor);
      let action = {type: 'ADD_CME', payload: newElem };
      this.store.dispatch(action);
      // console.log('after dispatch: ', newElem.coor);
      // console.log('old: ', oldcme, ' new: ', newcme, ' newLine: ', newElem);
      // console.log('Line: ', action);
    }
  }
  // Assignes values to a new Element
  assignElement(oldcme: CMElement) {
    let newcme: CMElement = {
      id: oldcme.id,
      x0: oldcme.x0,
      y0: oldcme.y0,
      x1: oldcme.x1,
      y1: oldcme.y1,
      prio: oldcme.prio,
      title: oldcme.title,
      type: oldcme.type,
      coor: oldcme.coor,
      cat: oldcme.cat,
      z_pos: oldcme.z_pos,
      dragging: false,
      active: false,
      cmline: oldcme.cmline,
      cmobject: oldcme.cmobject,
      prep: oldcme.prep
    };
    return newcme;
  }

  // Set Element as active
  setActive(id: number) {
    let action = {type: 'ACTIVATE_CME', payload: {id: id} };
    this.store.dispatch(action);
  }
  // Set Element as inactive
  setInactive(id: number) {
    let action = {type: 'DEACTIVATE_CME', payload: {id: id} };
    this.store.dispatch(action);
    if (this.cmsettings.mode === 'progress') {
      this.cmsettings.mode = 'new';
      this.settingsService.updateSettings(this.cmsettings);
    }
  }

  // Set Element as draggable
  setDrag(id: number) {
    let action = {type: 'DRAG_CME', payload: {id: id} };
    this.store.dispatch(action);
  }
  // Set Element as not draggable
  setNoDrag(id: number) {
    let action = {type: 'NODRAG_CME', payload: {id: id} };
    this.store.dispatch(action);
  }
  // changes element with input in form of CMAction
  changeElement(action: CMAction) {
    // console.log(action);
    // console.log(this.currentElement);
    if (this.currentElement) {
      let n = action.var.length;
      switch (n) {
        case 1:
          this.currentElement[action.var[0]] = action.value;
          break;
        case 2:
          this.currentElement[action.var[0]][action.var[1]] = action.value;
          break;
        case 3:
          this.currentElement[action.var[0]][action.var[1]][action.var[2]] = action.value;
          break;
        case 4:
          this.currentElement[action.var[0]][action.var[1]][action.var[2]][action.var[3]] = action.value;
          break;
        default:
          console.log('ERROR: changeElement(): no fitting property');
      }
      // console.log(this.currentElement);
      let scmeaction = {type: 'ADD_SCME', payload: this.currentElement };
      this.store.dispatch(scmeaction);
      this.updateElement(this.currentElement);
    }
  }
  // generates connection coordinates
  conectionCoor(cmelement, link) {
    let width = cmelement.x1 - cmelement.x0;
    let height = cmelement.y1 - cmelement.y0;
    switch (link.con) {
      case 'a':
        return [cmelement.coor.x, cmelement.coor.y];
      case 'ab':
        return [(cmelement.coor.x + Math.round(width / 2 )), cmelement.coor.y];
      case 'b':
        return [(cmelement.coor.x + width), cmelement.coor.y];
      case 'bc':
        return [(cmelement.coor.x + width), (cmelement.coor.y + Math.round(height / 2 ))];
      case 'c':
        return [(cmelement.coor.x + width), (cmelement.coor.y + height)];
      case 'cd':
        return [(cmelement.coor.x + Math.round(width / 2 )), (cmelement.coor.y + height)];
      case 'd':
        return [cmelement.coor.x, (cmelement.coor.y + height)];
      case 'da':
        return [cmelement.coor.x, (cmelement.coor.y + Math.round(height / 2 ))];
      case 'e':
        // console.log(cmelement.coor.x, width, cmelement.coor.y, height);
        return [(cmelement.coor.x + Math.round(width / 2 )), (cmelement.coor.y + Math.round(height / 2 ))];
      default:
        return [cmelement.coor.x, cmelement.coor.y];
    }
  }
  // gets templates from database
  getTemplates() {
    let url = 'http://localhost:80/temp_load';
    return this.http.get(url)
        .map((response: Response) => response.json())
        .subscribe( temp => {
            for (let key in temp) {
              // console.log(temp[key]);
              if (temp[key].id) {
                if (temp[key].type === 'l') {
                  // let action = {type: 'ADD_SCME', payload: data[key] };
                  // his.store.dispatch(action);
                  this.newElementLine = this.assignElement(temp[key]);
                  console.log(this.newElementLine);
                } else {
                  this.newElementObject = this.assignElement(temp[key]);
                  console.log(this.newElementObject);
                }
              }
            }
          },
          error => console.log(error),
         );
  }
  // reads templates from JSON-File and puts it to database
  setTemplates() {
    this.http.get('http://localhost:80/removetemplates')
        .map((response: Response) => response.json())
        .subscribe(action => {
          console.log(action);
        });
    let url = 'http://localhost:80/newtemplate';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get('./assets/config/templates.json')
        .map((response: Response) => response.json())
        .subscribe(
          data => {
            for (let key in data) {
              if (data[key]) {
                let body = JSON.stringify( data[key] );
                this.http.post(url, body, options)
                  .map((response: Response) => response.json())
                  .subscribe();
              }
            }
          },
          error => console.log(error),
         );
  }

}
