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
    this.metaService.openExternal(ext, position, type)
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
        console.log(this.metaMode, folder);
        let newfolder = this.metaFiles[this.metaMode].filter((e) => {
          return e.name === folder;
        });
        if (newfolder[0]) {
          this.currentMetaArray.push(newfolder[0]);
          console.log(this.currentMetaArray);
        }
      }
    }
  }2

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
  public setCurrentMeta(name: string, path: string, type: string, pos: string, comment: string) {
    this.cmSettings.currentMeta = {
      name: name,
      comment: comment,
      path: path,
      type: type,
      pos: pos
    };
    this.navigatorService.setCurrentMeta(this.cmSettings);
  }

  // adds new Meta to selected Element
  public addMeta(name: string, pos: string, path: string, comment: string) {
    if (this.cmSettings) {
      let posnumber = parseInt(pos, 10);
      if (typeof posnumber === 'number') {
        if (posnumber < 0) {
          console.log('invalid position number: ', pos, ' position set to 0');
          posnumber = 0;
        }
      } else if (this.cmSettings.currentMeta.type !== 'link') {
        console.log('invalid position number: ', pos, ' position set to 0');
        posnumber = 0;
      }
      let newmeta = {
        name: name,
        pos: pos,
        type: this.cmSettings.currentMeta.type,
        path: path,
        comment: comment
      }
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

}
