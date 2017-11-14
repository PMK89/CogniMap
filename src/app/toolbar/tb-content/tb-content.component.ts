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
  selector: 'app-tb-content',
  templateUrl: './tb-content.component.html',
  styleUrls: ['./tb-content.component.scss']
})
export class TbContentComponent implements OnInit {
  @Input() public cmsettings: CMSettings;
  public buttons: Observable<CMButton[]>;
  public colors: Observable<CMColorbar[]>;
  public selCMEo: any;
  public picsize: number;
  public pos = 0;
  public contentlen = 0;

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
                          if (this.selCMEo.cmobject.content !== undefined) {
                            if (this.selCMEo.cmobject.content.length > 0) {
                              this.contentlen = this.selCMEo.cmobject.content.length;
                              this.pos = 0;
                              this.picsize = this.selCMEo.cmobject.content[this.pos].height;
                            } else {
                              this.contentlen = 0;
                            }
                          } else {
                            this.contentlen = 0;
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
      this.selCMEo.cmobject.content[this.pos].height = size;
      this.elementService.updateSelCMEo(this.selCMEo);
    }
  }

  // changes selected content
  public changeContent(num) {
    if ((this.pos + num) < this.contentlen && (this.pos + num) >= 0) {
      this.pos += num;
    } else if ((this.pos + num) === this.contentlen) {
      this.pos = 0;
    } else {
      this.pos = this.contentlen - 1;
    }
    console.log(this.pos, '/', this.contentlen);
  }

  public makeTrans(color) {
    this.elementService.makeTrans(color);
  }

  // change cat of content (if possible)
  public changeContentCat() {
    if (this.elementService.selCMEo) {
      try {
        // causes the app to crash
        if (this.selCMEo.cmobject.content[this.pos].cat === 'i') {
          this.selCMEo.cmobject.content[this.pos].cat = 'i_100';
          this.elementService.updateSelCMEo(this.selCMEo);
        } else {
          console.log('operation not possible');
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  // deletes selected entry from content array
  public delContent() {
    if (this.elementService.selCMEo) {
      try {
        // causes the app to crash
        if (this.selCMEo.types[0] !== 'i') {
          this.selCMEo.cmobject.content.splice(this.pos, 1);
          this.elementService.updateSelCMEo(this.selCMEo);
        } else {
          this.elementService.delCME(this.elementService.selCMEo.id);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

}
