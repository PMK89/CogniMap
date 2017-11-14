import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
declare var Snap: any;

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// services
import { SettingsService } from './settings.service';
import { ElementService } from './element.service';
import { CmosvgService } from './shapes/cmosvg.service';
import { CmlsvgService } from './shapes/cmlsvg.service';

// models and reducers
import { CMSettings } from '../models/CMSettings';
import { CMEo } from '../models/CMEo';
import { CMEl } from '../models/CMEl';
import { SBBox } from '../models/SBBox';

@Injectable()
export class SnapsvgService {
  public cmsvg: any;
  public cmsettings: CMSettings;

  constructor(private cmosvgService: CmosvgService,
              private settingsService: SettingsService,
              private elementService: ElementService,
              private cmlsvgService: CmlsvgService) {
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      if (data !== undefined) {
                        this.cmsettings = data;
                        // console.log(data);
                      }
                    });
              }

  // generates shape from prepared string or initiates new creation
  public makeShape(cme: any, bbox?: SBBox, cmg?: any) {
    if (typeof cme.cmobject === 'string') {
      cme = this.elementService.CMEtoCMEol(cme);
    }
    if (cme !== undefined && this.cmsettings !== undefined) {
      this.cmsvg = Snap('#cmsvg');
      if (this.cmsettings.mode === 'edit') {
        let id = cme.id.toString();
        if (cme.id < 1) {
          id = id.replace('.', '_');
        }
        let oldelem = this.cmsvg.select('#cms' + id);
        if (oldelem) {
          oldelem.remove();
          console.log('removed');
        }
      }
      if (cme.id > 0) {
        this.objectSvg(cme, bbox, cmg);
      } else if (cme.id < 0) {
        this.lineSvg(cme, cmg);
      } else {
        console.log('no matching element');
      }
    }
  }

  // called for object elements
  public objectSvg(cme: CMEo, bbox: SBBox, cmg: any) {
    // console.log(this.cmsvg);
    switch (cme.types[1]) {
      case 'r':
        this.cmosvgService.createRectangle(cme, bbox, cmg);
        break;
      case 'c':
        this.cmosvgService.createCircle(cme, bbox, cmg);
        break;
      case 'e':
        this.cmosvgService.createEllipse(cme, bbox, cmg);
        break;
      case 't':
        this.cmosvgService.createText(cme, bbox, cmg);
        break;
      default:
        this.cmosvgService.createTest(cme, bbox, cmg);
    }
  }

  // called for line elements
  public lineSvg(cme: CMEl, cmg: any) {

    switch (cme.types[1]) {
      case 'e':
        this.cmlsvgService.createEdge(cme, this.cmsvg, cmg);
        break;
      case 'c':
        this.cmlsvgService.createCurve(cme, this.cmsvg, cmg);
        break;
      case 's':
        this.cmlsvgService.createSCurve(cme, this.cmsvg, cmg);
        break;
      default:
        this.cmlsvgService.createLine(cme, this.cmsvg, cmg);
    }
  }
}
