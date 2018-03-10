import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { ElectronService } from 'ngx-electron';
import 'rxjs/add/observable/fromEvent';

// cognimap services
import { ElementService } from './element.service';
import { TemplateService } from './template.service';
import { SettingsService } from './settings.service';
import { SnapsvgService } from './snapsvg.service';
import { WindowService } from './window.service';
import { CMStore } from '../models/CMStore';

import { CMButton } from '../models/CMButton';
import { CMAction } from '../models/CMAction';
import { CMCoor } from '../models/CMCoor';
import { CMEo } from '../models/CMEo';

@Injectable()
export class EventService {
  public MouseMove: Observable<any> = Observable.fromEvent(document, 'mousemove')
                                .map((event: MouseEvent) => {
                                  return {
                                    x: event.clientX + this.windowService.WinXOffset,
                                    y: event.clientY + this.windowService.WinYOffset
                                  };
                                });
  public KeyUp: Observable<any> = Observable.fromEvent(document, 'keyup');
  public clickX: number;
  public clickY: number;
  public startX: number;
  public startY: number;
  public dragX: number;
  public dragY: number;
  public id: number;
  public keyPressed: string[] = [];
  public selecting = false;
  public quizmaking = false;
  public marking = false;
  public cmaction: CMAction = new CMAction();
  public prevSelCMEo: CMEo[] = [];
  public selCMEo: any;
  public selCMEoLinkPos = 0;
  public selCMEoTime: number;
  public selCMEl: any;
  public selCMElTime: number;
  public cmsettings: any;
  public pointArray: CMCoor[] = [];
  public position: CMCoor;
  public buttons: Observable<CMButton[]>;
  public decoArray: string[] = ['none', 'line-through', 'underline'];

  constructor(private windowService: WindowService,
              private settingsService: SettingsService,
              private electronService: ElectronService,
              private elementService: ElementService,
              private snapsvgService: SnapsvgService,
              private templateService: TemplateService,
              private store: Store<CMStore>) {
                this.store.select('settings')
                .subscribe((data) => {
                  if (data) {
                    this.cmsettings = data;
                  }
                  // console.log('settings ', data);
                });
                this.store.select('selectedcmeo')
                .subscribe((data) => {
                  if (data ) {
                    if (data !== {}) {
                      this.selCMEoTime = Date.now();
                      this.selCMEoLinkPos = 0;
                      this.setSelCMEoLinkPos(0);
                      this.selCMEo = data;
                      this.position = undefined;
                    }
                  }
                  // console.log('settings ', data);
                });
                this.store.select('selectedcmel')
                .subscribe((data) => {
                  if (data ) {
                    if (data['cmobject']) {
                      this.selCMEl = data;
                    }
                  }
                  // console.log('settings ', data);
                });
                this.electronService.ipcRenderer.on('menuReceiver', (event, arg) => {
                  if (arg['type']) {
                    if (arg['payload']) {
                      switch (arg.type) {
                        case 'loadDB':
                          let res0 = this.electronService.ipcRenderer.sendSync('loadDb', arg.payload);
                          if (res0 === 'database loaded') {
                            this.elementService.getMaxID();
                            console.log(res0);
                          } else {
                            console.log(res0);
                          }
                          break;
                        case 'loadFile':
                          let res01 = this.electronService.ipcRenderer.sendSync('loadFile', arg.payload);
                          if (res01 !== 'please choose a file insite your /assets/!') {
                            console.log(res01);
                            this.processFile(res01);
                          }
                          break;
                        case 'saveDB':
                          if (/.*?json$/.test(arg.payload)) {
                            let res1 = this.electronService.ipcRenderer.sendSync('saveDb', arg.payload);
                            console.log(res1);
                          } else {
                            alert('Please name a .json file!');
                          }
                          break;
                        case 'deleteDB':
                          let conf = confirm('Do you want to delete the Database?');
                          if (conf) {
                            let res2 = this.electronService.ipcRenderer.sendSync('deleteDb', arg.payload);
                            console.log(res2);
                          } else {
                            console.log('Deleting database aborted');
                          }
                          break;
                        default:
                          console.log('default: ', arg.payload);
                      }
                    }
                  }
                });
              }

  // handles mouse click
  public onMouseClick(evt) {
    // executed if new elements should be created
    if (this.cmsettings.mode !== 'dragging') {
      // console.log('event.service: onMouseClick');
      this.clickX = evt.clientX + this.windowService.WinXOffset;
      this.clickY = evt.clientY + this.windowService.WinYOffset;
      if (this.cmsettings.mode === 'new') {
        // console.log(evt.target);
        if (parseInt(evt.target.title, 10) < 0 || evt.target.id === 'cmap'
         || evt.target.id === 'cmsvg') {
          let coor = {
            x: this.clickX,
            y: this.clickY
          };
          // console.log(coor);
          let oldcme = JSON.parse(JSON.stringify(this.elementService.selCMEo));
          this.elementService.newCMEo(oldcme, coor);
        } else if (parseInt(evt.target.title, 10) > 0) {
          this.elementService.setSelectedCME(parseInt(evt.target.title, 10));
        }
      } else if (this.cmsettings.mode === 'cutting') {
        if (parseInt(evt.target.title, 10) < 0 || evt.target.id === 'cmap'
          || evt.target.id === 'cmsvg') {
          if (this.elementService.selCMEo) {
            this.elementService.selCMEo.state = 'cutting';
            this.elementService.updateSelCMEo(this.elementService.selCMEo);
          }
          console.log(evt.target);
          this.elementService.cutPaste(this.clickX, this.clickY);
        }
        /*
        if (this.elementService.selCMEo) {
          this.cmsettings.mode = 'edit';
          this.settingsService.updateSettings(this.cmsettings);
        } else if (this.elementService.selCMEoArray.length > 0 && this.elementService.selCMElArray.length > 0) {
          this.cmsettings.mode = 'selecting';
          this.settingsService.updateSettings(this.cmsettings);
        }*/ // collects points for svg
      } else if (this.cmsettings.mode === 'draw_poly') {
        if (this.selCMEo) {
          if (this.selCMEo['cmobject']['style']['object']) {
            let color0 = this.selCMEo['cmobject']['style']['object'].color0;
            let color1 = this.selCMEo['cmobject']['style']['object'].color1;
            if (parseInt(evt.target.title, 10) < 0 || parseInt(evt.target.title, 10) > 0 ||
             evt.target.id === 'cmap' || evt.target.id === 'cmsvg') {
              let coor = {
                x: this.clickX,
                y: this.clickY
              };
              this.cmsettings.pointArray.push(coor);
              this.settingsService.updateSettings(this.cmsettings);
              console.log(this.cmsettings.pointArray[0].x, this.clickX, this.cmsettings.pointArray[0].y, this.clickY);
              this.snapsvgService.pointLine(this.cmsettings.pointArray, color0, color1);
            } else if (this.cmsettings.pointArray[0]) {
              if (this.clickX <= (this.cmsettings.pointArray[0].x + 3) && this.clickX >= (this.cmsettings.pointArray[0].x - 3) &&
              this.clickY <= (this.cmsettings.pointArray[0].y + 3) && this.clickY >= (this.cmsettings.pointArray[0].y - 3)) {
                let minX = Math.min.apply(Math,this.cmsettings.pointArray.map(function(o){return o.x;}));
                let minY = Math.min.apply(Math,this.cmsettings.pointArray.map(function(o){return o.y;}));
                for (let key in this.cmsettings.pointArray) {
                  if (this.cmsettings.pointArray[key]) {
                    this.cmsettings.pointArray[key].x = this.cmsettings.pointArray[key].x - minX;
                    this.cmsettings.pointArray[key].y = this.cmsettings.pointArray[key].y - minY;
                  }
                }
                this.selCMEo.cmobject.style.object.str = this.snapsvgService.closeLine(this.cmsettings.pointArray, color0, color1);
                this.selCMEo.cmobject.style.object.str += 'xdif:' + (minX - this.selCMEo.coor.x).toString() + 'ydif:' + (minY - this.selCMEo.coor.y).toString()
                this.selCMEo.types = ['s', 'p', 'b'];
                this.elementService.updateSelCMEo(this.selCMEo);
                this.cmsettings.pointArray = [];
                this.settingsService.updateSettings(this.cmsettings);
              }
            }
          }
        }
      }
    }
  }

  // handles mouse down
  public onMouseDown(evt) {
    // used in edit mode to drag
    // console.log('event.service: onMouseDown');
    this.clickX = evt.clientX + this.windowService.WinXOffset;
    this.clickY = evt.clientY + this.windowService.WinYOffset;
    if (this.cmsettings.mode === 'dragging' || this.cmsettings.mode === 'selecting'
    || this.cmsettings.mode === 'marking' || this.cmsettings.mode === 'quizmaking') {
      this.startX = this.clickX;
      this.startY = this.clickY;
      this.dragX = 0;
      this.dragY = 0;
      if (this.cmsettings.mode === 'selecting') {
        if ((typeof parseInt(evt.target.title, 10) === 'number' && evt.target.title !== '')
        || evt.target.id === 'cmap' || evt.target.id === 'cmsvg') {
          this.elementService.clearAreaSelection();
          this.selecting = true;
        }
      } else if (this.cmsettings.mode === 'quizmaking') {
        if ((typeof parseInt(evt.target.title, 10) === 'number' && evt.target.title !== '')
        || evt.target.id === 'cmap' || evt.target.id === 'cmsvg') {
          this.elementService.clearAreaSelection();
          this.quizmaking = true;
        }
      } else if (this.cmsettings.mode === 'marking') {
        if (typeof parseInt(evt.target.title, 10) === 'number' && evt.target.title !== '') {
          this.elementService.clearAreaSelection();
          this.marking = true;
        }
      }
    } else if (this.cmsettings.mode === 'pointing') {
      if ((typeof parseInt(evt.target.title, 10) === 'number' && evt.target.title !== '')
      || evt.target.id === 'cmap' || evt.target.id === 'cmsvg') {
          let coor = {
            x: this.clickX,
            y: this.clickY
          };
          /* amazing
          console.log(evt, evt.target.title, parseInt(evt.target.title, 10),
          typeof parseInt(evt.target.title, 10),
           (typeof parseInt(evt.target.title, 10) === 'number'));
           */
          this.elementService.newPointer(coor);
      }
    } else if (this.cmsettings.mode === 'beam') {
      if (typeof parseInt(evt.target.title, 10) === 'number' && evt.target.title !== '') {
          let coor = {
            x: this.clickX,
            y: this.clickY
          };
          this.elementService.makeBeam(coor, parseInt(evt.target.title, 10));
      }
    }
  }

  // handles mouse movement
  public onMouseMove() {
    return this.MouseMove;
  }

  // handles mouse movement differences;
  public mousedif() {
    return this.MouseMove
      .map((coor) => {
        if (this.cmsettings.mode === 'dragging') {
          let dif = {
            x: coor.x - this.dragX,
            y: coor.y - this.dragY
          };
          this.dragX = coor.x;
          this.dragY = coor.y;
          return dif;
        } else if (this.cmsettings.mode === 'selecting') {
          if (this.selecting) {
            return {
              left: Math.min(coor.x, this.startX),
              top: Math.min(coor.y, this.startY),
              width: Math.abs(coor.x - this.startX),
              height: Math.abs(coor.y - this.startY)
            };
          } else {
            return {
              display: 'none'
            };
          }
        } else if (this.cmsettings.mode === 'marking') {
          if (this.marking) {
            if (this.cmsettings) {
              return {
                'left': Math.min(coor.x, this.startX),
                'top': Math.min(coor.y, this.startY),
                'width': Math.abs(coor.x - this.startX),
                'height': Math.abs(coor.y - this.startY),
                'opacity': this.cmsettings.cmtbmarking.trans,
                'background-color': this.cmsettings.cmtbmarking.color0
              };
            }
          } else {
            return {
              display: 'none'
            };
          }
        } else if (this.cmsettings.mode === 'quizmaking') {
          if (this.quizmaking) {
            if (this.cmsettings) {
              return {
                'left': Math.min(coor.x, this.startX),
                'top': Math.min(coor.y, this.startY),
                'width': Math.abs(coor.x - this.startX),
                'height': Math.abs(coor.y - this.startY),
                'opacity': this.cmsettings.cmtbquizmaking.trans,
                'background-color': this.cmsettings.cmtbquizmaking.color0
              };
            }
          } else {
            return {
              display: 'none'
            };
          }
        }
      });
  }

  // handles mouse up
  public onMouseUp(evt) {
    // used in edit mode to drag
    // console.log('event.service: onMouseUp');
    if (this.cmsettings.mode === 'dragging') {
      this.dragX = evt.clientX  + this.windowService.WinXOffset - this.startX;
      this.dragY = evt.clientY + this.windowService.WinYOffset - this.startY;
      this.elementService.moveElement(this.dragX, this.dragY);
      // console.log(this.dragX, this.dragY);
    } else if (this.cmsettings.mode === 'selecting' || this.cmsettings.mode === 'marking' ||
                this.cmsettings.mode === 'quizmaking') {
      console.log(evt.target);
      if ((typeof parseInt(evt.target.title, 10) === 'number' && evt.target.title !== '')
      || evt.target.id === 'cmap' || evt.target.id === 'selection'
      || evt.target.id === 'cmsvg') {
        let x0 = Math.min((evt.clientX  + this.windowService.WinXOffset), this.startX);
        let y0 = Math.min((evt.clientY  + this.windowService.WinYOffset), this.startY);
        let x1 = x0 + Math.abs((evt.clientX  + this.windowService.WinXOffset) - this.startX);
        let y1 = y0 + Math.abs((evt.clientY  + this.windowService.WinYOffset) - this.startY);
        if (this.cmsettings.mode === 'selecting') {
          this.elementService.areaSelection(x0, y0, x1, y1);
          this.selecting = false;
        } else if (this.cmsettings.mode === 'marking') {
          this.elementService.newCMMarking(x0, y0, x1, y1);
          this.marking = false;
        } else if (this.cmsettings.mode === 'quizmaking') {
          this.elementService.newCMQuiz(x0, y0, x1, y1);
          this.quizmaking = false;
        }
      }
    }
  }

  // processes file input
  public processFile(dataURL) {
    if (this.selCMEo) {
      // identifies file type
      let type = dataURL.slice(dataURL.lastIndexOf('.') + 1).toLowerCase();
      // console.log(dataURL);
      let content = {
        cat: 'r',
        coor: {
          x: 0,
          y: 0
        },
        object: dataURL,
        width: 100,
        info: type,
        height: 100
      };
      switch (type) {
        case 'png':
        case 'jpg':
        case 'gif':
          content.cat = 'i';
          this.selCMEo.types = ['i', '0', '0'];
          break;
        case 'mp4':
          content.cat = 'mp4';
          break;
        default:
          console.log('Filetype not supported!');
      }
      if (content.cat !== 'r') {
        this.selCMEo.cmobject.content.push(content);
        this.selCMEo.state = 'new';
        this.elementService.updateSelCMEo(this.selCMEo);
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
      }
    }
  }

  // checks what's the last changed selected element and returns its id
  public delCmd() {
    if (this.selCMEo) {
      if (this.selCMEl) {
        if (this.selCMEoTime && this.selCMElTime) {
          if (this.selCMEoTime >= this.selCMElTime) {
            if (this.selCMEo['id']) {
              this.elementService.delCME(this.selCMEo.id);
            }
          } else {
            if (this.selCMEl['id']) {
              this.elementService.delCME(this.selCMEl.id);
            }
          }
        } else {
          if (this.selCMEo['id']) {
            this.elementService.delCME(this.selCMEo.id);
          }
        }
      } else {
        if (this.selCMEo['id']) {
          this.elementService.delCME(this.selCMEo.id);
        }
      }
    } else if (this.selCMEl) {
      if (this.selCMEl['id']) {
        this.elementService.delCME(this.selCMEl.id);
      }
    }
  }

  // sets position of link pointer
  public setSelCMEoLinkPos(num: number) {
    if (this.selCMEo) {
      if (this.selCMEo['cmobject']) {
        // console.log('err?: ', this.selCMEo.cmobject, this.selCMEoLinkPos);
        switch (num) {
          case 1:
            if (this.selCMEoLinkPos >= (this.selCMEo.cmobject.links.length - 1)) {
              this.selCMEoLinkPos = 0;
              this.elementService.setSelectedCME(this.selCMEo.cmobject.links[0].id);
            } else {
              this.selCMEoLinkPos += 1;
              this.elementService.setSelectedCME(this.selCMEo.cmobject.links[this.selCMEoLinkPos].id);
            }
            break;
          case -1:
            if (this.selCMEoLinkPos === 0) {
              this.selCMEoLinkPos = (this.selCMEo.cmobject.links.length - 1);
              this.elementService.setSelectedCME(this.selCMEo.cmobject.links[this.selCMEoLinkPos].id);
            } else {
              this.selCMEoLinkPos -= 1;
              this.elementService.setSelectedCME(this.selCMEo.cmobject.links[this.selCMEoLinkPos].id);
            }
            break;
          default:
            this.selCMEoLinkPos = (this.selCMEo.cmobject.links.length - 1);
            this.elementService.setSelectedCME(this.selCMEo.cmobject.links[this.selCMEoLinkPos].id);
            break;
        }
      }
    }
  }

  // provides an observable for keydown events
  public keyUp() {
    return this.KeyUp
            .map((evt) => {
              if (this.cmsettings.mode === 'new') {
                if (this.position) {
                  let dif = {
                    x: this.position.x,
                    y: this.position.y
                  };
                  return dif;
                } else {
                  return {
                    display: 'none'
                  };
                }
              }
            });
  }

  // handles keydown events
  public onKeyDown(evt) {
    // console.log(evt.key);
    if (this.keyPressed.indexOf(evt.key) === -1) {
      this.keyPressed.push(evt.key);
    }
    if (this.keyPressed.indexOf('Control') !== -1) {
      // uses arrow keys to choose links and move through cognimap
      if (this.keyPressed.indexOf('f') === -1 && this.keyPressed.indexOf('o') === -1 &&
          this.keyPressed.indexOf('l') === -1) {
        if (this.keyPressed.indexOf('ArrowUp') !== -1) {
          this.setSelCMEoLinkPos(1);
        } else if (this.keyPressed.indexOf('ArrowDown') !== -1) {
          this.setSelCMEoLinkPos(-1);
        } else if (this.keyPressed.indexOf('ArrowRight') !== -1) {
          if (this.selCMEl) {
            if (this.selCMEo) {
              if (this.prevSelCMEo.length >= 50) {
                this.prevSelCMEo.shift();
                this.prevSelCMEo.push(this.selCMEo);
              } else {
                this.prevSelCMEo.push(this.selCMEo);
              }
              if (this.selCMEo.id === this.selCMEl.cmobject.id0) {
                window.scrollTo((this.selCMEl.x1 - (window.innerWidth / 2)),
                 (this.selCMEl.y1 - (window.innerHeight / 2)));
                this.elementService.setSelectedCME(this.selCMEl.cmobject.id1);
              } else {
                window.scrollTo((this.selCMEl.x0 - (window.innerWidth / 2)),
                 (this.selCMEl.y0 - (window.innerHeight / 2)));
                this.elementService.setSelectedCME(this.selCMEl.cmobject.id0);
              }
            }
          }
        } else if (this.keyPressed.indexOf('ArrowLeft') !== -1) {
          if (this.prevSelCMEo.length > 0) {
            let prevCMEo = this.prevSelCMEo.pop();
            this.elementService.setSelectedCME(prevCMEo.id);
            window.scrollTo((prevCMEo.x0 - (window.innerWidth / 2)),
             (prevCMEo.y0 - (window.innerHeight / 2)));
          }
        }
      } else if (this.keyPressed.indexOf('f') !== -1 && this.selCMEo) {
        // changes font properties of selected element
        if (this.keyPressed.indexOf('ArrowUp') !== -1) {
          this.selCMEo.cmobject.style.title.size += 1;
          this.elementService.updateSelCMEo(this.selCMEo);
        } else if (this.keyPressed.indexOf('ArrowDown') !== -1) {
          if (this.selCMEo.cmobject.style.title.size > 0) {
            this.selCMEo.cmobject.style.title.size -= 1;
            this.elementService.updateSelCMEo(this.selCMEo);
          }
        } else if (this.keyPressed.indexOf('ArrowRight') !== -1) {
          let decoNum = this.decoArray.indexOf(this.selCMEo.cmobject.style.title.deco);
          if (decoNum < this.decoArray.length) {
            this.selCMEo.cmobject.style.title.deco = this.decoArray[decoNum + 1];
          } else {
            this.selCMEo.cmobject.style.title.deco = this.decoArray[0];
          }
          this.elementService.updateSelCMEo(this.selCMEo);
        } else if (this.keyPressed.indexOf('ArrowLeft') !== -1) {
          let decoNum = this.decoArray.indexOf(this.selCMEo.cmobject.style.title.deco);
          if (decoNum > 0) {
            this.selCMEo.cmobject.style.title.deco = this.decoArray[decoNum - 1];
          } else {
            this.selCMEo.cmobject.style.title.deco = this.decoArray[this.decoArray.length];
          }
          this.elementService.updateSelCMEo(this.selCMEo);
        }
      } else if (this.keyPressed.indexOf('o') !== -1 && this.selCMEo) {
        // changes object properties of selected element
        if (this.keyPressed.indexOf('ArrowUp') !== -1) {
          this.selCMEo.prio += 1;
          this.elementService.updateSelCMEo(this.selCMEo);
        } else if (this.keyPressed.indexOf('ArrowDown') !== -1) {
          if (this.selCMEo.prio > 0) {
            this.selCMEo.prio -= 1;
            this.elementService.updateSelCMEo(this.selCMEo);
          }
        } else if (this.keyPressed.indexOf('ArrowRight') !== -1) {
          if (this.selCMEo.cmobject.style.object.trans < 1) {
            this.selCMEo.cmobject.style.object.trans += 0.1;
            this.elementService.updateSelCMEo(this.selCMEo);
          }
        } else if (this.keyPressed.indexOf('ArrowLeft') !== -1) {
          if (this.selCMEo.cmobject.style.object.trans > 0) {
            this.selCMEo.cmobject.style.object.trans -= 0.1;
            this.elementService.updateSelCMEo(this.selCMEo);
          }
        }
      } else if (this.keyPressed.indexOf('l') !== -1 && this.selCMEl) {
        // changes line properties of selected element
        if (this.keyPressed.indexOf('ArrowUp') !== -1) {
          this.selCMEl.cmobject.size0 += 1;
          this.elementService.updateSelCMEl(this.selCMEl);
        } else if (this.keyPressed.indexOf('ArrowDown') !== -1) {
          if (this.selCMEl.cmobject.size0 > 0) {
            this.selCMEl.cmobject.size0 -= 1;
            this.elementService.updateSelCMEl(this.selCMEl);
          }
        } else if (this.keyPressed.indexOf('ArrowRight') !== -1) {
          if (this.selCMEl.cmobject.trans < 1) {
            this.selCMEl.cmobject.trans += 0.1;
            this.elementService.updateSelCMEl(this.selCMEl);
          }
        } else if (this.keyPressed.indexOf('ArrowLeft') !== -1) {
          if (this.selCMEl.cmobject.trans > 0) {
            this.selCMEl.cmobject.trans -= 0.1;
            this.elementService.updateSelCMEl(this.selCMEl);
          }
        }
      }
      if (this.keyPressed.indexOf('n') !== -1) {
        // turns on new element mode
        if (this.cmsettings.mode === 'new') {
          this.cmsettings.mode = 'edit';
        } else {
          this.cmsettings.mode = 'new';
        }
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.keyPressed.indexOf('d') !== -1) {
        // turns on dragging mode
        if (this.cmsettings.mode === 'dragging') {
          this.cmsettings.mode = 'edit';
        } else {
          this.cmsettings.mode = 'dragging';
        }
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.keyPressed.indexOf('u') !== -1) {
        // sets selected element as template
        this.templateService.useSelectedCME();
      } else if (this.keyPressed.indexOf('m') !== -1) {
        // turns on marking mode
        if (this.cmsettings.mode === 'marking') {
          this.cmsettings.mode = 'edit';
        } else {
          this.cmsettings.mode = 'marking';
        }
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.keyPressed.indexOf('s') !== -1) {
        // turns on selection mode
        if (this.cmsettings.mode === 'selecting') {
          this.cmsettings.mode = 'edit';
        } else if (this.cmsettings.mode !== 'typing') {
          this.cmsettings.mode = 'selecting';
        }
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.keyPressed.indexOf('q') !== -1) {
        // turns on selection mode
        if (this.cmsettings.mode === 'quizmaking') {
          this.cmsettings.mode = 'edit';
        } else if (this.cmsettings.mode !== 'typing') {
          this.cmsettings.mode = 'quizmaking';
        }
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.keyPressed.indexOf('+') !== -1) {
        // turns on connecting mode
        if (this.cmsettings.mode === 'connecting') {
          this.cmsettings.mode = 'edit';
        } else if (this.cmsettings.mode !== 'typing') {
          this.cmsettings.mode = 'connecting';
        }
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.keyPressed.indexOf('x') !== -1) {
        // turns on cutting mode
        if (this.cmsettings.mode === 'cutting') {
          this.cmsettings.mode = 'edit';
        } else if (this.cmsettings.mode !== 'typing') {
          if (this.cmsettings.widget0 !== 'none' && this.cmsettings.widget1 !== 'none') {
            this.cmsettings.mode = 'cutting';
            this.elementService.hideCMEs();
          }
        }
        this.settingsService.updateSettings(this.cmsettings);
      } /* else if (this.keyPressed.indexOf('c') !== -1) {
        // turns on cutting mode
        if (this.cmsettings.mode === 'copying') {
          this.cmsettings.mode = 'edit';
        } else if (this.cmsettings.mode !== 'typing') {
          if (this.cmsettings.widget0 !== 'none' && this.cmsettings.widget1 !== 'none') {
            this.cmsettings.mode = 'copying';
          }
        }
        this.settingsService.updateSettings(this.cmsettings);
      } */
      if (this.keyPressed.indexOf('v') !== -1) {
        // pastes content from clipboard
        if (['typing', 'new', 'edit'].indexOf(this.cmsettings.mode) !== -1) {
          let arg = this.electronService.ipcRenderer.sendSync('getClipboard', '1');
          if (this.selCMEo) {
            if (arg['type']) {
              if (['png', 'LateX', 'svg', 'jsme-svg'].indexOf(arg.type) !== -1) {
                // console.log(arg);
                let content = {
                  cat: 'r',
                  coor: {
                    x: 0,
                    y: 0
                  },
                  object: arg.payload,
                  width: 100,
                  info: arg.info,
                  height: 100
                };
                if (arg.type === 'png') {
                  content.cat = 'i';
                  this.selCMEo.types = ['i', '0', '0'];
                } else {
                  content.cat = arg.type;
                }
                this.selCMEo.cmobject.content.push(content);
                this.selCMEo.state = 'new';
                this.elementService.updateSelCMEo(this.selCMEo);
              } else if (arg.type === 'text') {
                console.log('text: ', arg);
                // this.elementService.changeCMEo({variable: ['title'], value: arg.payload});
              } else {
                console.log(arg);
              }
            }
            this.cmsettings.mode = 'edit';
            this.settingsService.updateSettings(this.cmsettings);
          }
        }
      }
      // deleting function
      if (this.keyPressed.indexOf('Delete') !== -1) {
        // deletes latest marked object
        if (this.cmsettings.mode === 'marking') {
          this.cmsettings.mode = 'edit';
          this.settingsService.updateSettings(this.cmsettings);
        }
        if (this.cmsettings.mode === 'dragging' || this.cmsettings.mode === 'edit') {
          this.delCmd();
        } else if (this.cmsettings.mode === 'selecting') {
          if (this.elementService.selCMElArray.length > 0 && this.elementService.selCMEoArray.length > 0) {
            this.elementService.delSel();
          }
        }
      }
      return true;
      // console.log(this.keyPressed);
    } else if (this.keyPressed.indexOf('Shift') !== -1) {
      let dist = 10;
      let direct = false;
      if (this.keyPressed.indexOf('_') !== -1) {
        dist = 1;
      } else if (this.keyPressed.indexOf('*') !== -1) {
        dist = 100;
      }
      if (this.keyPressed.indexOf('_') !== -1) {
        direct = true;
      }
      if (this.cmsettings.mode === 'new') {
        if (this.selCMEo) {
          // positions new element
          if (this.keyPressed.indexOf('ArrowUp') !== -1) {
            if (this.position) {
              this.position.y -= dist;
            } else {
              if (direct) {
                this.position = {
                  x: this.selCMEo.coor.x,
                  y: this.selCMEo.coor.y - dist
                };
              } else {
                this.position = {
                  x: this.selCMEo.coor.x,
                  y: this.selCMEo.coor.y - (this.selCMEo.y1 - this.selCMEo.y0) * 2
                };
              }
            }
          } else if (this.keyPressed.indexOf('ArrowDown') !== -1) {
            if (this.position) {
              this.position.y += dist;
            } else {
              if (direct) {
                this.position = {
                  x: this.selCMEo.coor.x,
                  y: this.selCMEo.coor.y + dist
                };
              } else {
                this.position = {
                  x: this.selCMEo.coor.x,
                  y: this.selCMEo.coor.y + (this.selCMEo.y1 - this.selCMEo.y0) * 2
                };
              }
            }
          } else if (this.keyPressed.indexOf('ArrowRight') !== -1) {
            if (this.position) {
              this.position.x += dist;
            } else {
              if (direct) {
                this.position = {
                  x: this.selCMEo.coor.x + dist,
                  y: this.selCMEo.coor.y
                };
              } else {
                this.position = {
                  x: this.selCMEo.coor.x + (this.selCMEo.x1 - this.selCMEo.x0) * 2,
                  y: this.selCMEo.coor.y
                };
              }
            }
          } else if (this.keyPressed.indexOf('ArrowLeft') !== -1) {
            if (this.position) {
              this.position.x -= dist;
            } else {
              if (direct) {
                this.position = {
                  x: this.selCMEo.coor.x - dist,
                  y: this.selCMEo.coor.y
                };
              } else {
                this.position = {
                  x: this.selCMEo.coor.x - (this.selCMEo.x1 - this.selCMEo.x0) * 2,
                  y: this.selCMEo.coor.y
                };
              }
            }
          }
        }
      } else {
        if (this.selCMEo) {
          // moves selected element in direction of arrow by dist
          if (this.keyPressed.indexOf('ArrowUp') !== -1) {
            this.elementService.moveElement(0, (-1 * dist), true);
          } else if (this.keyPressed.indexOf('ArrowDown') !== -1) {
            this.elementService.moveElement(0, dist, true);
          } else if (this.keyPressed.indexOf('ArrowRight') !== -1) {
            this.elementService.moveElement(dist, 0, true);
          } else if (this.keyPressed.indexOf('ArrowLeft') !== -1) {
            this.elementService.moveElement((-1 * dist), 0, true);
          }
        }
      }
      return false;
    } else {
      return false;
    }
  }

  // handles keyup events
  public onKeyUp(evt) {
    if (this.keyPressed.indexOf('Enter') !== -1) {
      // creates new element at position
      if (this.cmsettings.mode === 'new') {
        if (this.position) {
          let oldcme = JSON.parse(JSON.stringify(this.selCMEo));
          this.elementService.newCMEo(oldcme, this.position);
          this.position = undefined;
        }
      }
    }
    if (this.keyPressed.indexOf(evt.key) !== -1) {
      this.keyPressed.splice(this.keyPressed.indexOf(evt.key), 1);
    }
    // console.log(this.keyPressed);
  }

}
