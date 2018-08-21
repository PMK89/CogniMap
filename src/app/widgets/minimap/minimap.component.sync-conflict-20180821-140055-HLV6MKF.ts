import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'ngx-electron';
declare var Snap: any;
import { MetaService } from '../../shared/meta.service';
import { ElementService } from '../../shared/element.service';
// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { MinimapService } from './minimap.service';

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-minimap',
  templateUrl: './minimap.component.html',
  styleUrls: ['./minimap.component.scss']
})
export class MinimapComponent implements OnInit {
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public cmSettings: CMSettings;
  public s: any;
  public svggroup: any;
  public selCMEo: any;
  public zoom = this.minimapService.zoom;
  public width = 5000;
  public height = 5000;
  public coorx: number;
  public coory: number;
  public selecting = this.minimapService.selecting;
  public transMatrix = new Snap.Matrix();
  @ViewChild('minimap') public minimap: ElementRef;
  @ViewChild('minimapsvg') public minimapsvg: ElementRef;

  constructor(private store: Store<CMStore>,
              private electronService: ElectronService,
              private elementService: ElementService,
              private metaService: MetaService,
              private minimapService: MinimapService) {
                this.electronService.ipcRenderer.on('loadedMM', (event, arg) => {
                  this.makeSvgMinimap(arg);
                });
                this.electronService.ipcRenderer.on('changedCME', (event, arg) => {
                  if (arg) {
                    if (arg.length === 2) {
                      if (arg[0]) {
                        let chngobj = arg[0];
                        this.changeElement(chngobj, arg[1]);
                      }
                    }
                  }
                });
                this.electronService.ipcRenderer.on('deletedCME', (event, arg) => {
                  if (arg) {
                    if (arg.length === 2) {
                      if (arg[0]) {
                        let delobj = arg[0];
                        let others = true;
                        if (arg[1].length < 1) {
                          others = false;
                        }
                        this.deleteElement(delobj, others);
                      }
                    }
                  }
                });
              }

  public ngOnInit() {
    this.s = Snap('#minimapsvg');
    this.electronService.ipcRenderer.send('loadMM', '1');
    this.cmsettings.subscribe((data) => {
      if (data) {
        if (data['id']) {
          this.cmSettings = data;
          if (this.cmSettings.coor.x > -1 && this.cmSettings.coor.y > -1) {
            this.setScrollPosition(this.cmSettings.coor.x, this.cmSettings.coor.y);
          }
        }
      }
    });
    this.store.select('selectedcmeo')
    .subscribe((data) => {
      if (data ) {
        if (data !== {}) {
          if (data['id'] && data['coor'] && data['cmobject']) {
            this.selCMEo = data;
          }
        }
      }
      // console.log('settings ', data);
    });
  }

  // generates svg minimap
  public makeSvgMinimap(svgstring: string) {
    this.svggroup = this.s.group({id: 'svggroup'});
    let svgbg = this.svggroup.rect(0, 0, this.width, this.height);
    svgbg.attr({
      stroke: 'none',
      fill: '#ffffff'
    });
    this.svggroup.append(svgbg);
    this.svggroup.append(Snap.parse(svgstring));
    this.svggroup.mousedown( (e) => {
      if (e) {
        this.moveTo(e);
      }
    });
  }

  // set position of map
  public setScrollPosition(x0: number, y0: number) {
    this.coorx = x0;
    this.coory = y0;
    let x = (x0 / 100) * this.zoom - 250;
    let y = (y0 / 100) * this.zoom - 225;
    this.minimap.nativeElement.scrollTo(x, y);
  }

  // moves to an point on the map and transports objects there if selected
  public moveTo(e) {
    if (e) {
      if (this.cmSettings.mode !== 'selecting') {
        let eoffsetX = e.offsetX / this.zoom;
        let eoffsetY = e.offsetY / this.zoom;
        if (e.path) {
          if (e.path[0]) {
            if (e.path[0].localName === 'text') {
              eoffsetX = (parseFloat(e.path[0]['attributes']['x']['value']) - 8.5);
              eoffsetY = (parseFloat(e.path[0]['attributes']['y']['value']) - 5);
            }
          }
        }
        const x = eoffsetX * 100;
        const y = eoffsetY * 100;
        if (this.cmSettings.mode === 'dragging') {
          this.minimapService.moveTo(x, y);
        }
        window.scrollTo(x, y);
      } else {
        this.minimapService.minimapSelection(e);
      }
    }
  }

  // zooms in and out
  public zoomCntl(mode: string) {
    switch (mode) {
      case 'in':
        this.zoomFn(1);
        break;
      case 'out':
        this.zoomFn(-1);
        break;
      default:
        this.zoomFn(0);
        break;
    }
  }

  // zooms in and out
  public zoomFn(zm: number) {
    if (zm === 0) {
      this.zoom = 1;
      let emptyMatrix = new Snap.matrix();
      this.svggroup.transform(emptyMatrix);
    } else {
      this.zoom += 0.1 * zm;
      if (this.zoom === 0) {
        this.zoom = 0.1;
      }
      this.svggroup.transform(Snap.matrix().scale(this.zoom));
      this.width = this.zoom * 5000;
      this.height = this.zoom * 5000;
    }
    this.setScrollPosition(this.coorx, this.coory);
  }

  // changes a existing svg element
  public changeElement(obj, move) {
    let delobj = JSON.parse(JSON.stringify(obj));
    if (move) {
      // if an element is moved old values are given to the delete function
      delobj.x0 = move.x0;
      delobj.x1 = move.x1;
      delobj.y0 = move.y0;
      delobj.y1 = move.y1;
    }
    this.deleteElement(delobj, true);
    this.newElement(obj);
  }

  // changes a existing svg element
  public deleteElement(obj, others: boolean) {
    let delement = undefined;
    if (obj.id >= 1) {
      let x = 3 * Math.round((obj.x0 + obj.x1) / 600);
      let y = 3 * Math.round((obj.y0 + obj.y1) / 600);
      if (obj.prio < 4) {
        delement = this.svggroup.select('#mini' + obj.id.toString());
      } else {
        let pointid = 'mm' + x.toString() + y.toString();
        if (others) {
          let point = this.svggroup.select('#' + pointid);
          if (point) {
            let newr = point.attr('r') * 0.9;
            if (newr < 1) {
              delement = this.svggroup.select('#' + pointid);
            }
            point.attr({r: newr});
          }
        } else {
          delement = this.svggroup.select('#' + pointid);
        }
      }
    } else if (obj.id <= -1) {
      delement = this.svggroup.select('#mini' + obj.id.toString());
    }
    if (delement) {
      delement.remove();
    }
  }

  // generates a new svg element
  public newElement(obj) {
    if (obj.id >= 1) {
      let x = 3 * Math.round((obj.x0 + obj.x1) / 600);
      let y = 3 * Math.round((obj.y0 + obj.y1) / 600);
      let pos = obj.cmobject.indexOf('color0');
      let color = obj.cmobject.slice((pos + 9), (pos + 16));
      let txtfill = '#000000';
      if (color) {
        let luma = this.elementService.getLuma(color);
        if (luma > 225) {
          pos = obj.cmobject.indexOf('color1');
          color = obj.cmobject.slice((pos + 9), (pos + 16));
          luma = this.elementService.getLuma(color);
        }
        if (luma < 80) {
          txtfill = '#ffffff';
        }
      }
      if (obj.prio < 4 && obj.types[0].indexOf('q') === -1) {
        let title = this.s.text((obj.coor.x / 100), (obj.coor.y / 100), obj.title);
        title.attr({
          fontSize: (12 - (Math.pow(obj.prio, 2) / 2)) + 'px',
          fill: txtfill,
          fontFamily:
           "'Monotype Corsiva', 'Apple Chancery', 'ITC Zapf Chancery', 'URW Chancery L', cursive",
          title: obj.id
        });
        this.svggroup.add(title);
        let titlebbox = title.getBBox();
        let rect = this.s.rect(titlebbox.x, titlebbox.y, titlebbox.w, titlebbox.h);
        rect.attr({
          stroke: 'none',
          fill: color,
          title: obj.id
        });
        let elementgroup = this.svggroup.group(rect, title);
        elementgroup.attr({
          opacity: 0.7,
          id: 'mini' + obj.id
        });
        this.svggroup.add(elementgroup);
      } else {
        // increase size of closeby spots
        let pointid = 'mm' + x.toString() + y.toString();
        let point = this.svggroup.select('#' + pointid);
        if (point) {
          let newr = point.attr('r') * 1.1;
          if (newr > 3) {
            newr = 3;
          }
          point.attr({r: newr});
        } else {
          let r = 0.5 + (1 - ((obj.prio + 2) / 43));
          if (color === '#ffffff') {
            let pos1 = obj.cmobject.indexOf('color1');
            color = obj.cmobject.slice((pos1 + 9), (pos1 + 16));
          }
          point = this.s.circle(x, y, r);
          point.attr({
            id: pointid,
            fill: color,
            stroke: 'none'
          });
          this.svggroup.add(point);
        }
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
        let p = this.s.path(path);
        let strokeW = 3.2;
        if (obj.prio > 0) {
          strokeW = Math.max((3 / obj.prio), 0.5);
        }
        p.attr({
          stroke: color,
          strokeWidth: strokeW,
          fill: 'none',
          id: 'mini' + obj.id
        });
        this.svggroup.add(p);
      }
    }
  }

}
