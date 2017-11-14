import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
import 'snapsvg';
declare var Snap: any;

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// services
import { SettingsService } from './settings.service';
import { CmosvgService } from './shapes/cmosvg.service';
import { CmlsvgService } from './shapes/cmlsvg.service';

// models and reducers
import { CMSettings } from '../models/CMSettings';
import { CMElement } from '../models/CMElement';

@Injectable()
export class SnapsvgService {
  cmsvg: any;
  width: number;
  height: number;
  cmsettings: CMSettings;

  constructor(private cmosvgService: CmosvgService,
              private settingsService: SettingsService,
              private cmlsvgService: CmlsvgService) {
                this.settingsService.cmsettings
                    .subscribe(data => {
                      this.cmsettings = data;
                      // console.log(data);
                    });
              }

  // generates shape from prepared string or initiates new creation
  makeShape(cme: CMElement) {
    this.width = cme.x1 - cme.x0;
    this.height = cme.y1 - cme.y0;
    this.cmsvg = Snap('#cmsvg');
    if (this.cmsettings.mode === 'edit') {
      let oldelem = this.cmsvg.select('#svg' + cme.id.toString());
      if (oldelem) {
        oldelem.remove();
        console.log('removed');
      }
    }
    if (cme.prep !== '' && cme.prep !== undefined) {
      console.log('prep');
      Snap.parse(cme.prep);
    } else {
      if (cme.id > 0) {
        let svgid = '#svg' + cme.id.toString();
        let test = Snap(svgid);
        console.log(test);
        this.objectSvg(cme);
      } else if (cme.id < 0) {
        this.lineSvg(cme);
      } else {
        console.log('no matching element');
      }
    }
  }

  // called for object elements
  objectSvg(cme: CMElement) {
    console.log(this.cmsvg);
    switch (cme.types[1]) {
      case 'r':
        this.cmosvgService.createRectangle(cme, this.cmsvg);
        break;
      case 'c':
        this.cmosvgService.createCircle(cme, this.cmsvg, this.width, this.height);
        break;
      default:
        // this.cmosvgService.createTest(cme);
    }
  }

  // called for line elements
  lineSvg(cme: CMElement) {
    switch (cme.types[1]) {
      case 'e':
        this.cmlsvgService.createEdge(cme, this.cmsvg);
        break;
      case 'c':
        this.cmlsvgService.createCurve(cme, this.cmsvg);
        break;
      default:
        this.cmlsvgService.createLine(cme, this.cmsvg);
    }
  }
}
