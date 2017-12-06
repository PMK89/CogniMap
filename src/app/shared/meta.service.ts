import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'ngx-electron';
import { CMStore } from '../models/CMStore';
import { CMSettings } from '../models/CMSettings';
// import { CMElement } from '../models/CMElement';

import { SettingsService } from './settings.service';
// const ipcRenderer = require('electron').ipcRenderer;

@Injectable()
export class MetaService {
  public cmsettings: CMSettings;

  constructor(private store: Store<CMStore>,
              private settingsService: SettingsService,
              private electronService: ElectronService) {
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      this.cmsettings = data;
                      // console.log('settings ', data);
                    });
  }

  // opens a pdf on a specific page
  public openExternal(ext: string, position: string, type: string) {
    console.log('openExternal: ', ext, position, type);
    let posnumber = parseInt(position, 10);
    if (typeof posnumber === 'number') {
      if (posnumber < 0) {
        console.log('invalid position number: ', position, ' position set to 0');
        posnumber = 0;
      }
    } else if (type !== 'link') {
      console.log('invalid position number: ', position, ' position set to 0');
      posnumber = 0;
    }
    switch (type) {
      case 'pdf':
        let pdfarray = ext.split('.');
        if (pdfarray[pdfarray.length - 1] === 'pdf' || pdfarray[pdfarray.length - 1] === 'PDF') {
          let arg0 = {
            type: 'pdf',
            complete: false,
            path: '/src/assets/pdf/' + ext + '#page=' + posnumber.toString()
          };
          let res0 = this.electronService.ipcRenderer.sendSync('openBrowser', arg0);
          console.log(res0);
        } else {
          alert('Non Valid PDF: ' + ext + posnumber.toString());
        }
        break;
      case 'link':
        if (['0', undefined, '', NaN, ' '].indexOf(position) === -1) {
          ext = ext + '#' + position;
        }
        let arg1 = {
          type: 'link',
          complete: false,
          path: ext
        };
        let res1 = this.electronService.ipcRenderer.sendSync('openBrowser', arg1);
        console.log(res1);
        break;
      case 'videos':
        let arg2 = {
          type: 'videos',
          complete: false,
          path: '/src/assets/videos/' + ext + ' --start-time=' + posnumber.toString()
        };
        let res2 = this.electronService.ipcRenderer.sendSync('openBrowser', arg2);
        console.log(res2);
        break;
      case 'audio':
        let arg3 = {
          type: 'audio',
          complete: false,
          path: '/src/assets/audio/' + ext + ' --start-time=' + posnumber.toString()
        };
        let res3 = this.electronService.ipcRenderer.sendSync('openBrowser', arg3);
        console.log(res3);
        break;
      case 'picture':
        let arg4 = {
          type: 'picture',
          complete: false,
          path: '/dist/assets/images/' + ext
        };
        let res4 = this.electronService.ipcRenderer.sendSync('openBrowser', arg4);
        break;
      case 'comment':
      case 'code':
        console.log('type: ', type);
      default:
        alert('No valid type: ' + type + ' ' + ext + ' ' + posnumber.toString());
    }
  }

  // opens pdf at specific position
  public openPdfPage(path0: string, page: number) {
    let path1 = path0 + '#page=' + page.toString();
    this.openFile(path1, 'pdf');
  }

  // opens link at specific position
  public openLinkPosition(path0: string, link: string) {
    let path1 = path0 + '#' + link;
    this.openFile(path1, 'link');
  }

  // opens video at specific time
  public openVideoTime(path0: string, time: number) {
    let path1 = path0 + ' --start-time=' + time.toString();
    this.openFile(path1, 'videos');
  }

  // get selected file loaded
  public openFile(path0: string, metaMode: string) {
    if (metaMode) {
      switch (metaMode) {
        case 'pdf':
          let arg0 = {
            type: 'pdf',
            complete: true,
            path: path0
          };
          this.electronService.ipcRenderer.sendSync('openBrowser', arg0);
          break;
        case 'txt':
          let arg1 = {
            type: 'txt',
            complete: true,
            path: path0
          };
          this.electronService.ipcRenderer.sendSync('openBrowser', arg1);
          break;
        case 'link':
          let arg2 = {
            type: 'link',
            complete: true,
            path: path0
          };
          this.electronService.ipcRenderer.sendSync('openBrowser', arg2);
          break;
        case 'videos':
          let arg3 = {
            type: 'videos',
            complete: true,
            path: path0
          };
          this.electronService.ipcRenderer.sendSync('openBrowser', arg3);
          break;
        case 'audio':
          let arg4 = {
            type: 'audio',
            complete: true,
            path: path0
          };
          this.electronService.ipcRenderer.sendSync('openBrowser', arg4);
          break;
        case 'picture':
          let arg5 = {
            type: 'picture',
            complete: false,
            path: '/dist/assets/images/' + path0
          };
          let res5 = this.electronService.ipcRenderer.sendSync('openBrowser', arg5);
          if (this.cmsettings) {
            let clutterindex = res5.indexOf('/dist/assets/images/')
            res5 = res5.slice((clutterindex + 20));
            this.cmsettings.epath = res5;
            console.log(this.cmsettings.epath);
            this.settingsService.updateSettings(this.cmsettings);
          };
          console.log(res5);
          break;
        case 'comment':
        case 'code':
          console.log('type: ', metaMode);
        default:
          alert('No valid path: ' + path0);
      }
    }
  }

}
