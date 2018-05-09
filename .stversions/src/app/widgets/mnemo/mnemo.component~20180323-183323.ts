import { Component, OnInit,  } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'ngx-electron';
import { MetaService } from '../../shared/meta.service';
// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { MnemoService } from './mnemo.service';

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-mnemo',
  templateUrl: './mnemo.component.html',
  styleUrls: ['./mnemo.component.scss']
})
export class MnemoComponent implements OnInit {
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public cmSettings: CMSettings;
  public selCMEo: any;
  public mnemosize = 50;
  public mnemopics = [];

  public position = this.mnemoService.position;

  constructor(private store: Store<CMStore>,
              private electronService: ElectronService,
              private metaService: MetaService,
              private mnemoService: MnemoService) { }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        if (data['id']) {
          this.cmSettings = data;
        }
      }
    });
    for (let i = 0; i < 10; i++) {
      let mnemopicsrow = [];
      for (let j = 0; j < 10; j++) {
        let path = 'assets/images/mnemo/0_100/' + i.toString() + j.toString() + '.png';
        mnemopicsrow.push(path);
      }
      this.mnemopics.push(mnemopicsrow);
    }
    this.mnemopics.push(['assets/images/mnemo/0_100/100.png']);
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

  // sets size for icon
  public setMnemoSize(size: number) {
    this.mnemosize = size;
  }

  // gets
  public getState(con: string, start: boolean) {
    let style: Object = {
      'background-color': '#ffffff',
    };
    if (this.selCMEo) {
          let active = false;
          for (let i in this.selCMEo.cmobject.links) {
            if (this.selCMEo.cmobject.links[i]) {
              if (this.selCMEo.cmobject.links[i].start === start) {
                if (this.selCMEo.cmobject.links[i].con === con) {
                  active = true;
                  // console.log(this.selCMEo.cmobject.links[i]);
                  break;
                } else {
                  active = false;
                }
              }
            }
          }
          // console.log(active);
          if (active === true) {
            style = {
              'background-color': this.cmSettings.style.btnclickcolor
            };
            // console.log(style);
            return style;
          } else {
            return style;
          }
      }
    return style;
  }

  // sets background of selected size0
  public getSize(size: number) {
    if (this.mnemosize === size) {
      return {'background-color': this.cmSettings.style.btnclickcolor};
    } else {
      return {'background-color': this.cmSettings.style.btnbgcolor0};
    }
  }

  // sends clicked mnemopic to service
  public picClick(path: string) {
    this.mnemoService.sendMnemo(path, this.mnemosize);
  }

}
