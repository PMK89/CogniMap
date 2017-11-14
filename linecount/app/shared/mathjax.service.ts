import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'ngx-electron';
import { CMStore } from '../models/CMStore';
import { CMSettings } from '../models/CMSettings';
// import { CMElement } from '../models/CMElement';

// const ipcRenderer = require('electron').ipcRenderer;

@Injectable()
export class MathJaxService {
  public cmsettings: Observable<CMSettings> = this.store.select('settings');

  constructor(private store: Store<CMStore>,
              private electronService: ElectronService) {

  }

  // makes SVG from MathJax string
  public getMjSVG(mjString: string) {
    // console.log('getColors');
    mjString = mjString.replace('$$', '').replace('$$', '');
    let arg = this.electronService.ipcRenderer.sendSync('makeMjSVG', mjString);
    // console.log(arg);
    return arg.svg;
  }

}
