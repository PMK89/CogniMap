import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';
// import { SButtonComponent } from '../../shared/s-button/s-button.component';
declare var Snap: any;

// models and reducers
import { CMTBObject } from '../../models/CMTBObject';
import { CMStore } from '../../models/CMStore';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';

@Component({
  selector: 'app-tb-object',
  templateUrl: './tb-object.component.html',
  styleUrls: ['./tb-object.component.scss']
})
export class TbObjectComponent implements OnInit {
  @Input() public cmtbobject: CMTBObject;
  public buttons: Observable<CMButton[]>;
  public colors: Observable<CMColorbar[]>;
  public selCMEo: any;
  public ispic = false;
  public transformable = false;
  public picsize: number;
  public transMatrix = new Snap.Matrix();
  public Mrotate = 0;
  public MscaleX = 1;
  public MscaleY = 1;
  public MskewX = 0;
  public MskewY = 0;

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.colors = store.select('colors');
                store.select('selectedcmeo').subscribe((data) => {
                  if (typeof data === 'object') {
                    this.selCMEo = data;
                    if (this.selCMEo !== null) {
                      if (this.selCMEo['cmobject']) {
                        if (['q', 'q1', 's'].indexOf(this.selCMEo.types[0]) === -1) {
                          this.transformable = true;
                          if (this.selCMEo['cmobject']['style']['object']['str']) {
                            if (this.selCMEo['cmobject']['style']['object']['str'] !== '') {
                              // console.log(this.selCMEo['cmobject']['style']['object']['str']);
                              let tmo = JSON.parse(this.selCMEo['cmobject']['style']['object']['str']);
                              this.transMatrix = Snap.matrix(tmo.a, tmo.b, tmo.c, tmo.d, tmo.e, tmo.f);
                              let splitmatrix = this.transMatrix.split();
                              this.Mrotate = splitmatrix.rotate;
                              this.MskewX = splitmatrix.scalex;
                              this.MskewY = splitmatrix.scaley;
                            }
                          }
                        } else {
                          this.transformable = false;
                        }
                        if (this.selCMEo.cmobject['content']) {
                          if (this.selCMEo.cmobject.content[0] !== undefined) {
                            if (this.selCMEo.cmobject.content[0].cat === 'i') {
                              this.picsize = this.selCMEo.cmobject.content[0].width;
                              this.ispic = true;
                            } else {
                              this.ispic = false;
                            }
                          } else {
                            this.ispic = false;
                          }
                        }
                      }
                    }
                    // console.log(data);
                  }
                });
              }

  public ngOnInit() {
  }

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
              'background-color': this.elementService.cmsettings.style.btnclickcolor
            };
            // console.log(style);
            return style;
          } else {
            return style;
          }
  } return style;
  }

  public setPicSize(picSize) {
    // console.log(picSize, (typeof picSize));
    let size = parseInt(picSize, 10);
    if ((typeof size) === 'number') {
      this.selCMEo.cmobject.content[0].width = size;
      this.elementService.updateSelCMEo(this.selCMEo);
    }
  }

  // change matrix transformation
  public changeMatrix(par: string, val0: string) {
    let val = parseFloat(val0);
    if ((typeof val) === 'number') {
      switch (par) {
        case 'sx':
          this.MscaleX = val;
          this.transMatrix.scale(this.MscaleX, 1);
          break;
        case 'sy':
          this.MscaleY = val;
          this.transMatrix.scale(1, this.MscaleY);
          break;
        case 'rot':
          this.Mrotate = val;
          this.transMatrix.rotate(this.Mrotate);
          break;
        case 'skx':
          this.MskewX = val;
          this.transMatrix.skewX(this.MskewX);
          break;
        case 'sky':
          this.MskewY = val;
          this.transMatrix.skewY(this.MskewY);
          break;
        case 'mh':
          this.transMatrix.scale(-1, 1);
          break;
        case 'mv':
          this.transMatrix.scale(1, -1);
          break;
        case 'reset':
          this.MscaleX = 1;
          this.MscaleY = 1;
          this.Mrotate = 0;
          this.MskewX = 0;
          this.MskewY = 0;
          this.transMatrix = new Snap.Matrix();
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
        this.elementService.updateSelCMEo(this.selCMEo);
      }
    }
  }

  public delselCMEo() {
    if (this.elementService.selCMEo) {
      this.elementService.delCME(this.elementService.selCMEo.id);
    }
  }

  // change conection position
  public changeCon(con: string, start: boolean) {
    // cange connection goes here
    this.elementService.changeCon(con, start);
  }

  // select all child nodes of selected Element
  public selectChildren() {
    // cange connection goes here
    this.elementService.selectChildren();
  }

}
