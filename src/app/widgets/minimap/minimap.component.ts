import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
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
export class MinimapComponent implements OnInit, OnDestroy {
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public cmSettings: CMSettings;
  public s: any;
  public svggroup: any;
  public draggroup: any;
  public selCMEo: any;
  public zoom = this.minimapService.zoom;
  public width = 5000;
  public height = 5000;
  public coorx: number;
  public coory: number;
  public selecting = this.minimapService.selecting;
  public selection = false;
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
                    if (arg.id) {
                      this.changeElement(arg);
                    }
                  }
                });
                this.electronService.ipcRenderer.on('changedSince', (event, arg) => {
                  if (arg) {
                    if (Array.isArray(arg)) {
                      for (let key in arg) {
                        if (arg[key]) {
                          this.changeElement(arg[key]);
                        }
                      }
                    }
                  }
                });
                this.electronService.ipcRenderer.on('deletedCME', (event, arg) => {
                  if (arg) {
                    this.deleteElement(arg);
                  }
                });
                this.electronService.ipcRenderer.on('selectedChildren', (event, arg) => {
                  if (arg) {
                    if (arg.minimap) {
                      this.groupMM(arg.selCMEoArray, arg.selCMElArray);
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
          if (this.cmSettings.mode === 'dragging') {
            this.moveMM();
          } else if (this.cmSettings.mode === 'selecting') {
            if (this.draggroup) {
              this.draggroup.undrag();
            }
          } else {
            if (this.draggroup) {
              console.log('draggroup destroyed ', this.cmSettings.mode);
              this.draggroup.undrag();
              let children = this.draggroup.children();
              children.forEach((ele) => {
                this.svggroup.add(ele);
              });
              this.draggroup.remove();
              let marking = this.svggroup.select('#mmselectionmark');
              if (marking) {
                marking.remove();
              }
              this.selection = false;
            }
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
    this.svggroup.append(Snap.parse(svgstring));
    this.electronService.ipcRenderer.send('getSince', this.cmSettings.minimapupdate);
    if (this.cmSettings.deletedcme.length > 0) {
      for (let key in this.cmSettings.deletedcme) {
        if (this.cmSettings.deletedcme[key]) {
          this.deleteElement({id: this.cmSettings.deletedcme[key]});
        }
      }
      this.cmSettings.deletedcme = [];
      this.minimapService.setSettings(this.cmSettings);
    }
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
      if (this.cmSettings.mode !== 'selecting' && !this.selection) {
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
        if (!this.selection) {
          this.minimapService.minimapSelection(e);
        }
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
      this.minimapService.zoom = 1;
      let emptyMatrix = new Snap.matrix();
      this.svggroup.transform(emptyMatrix);
    } else {
      this.minimapService.zoom += 0.1 * zm;
      this.zoom = this.minimapService.zoom;
      if (this.zoom === 0) {
        this.minimapService.zoom = 0.1;
      }
      this.svggroup.transform(Snap.matrix().scale(this.zoom));
      this.width = this.zoom * 5000;
      this.height = this.zoom * 5000;
    }
    this.setScrollPosition(this.coorx, this.coory);
  }

  // changes a existing svg element
  public changeElement(obj) {
    let delobj = JSON.parse(JSON.stringify(obj));
    this.deleteElement(delobj);
    this.newElement(obj);
  }

  // changes a existing svg element
  public deleteElement(obj) {
    let delement = undefined;
    if (obj.id >= 1) {
      if (obj.prio) {
        if (obj.prio < 4) {
          delement = this.svggroup.select('#mini' + obj.id.toString());
        } else {
          let point = this.svggroup.select('.id' + obj.id.toString());
          if (point) {
            point.removeClass('id' + obj.id.toString());
            if (point.node.classList.length > 0) {
              let newr = point.attr('r') * 0.9;
              point.attr({r: newr});
            } else {
              delement = point;
            }
          }
        }
      } else {
        delement = this.svggroup.select('#mini' + obj.id.toString());
      }
    } else if (obj.id <= -1) {
      delement = this.svggroup.select('#mini' + obj.id.toString());
    }
    if (delement) {
      delement.remove();
    }
  }

  // groups elements in selection
  public groupMM(cmeoarray, cmelarray) {
    this.draggroup = this.svggroup.g();
    for (let key in cmeoarray) {
      if (cmeoarray[key]) {
        let cmeo = cmeoarray[key];
        if (cmeo.prio < 4 && cmeo.types[0].indexOf('q') === -1) {
          let elem = this.svggroup.select('#mini' + cmeo.id.toString());
          if (elem) {
            this.draggroup.add(elem);
          }
        } else {
          let elem = this.svggroup.select('.id' + cmeo.id.toString());
          if (elem) {
            this.draggroup.add(elem);
          }
        }
      }
    }
    for (let key in cmelarray) {
      if (cmelarray[key]) {
        let elem = this.svggroup.select('#mini' + cmelarray[key].id.toString());
        if (elem) {
          this.draggroup.add(elem);
        }
      }
    }
    let BBox = this.draggroup.getBBox();
    let marking = this.s.rect(BBox.x, BBox.y, (BBox.w), (BBox.h));
    marking.attr({
      fill: 'none',
      opacity: 0.5,
      strokeWidth: 2,
      id: 'mmselectionmark',
      stroke: '#0000ff'
    });
    this.draggroup.add(marking);
    this.selection = true;
  }

  // move drag group
  public moveMM() {
    if (this.draggroup) {
      let move = function (dx, dy) {
        this.attr({
                  transform: this.data('origTransform') +
                   (this.data('origTransform') ? 'T' : 't') + [dx, dy]
                });
              };
      let start = function () {
          this.data('origTransform', this.transform().local );
        };
      let stop = function () {
          // console.log('finished dragging');
          document.getElementById('TPid').title = '0';
        };
      this.draggroup.drag(move, start, stop);
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
          point.addClass('id' + obj.id.toString());
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
          point.addClass('id' + obj.id.toString());
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

  // saves minimap when element is destroyed
  public ngOnDestroy() {
    let isvg = this.svggroup.innerSVG();
    isvg = isvg.replace(/ \\"/g, " '");
    isvg = isvg.replace(/\\",/g, "',");
    let mmsave = this.electronService.ipcRenderer.sendSync('saveMM', isvg);
    if (mmsave) {
      this.cmSettings.minimapupdate = Date.now();
      this.minimapService.setSettings(this.cmSettings);
    }
  }

}
