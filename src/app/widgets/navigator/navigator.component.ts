import { Component, OnInit,  } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'ngx-electron';
import { MetaService } from '../../shared/meta.service';
// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { NavigatorService } from './navigator.service';

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent implements OnInit {
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public cmSettings: CMSettings;
  public titlearray = [];
  public selCMEo: any;
  public cmearray = [[]];
  public state = 'treeview';
  public contentPos = 0;
  public metaPos = 0;
  public linkPos = 0;
  public position = this.navigatorService.position;
  public extTypeArray: string[] = ['pdf', 'link', 'videos', 'audio', 'txt'];
  public extType: string = this.extTypeArray[0];
  public metaMode = '';
  public currentMetaArray = [];
  public metaFiles = {
    pdf: [],
    txt: [],
    videos: []
  };

  constructor(private store: Store<CMStore>,
              private electronService: ElectronService,
              private metaService: MetaService,
              private navigatorService: NavigatorService) { }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        if (data['id']) {
          this.cmSettings = data;
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
    // listens on electron ipc
    /*
    ipc.on('snap-out', function (event, arg) {
      console.log(arg);
    });
    */
    let cm = this.navigatorService.findID(1);
    if (cm) {
      this.cmearray[0] = cm;
      this.getLinkedCME(cm[0], 1);
    }
  }

  // changes state of component
  public changeState(state: string) {
    this.state = state;
  }

  // opens a pdf on a specific page
  public openExternal(ext: string, position: string) {
    let type = this.extType;
    this.metaService.openExternal(ext, position, type);
  }

  // get files in assets
  public getFiles(folder: string) {
    if (['pdf', 'videos', 'txt', 'audio'].indexOf(folder) !== -1) {
      this.currentMetaArray = [];
      let arg = {
        prefix: '/src/',
        folders: [folder]
      };
      let res = this.electronService.ipcRenderer.sendSync('readAssetFiles', arg);
      if (this.metaFiles[folder] && res) {
        this.metaMode = folder;
        this.extType = folder;
        this.metaFiles[folder] = res;
        if (this.metaFiles[folder][0]) {
          this.currentMetaArray.push(this.metaFiles[folder][0]);
        }
      }
      console.log(res);
    }
  }

  // get select folder loaded
  public selectFolder(meta) {
    if (this.metaMode) {
      if (this.metaFiles[this.metaMode] && meta['name']) {
        let folder = meta['name'];
        console.log(this.metaMode, meta);
        let newfolder = this.metaFiles[this.metaMode].filter((e) => {
          return e.name === folder;
        });
        if (newfolder[0]) {
          if (newfolder[0].path) {
            if (newfolder[0].path.indexOf(meta['path']) !== -1 || this.currentMetaArray.length === 0) {
              this.currentMetaArray.push(newfolder[0]);
            } else {
              this.currentMetaArray[this.currentMetaArray.length - 1] = newfolder[0];
            }
          } else {
            if (this.currentMetaArray[1]) {
              this.currentMetaArray[1] = newfolder[0];
            } else {
              this.currentMetaArray.push(newfolder[0]);
            }
          }
          console.log(this.currentMetaArray);
        }
      }
    }
  }

  // get select folder loaded
  public openFile(meta) {
    if (this.metaMode) {
      if (meta['path'] && meta['name']) {
        console.log(meta);
        this.setCurrentMeta(meta['name'], meta['path'], this.metaMode, '0', '');
        this.metaService.openFile(meta.path, this.metaMode);
      }
    }
  }

  // changes position in Link, Meta and Content
  public changePosition(list: string, pos: number) {
    // console.log(list, pos);
    switch (list) {
      case 'links':
        this.linkPos = pos;
        break;
      case 'content':
        this.contentPos = pos;
        break;
      case 'meta':
        this.metaPos = pos;
        break;
      default:
        console.log('wrong state: ', list, pos);
        break;
    }
  }

  // sets current meta in settings
  public setCurrentMeta(name0: string, path0: string, type0: string, pos0: string, comment0: string) {
    this.cmSettings.currentMeta = {
      name: name0,
      comment: comment0,
      path: path0,
      type: type0,
      pos: pos0
    };
    this.navigatorService.setCurrentMeta(this.cmSettings);
  }

  // adds new Meta to selected Element
  public addMeta(name0: string, pos0: string, path0: string, comment0: string) {
    if (this.cmSettings) {
      let posnumber = parseInt(pos0, 10);
      if (typeof posnumber === 'number') {
        if (posnumber < 0) {
          console.log('invalid position number: ', pos0, ' position set to 0');
          posnumber = 0;
        }
      } else if (this.cmSettings.currentMeta.type !== 'link') {
        console.log('invalid position number: ', pos0, ' position set to 0');
        posnumber = 0;
      }
      let newmeta = {
        name: name0,
        pos: pos0,
        type: this.extType,
        path: path0,
        comment: comment0
      };
      this.selCMEo.cmobject.meta.push(newmeta);
      this.navigatorService.changeCME(this.selCMEo);
    }
  }

  // moves view to entered coordinates
  public goTo(x: string, y: string) {
    this.navigatorService.goTo(x, y);
  }

  // moves element to entered coordinates
  public moveTo(x: string, y: string) {
    this.navigatorService.moveTo(x, y);
  }

  // moves element to entered coordinates
  public addCoor(coor: string, n0, n1) {
    this.navigatorService.addCoor(coor, n0, n1);
  }

  // moves view to entered coordinates
  public findTitle(title: string) {
    this.titlearray = this.navigatorService.findTitle(title);
    console.log(this.titlearray);
  }

  // gets the linked cmes
  public getLinkedCME(cme, i) {
    if (this.cmearray.length > (i + 1)) {
      this.cmearray = this.cmearray.slice(0, (i + 1));
    }
    this.cmearray.push(this.navigatorService.findAll(cme));
    // console.log(this.cmearray);
  }

  // changes position in Link, Meta and Content
  public delPosition(list: string, pos: number) {
    // console.log(list, pos);
    if (this.selCMEo) {
      switch (list) {
        case 'links':
          this.selCMEo.cmobject.links.splice(pos, 1);
          break;
        case 'content':
          this.selCMEo.cmobject.content.splice(pos, 1);
          break;
        case 'meta':
          this.selCMEo.cmobject.meta.splice(pos, 1);
          break;
        default:
          console.log('wrong state: ', list, pos);
          break;
      }
      this.navigatorService.changeCME(this.selCMEo);
    }
  }

  // checks in number fields if input is correct state of component
  public checkNumber(number0, object) {
    let num = Number(number0);
    if (num !== undefined && !isNaN(num) && num !== null) {
      return num;
    } else {
      alert(object + ' needs to be a number. Please enter a valid real number.');
      return 'error';
    }
  }

  // checks in number fields if input is correct state of component
  public checkBool(bool, object) {
    console.log(bool);
    if (bool === 'false' || bool === '0' || bool === 0) {
      return false;
    } else if (bool === 'true' || bool === '1' || bool === 1) {
      return true;
    } else {
      alert(object + ' needs to be a boolean. Please enter "true"/"1" or "false"/"0".');
      return 'error';
    }
  }

  // changes Element according to user inputtext
  public cangeSelCMEo(objects, value, pos?) {
    let error = false;
    switch (objects.length) {
      case 1:
        if (['id', 'x0', 'y0', 'x1', 'y1', 'prio'].indexOf(objects[0]) !== -1) {
          let numvalue = this.checkNumber(value, objects[0]);
          if (numvalue !== 'error') {
            this.selCMEo[objects[0]] = numvalue;
          } else {
            error = true;
          }
        } else if (objects[0] === 'types' || objects[0] === 'cat') {
          let array = value.replace(/ /g, '').split(',');
          this.selCMEo[objects[0]] = array;
        } else {
          this.selCMEo[objects[0]] = value;
        }
        break;
      case 3:
        if (['weight', 'targetId', 'id', 'width', 'height'].indexOf(objects[2]) !== -1) {
          let numvalue = this.checkNumber(value, objects[2]);
          if (numvalue !== 'error') {
            if (typeof pos === 'number') {
              this.selCMEo[objects[0]][objects[1]][pos][objects[2]] = numvalue;
            } else {
              this.selCMEo[objects[0]][objects[1]][objects[2]] = numvalue;
            }
          } else {
            error = true;
          }
        } else if (objects[2] === 'start') {
          let boolvalue = this.checkBool(value, objects[2]);
          if (boolvalue !== 'error') {
            if (typeof pos === 'number') {
              this.selCMEo[objects[0]][objects[1]][pos][objects[2]] = boolvalue;
            } else {
              this.selCMEo[objects[0]][objects[1]][objects[2]] = boolvalue;
            }
          } else {
            error = true;
          }
        } else {
          if (typeof pos === 'number') {
            this.selCMEo[objects[0]][objects[1]][pos][objects[2]] = value;
          } else {
            this.selCMEo[objects[0]][objects[1]][objects[2]] = value;
          }
        }
        break;
      case 4:
        if (['size', 'trans', 'weight'].indexOf(objects[3]) !== -1) {
          let numvalue = this.checkNumber(value, objects[3]);
          if (numvalue !== 'error') {
            if (typeof pos === 'number') {
              this.selCMEo[objects[0]][objects[1]][pos][objects[2]][objects[3]] = numvalue;
            } else {
              this.selCMEo[objects[0]][objects[1]][objects[2]][objects[3]] = numvalue;
            }
          } else {
            error = true;
          }
        } else if (objects[3] === 'class_array' || objects[3] === 'num_array') {
          let array = value.replace(/ /g, '').split(',');
          this.selCMEo[objects[0]][objects[1]][objects[2]][objects[3]] = array;
        } else {
          if (typeof pos === 'number') {
            this.selCMEo[objects[0]][objects[1]][pos][objects[2]][objects[3]] = value;
          } else {
            this.selCMEo[objects[0]][objects[1]][objects[2]][objects[3]] = value;
          }
        }
        break;
      default:
        console.log('wrong length: ', objects, value);
        break;
    }
    if (!error) {
      this.navigatorService.changeCME(this.selCMEo);
    }
  }

}
