import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

// Gets electron interface
// declare var electron: any;
// const ipc = electron.ipcRenderer;
// const elementController = electron.remote.require('./elementController');

// models and reducers
import { CMEStore } from '../models/CMEstore';
import { CMElement } from '../models/CMElement';
import { CMAction } from '../models/CMAction';
import { CMCoor } from '../models/CMCoor';
// import { SettingsService } from './settings.service';

@Injectable()
export class ElementService {
  cmelements: Observable<[CMElement]>;
  currentElement: any;

  constructor(private http: Http,
              private store: Store<CMEStore>) { }


  // gets data from database/server
  getElements(parameters) {
    // return this.cmelements = Observable.of()
    //           .map(() => elementController.load(parameters));
    let url = 'http://localhost:80/load?l=' + parameters.l + '&t=' + parameters.t + '&r=' + parameters.r + '&b=' + parameters.b + '&z=0';
    /*
    elementController.load(parameters)
      .subscribe(x => {
        for (let key in x) {
          if (x[key]) {
            console.log(x[key].id);
          }
        }
      });
      */
    return this.http.get(url)
         .map((response: Response) => response.json());
  }

  // sets current element
  setSelectedElement(cmelement: CMElement) {
    let action = {type: 'ADD_SCME', payload: cmelement };
    this.store.dispatch(action);
    this.currentElement = cmelement;
    console.log(cmelement.id);
  }

  // updates element
  updateElement(cmelement: CMElement) {
    let action = {type: 'UPDATE_CME', payload: cmelement };
    this.store.dispatch(action);
    console.log(cmelement.id);
  }

  // generates a new element
  newElement() {

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
      }
      // console.log(this.currentElement);
      let scmeaction = {type: 'ADD_SCME', payload: this.currentElement };
      this.store.dispatch(scmeaction);
      this.updateElement(this.currentElement);
    }
  };

}
