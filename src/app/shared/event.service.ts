import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { ElectronService } from 'ngx-electron';
import 'rxjs/add/observable/fromEvent';

// cognimap services
import { ElementService } from './element.service';
import { SettingsService } from './settings.service';
import { WindowService } from './window.service';
import { CMStore } from '../models/CMStore';
// import { CMCoor } from '../models/CMCoor';

import { CMAction } from '../models/CMAction';
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
  public clickX: number;
  public clickY: number;
  public startX: number;
  public startY: number;
  public dragX: number;
  public dragY: number;
  public id: number;
  public keyPressed: string[] = [];
  public selecting = false;
  public marking = false;
  public cmaction: CMAction = new CMAction();
  public prevSelCMEo: CMEo[] = [];
  public selCMEo: any;
  public selCMEoLinkPos = 0;
  public selCMEoTime: number;
  public selCMEl: any;
  public selCMElTime: number;
  public cmsettings: any;

  constructor(private windowService: WindowService,
              private settingsService: SettingsService,
              private electronService: ElectronService,
              private elementService: ElementService,
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
    || this.cmsettings.mode === 'marking' ) {
      this.startX = this.clickX;
      this.startY = this.clickY;
      this.dragX = 0;
      this.dragY = 0;
      if (this.cmsettings.mode === 'selecting') {
        if ((typeof parseInt(evt.target.title, 10) === 'number' && evt.target.title !== '')
        || evt.target.id === 'cmap'
        || evt.target.id === 'cmsvg') {
          this.elementService.clearAreaSelection();
          this.selecting = true;
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
        }
      });
  }

  // handles mouse up
  public onMouseUp(evt) {
    // used in edit mode to drag
    console.log('event.service: onMouseUp');
    if (this.cmsettings.mode === 'dragging') {
      this.dragX = evt.clientX  + this.windowService.WinXOffset - this.startX;
      this.dragY = evt.clientY + this.windowService.WinYOffset - this.startY;
      this.elementService.moveElement(this.dragX, this.dragY);
      // console.log(this.dragX, this.dragY);
    } else if (this.cmsettings.mode === 'selecting' || this.cmsettings.mode === 'marking') {
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

  // handles keydown events
  public onKeyDown(evt) {
    if (this.keyPressed.indexOf(evt.key) === -1) {
      this.keyPressed.push(evt.key);
    }
    if (this.keyPressed.indexOf('Delete') !== -1) {
      // deletes latest marked object
      if (this.cmsettings.mode === 'marking') {
        this.cmsettings.mode = 'edit';
        this.settingsService.updateSettings(this.cmsettings);
      }
      this.delCmd();
    }
    if (this.keyPressed.indexOf('Control') !== -1) {
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
      if (this.keyPressed.indexOf('n') !== -1) {
        if (this.cmsettings.mode === 'new') {
          this.cmsettings.mode = 'edit';
        } else {
          this.cmsettings.mode = 'new';
        }
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.keyPressed.indexOf('d') !== -1) {
        if (this.cmsettings.mode === 'dragging') {
          this.cmsettings.mode = 'edit';
        } else {
          this.cmsettings.mode = 'dragging';
        }
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.keyPressed.indexOf('m') !== -1) {
        if (this.cmsettings.mode === 'marking') {
          this.cmsettings.mode = 'edit';
        } else {
          this.cmsettings.mode = 'marking';
        }
        this.settingsService.updateSettings(this.cmsettings);
      } else if (this.keyPressed.indexOf('s') !== -1) {
        if (this.cmsettings.mode === 'selecting') {
          this.cmsettings.mode = 'edit';
        } else if (this.cmsettings.mode !== 'typing') {
          this.cmsettings.mode = 'selecting';
        }
        this.settingsService.updateSettings(this.cmsettings);
      }
      if (this.keyPressed.indexOf('v') !== -1) {
        if (['typing', 'new', 'edit'].indexOf(this.cmsettings.mode) !== -1) {
          let arg = this.electronService.ipcRenderer.sendSync('getClipboard', '1');
          if (this.selCMEo) {
            if (arg['type']) {
              if (['png', 'LateX', 'html', 'svg', 'jsme-svg'].indexOf(arg.type) !== -1) {
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
      // console.log(this.keyPressed);
    }
  }

  // handles keyup events
  public onKeyUp(evt) {
    if (this.keyPressed.indexOf(evt.key) !== -1) {
      this.keyPressed.splice(this.keyPressed.indexOf(evt.key), 1);
    }
    // console.log(this.keyPressed);
  }

}
