import { Component, OnInit,  } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ElectronService } from 'ngx-electron';
import { MetaService } from '../../shared/meta.service';
// models and reducers
declare var Snap: any;
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { MnemoService } from './mnemo.service';
import { CMColorbar } from '../../models/CMColorbar';

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
  public colors: Observable<CMColorbar[]>;
  public selCMEo: any;
  public dx = 0.5;
  public dy = 0.5;
  public mnemosize = 50;
  public mnemocolor = '#666666';
  public mnemopics = [];
  public contentPos = -1;
  public mnemopath = '';
  public transformable = false;
  public active = false;
  public transMatrix = new Snap.Matrix();
  public actionpics = [];

  constructor(private store: Store<CMStore>,
              private electronService: ElectronService,
              private metaService: MetaService,
              private mnemoService: MnemoService) {
                this.colors = store.select('colors');
              }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        if (data['id']) {
          this.cmSettings = data;
          if (data.widget1 || data.widget1) {
            if (data.widget0 === 'mnemo' || data.widget1 === 'mnemo') {
              if (data.latexcolor && !this.active) {
                this.mnemocolor = this.cmSettings.mnemocolor;
              }
              this.active = true;
            } else {
              this.active = false;
            }
          }
          if (data.contentPos > -1) {
            this.contentPos = data.contentPos;
            if (this.selCMEo) {
              if (this.selCMEo.cmobject.content !== undefined) {
                if (this.selCMEo.cmobject.content[this.contentPos]) {
                  if (this.selCMEo.cmobject.content[this.contentPos].cat === 'im') {
                    this.mnemosize = this.selCMEo.cmobject.content[this.contentPos].height;
                    this.mnemopath = this.selCMEo.cmobject.content[this.contentPos].object;
                  }
                }
              }
            }
          } else {
            this.contentPos = -1;
          }
          if (data.mnemocolor) {
            if (this.active) {
              if (this.mnemocolor !== data.mnemocolor) {
                this.setMnemoColor(this.mnemocolor);
              }
            }
            this.mnemocolor = data.mnemocolor;
          }
        }
      }
    });
    const actionpics0 = ['arrow', 'arrow_dash', 'arrow_flash', 'arrow_eye', 'arrow_katana', 'arrow_hammer', 'arrow_car',
                          'arrow_plane', 'arrow_tone', 'arrow_curved', 'man0', 'man1', 'woman0', 'skull'
                        , 'thoughtbubble', 'speechbubble'];
    for (let i = 0; i < 4; i++) {
      let actionpicsrow = [];
      for (let j = 0; j < 4; j++) {
        let path = 'assets/images/mnemo/actions/' + actionpics0[(i * 4) + j] + '.svg';
        actionpicsrow.push(path);
      }
      this.actionpics.push(actionpicsrow);
    }
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
            if (['q', 'q1', 's'].indexOf(this.selCMEo.types[0]) === -1) {
              this.transformable = true;
              if (this.selCMEo['cmobject']['style']['object']['str']) {
                if (this.selCMEo['cmobject']['style']['object']['str'] !== '') {
                  // console.log(this.selCMEo['cmobject']['style']['object']['str']);
                  let tmo = JSON.parse(this.selCMEo['cmobject']['style']['object']['str']);
                  this.transMatrix = Snap.matrix(tmo.a, tmo.b, tmo.c, tmo.d, tmo.e, tmo.f);
                }
              }
            } else {
              this.transformable = false;
            }
          }
        }
      }
      // console.log('settings ', data);
    });
  }

  // sets size for icon
  public setMnemoSize(size: number) {
    this.mnemosize = size;
    if (this.selCMEo) {
      if (this.contentPos > -1) {
        this.selCMEo.cmobject.content[this.contentPos].height = size;
        this.mnemoService.changeCME(this.selCMEo);
      }
    }
  }

  // sets size for icon
  public setMnemoColor(color: string) {
    this.mnemocolor = color;
    if (this.selCMEo) {
      if (this.contentPos > -1) {
        this.selCMEo.cmobject.content[this.contentPos].info = color;
        this.mnemoService.changeCME(this.selCMEo);
      }
    }
  }

  // gets state
  public getState(dx: number, dy: number) {
    if (dx === this.dx && dy === this.dy) {
      return {'background-color': this.cmSettings.style.btnclickcolor};
    } else {
      return {'background-color': this.cmSettings.style.btnbgcolor0};
    }
  }

  // sets background of selected size0
  public getSize(size: number) {
    if (this.mnemosize === size) {
      return {'background-color': this.cmSettings.style.btnclickcolor};
    } else {
      return {'background-color': this.cmSettings.style.btnbgcolor0};
    }
  }

  // change matrix transformation
  public changeMatrix(par: string) {
    if (par) {
      switch (par) {
        case '0':
          this.transMatrix = new Snap.Matrix();
          break;
        case '-45':
          this.transMatrix = new Snap.Matrix();
          this.transMatrix.rotate(-45);
          break;
        case '-90':
          this.transMatrix = new Snap.Matrix();
          this.transMatrix.rotate(-90);
          break;
        case '-135':
          this.transMatrix = new Snap.Matrix();
          this.transMatrix.rotate(-135);
          break;
        case '-180':
          this.transMatrix = new Snap.Matrix();
          this.transMatrix.rotate(-180);
          break;
        case '135':
          this.transMatrix = new Snap.Matrix();
          this.transMatrix.rotate(135);
          break;
        case '45':
          this.transMatrix = new Snap.Matrix();
          this.transMatrix.rotate(45);
          break;
        case '90':
          this.transMatrix = new Snap.Matrix();
          this.transMatrix.rotate(90);
          break;
        case 'mh':
          this.transMatrix.scale(-1, 1);
          break;
        case 'mv':
          this.transMatrix.scale(1, -1);
          break;
        default:
          console.log('unknown type: ', par);
      }
      if (this.selCMEo) {
        if (par === 'reset') {
          this.selCMEo['cmobject']['style']['object']['str'] = '';
        } else {
          this.selCMEo['cmobject']['style']['object']['str'] = JSON.stringify(this.transMatrix);
        }
        // console.log(this.selCMEo['cmobject']['style']['object']['str']);
        this.mnemoService.changeCME(this.selCMEo);
      }
    }
  }

  // sends clicked mnemopic to service
  public picClick(path: string) {
    this.mnemopath = path;
    this.mnemoService.sendMnemo(path, this.mnemosize, this.dx, this.dy, this.mnemocolor);
  }

  // change conection position
  public changeCon(dx: number, dy: number) {
    // cange connection goes here
    this.dx = dx;
    this.dy = dy;
  }

}
