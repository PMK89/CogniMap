import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
// import {Observable} from 'rxjs/Observable';
import { CMEStore } from '../models/cmestore';
import { CMSettings } from '../models/CMSettings';
import { CMColorbar } from '../models/CMColorbar';
// import { CMElement } from '../models/CMElement';


@Injectable()
export class SettingsService {

  constructor(private http: Http,
              private store: Store<CMEStore>) { }

  // reads data from JSON-File
  getSettings() {
    let url = 'http://localhost:80/loadsettings?id=1';
    return this.http.get(url)
        .map((response: Response) => response.json())
        .map(payload => ({ type: 'ADD_CMS_FROM_DB', payload }))
        .subscribe(action => {
          this.store.dispatch(action);
          // console.log(action);
        });
  }
  // reads buttons from Database
  getButtons() {
    let url = 'http://localhost:80/loadbuttons';
    return this.http.get(url)
        .map((response: Response) => response.json())
        .map(payload => ({ type: 'ADD_CMB_FROM_DB', payload }))
        .subscribe(action => {
          this.store.dispatch(action);
          // console.log(action);
        });
  }
  // reads colors from Database
  getColors() {
    let url = 'http://localhost:80/loadcolors';
    return this.http.get(url)
        .map((response: Response) => response.json())
        .map(payload => ({ type: 'ADD_CMC_FROM_DB', payload }))
        .subscribe(action => {
          this.store.dispatch(action);
          // console.log(action);
        });
  }
  // reads buttons from JSON-File and puts it to database
  setButtons() {
    this.http.get('http://localhost:80/removebuttons')
        .map((response: Response) => response.json())
        .subscribe(action => {
          console.log(action);
        });
    let url = 'http://localhost:80/newbutton';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get('./assets/config/buttons.json')
        .map((response: Response) => response.json())
        .subscribe(
          data => {
            for (let key in data) {
              if (data[key]) {
                let body = JSON.stringify( data[key] );
                this.http.post(url, body, options)
                  .subscribe(res => console.log(body));
              }
            }
          },
          error => console.log(error),
         );
  }
  // reads buttons from JSON-File and puts it to database
  setSettings() {
    this.http.get('http://localhost:80/removesettings')
        .map((response: Response) => response.json())
        .subscribe(action => {
          console.log(action);
        });
    let url = 'http://localhost:80/newsettings';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.get('./assets/config/settings.json')
        .map((response: Response) => response.json())
        .subscribe(
          data => {
            let body = JSON.stringify( data[0] );
            this.http.post(url, body, options)
              .subscribe(res => console.log(body));
          },
          error => console.log(error),
         );
  }
  // reads colors from JSON-File and puts it to database
  setColors() {
    this.http.get('http://localhost:80/removecolors')
        .map((response: Response) => response.json())
        .subscribe(action => {
          console.log(action);
        });
    let url = 'http://localhost:80/newcolor';
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get('./assets/config/colors.json')
        .map((response: Response) => response.json())
        .subscribe(
          data => {
            for (let key in data) {
              if (data[key]) {
                let body = JSON.stringify( data[key] );
                this.http.post(url, body, options)
                  .subscribe(res => console.log(body));
              }
            }
          },
          error => console.log(error),
         );
  }
  // posts changed settings
  changeSetting (Settings: CMSettings) {
    let body = JSON.stringify({ Settings });
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('http://localhost:80/changesettings', body, options);
  }
  // posts changed Color
  changeColors (Color: CMColorbar) {
    let body = JSON.stringify({ Color });
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('http://localhost:80/changecolor', body, options);
  }
}
