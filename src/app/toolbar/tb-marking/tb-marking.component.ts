import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';
// import { SButtonComponent } from '../../shared/s-button/s-button.component';

// models and reducers
import { CMSettings } from '../../models/CMSettings';
import { CMStore } from '../../models/CMStore';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';

@Component({
  selector: 'app-tb-marking',
  templateUrl: './tb-marking.component.html',
  styleUrls: ['./tb-marking.component.scss']
})
export class TbMarkingComponent implements OnInit {
  @Input() public cmsettings: CMSettings;
  public buttons: Observable<CMButton[]>;
  public colors: Observable<CMColorbar[]>;
  public selCMEo: any;
  public ispic = false;
  public picsize: number;

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
              'background-color': '#ff0000',
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

  public makeTrans(color) {
    this.elementService.makeTrans(color);
  }

  public delselCMEo() {
    if (this.elementService.selCMEo) {
      this.elementService.delCME(this.elementService.selCMEo.id);
    }
  }

  public changeCon(con: string, start: boolean) {
    // cange connection goes here
    this.elementService.changeCon(con, start);
  }

}
