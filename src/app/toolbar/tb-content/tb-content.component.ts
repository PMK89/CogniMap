import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';
import { SnapsvgService } from '../../shared/snapsvg.service';
import { MetaService } from '../../shared/meta.service';
import { CodeeditorService } from '../../widgets/codeeditor/codeeditor.service';
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
  public tolerance = 10;
  public transColor = 'white';
  public selCMEo: any;
  public picsize: number;
  public contentStrg: string;
  public contentCat: string;
  public contentCorrect: boolean;
  public inputType: string;
  public copy = false;
  public epath = '';
  public pos = 0;
  public contentlen = 0;

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private snapsvgService: SnapsvgService,
              private metaService: MetaService,
              private codeeditorService: CodeeditorService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.colors = store.select('colors');
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      this.cmsettings = data;
                      if (this.cmsettings.epath) {
                        this.epath = this.cmsettings.epath;
                        console.log(this.epath);
                      }
                      // console.log('settings ', data);
                    });
                store.select('selectedcmeo').subscribe((data) => {
                  if (typeof data === 'object') {
                    this.selCMEo = data;
                    if (this.cmsettings) {
                      if (this.cmsettings.copy) {
                        if (this.cmsettings.copy.type === 'content') {
                          this.copy = true;
                        }
                      } else {
                        this.copy = false;
                      }
                      if (this.cmsettings.epath) {
                        this.epath = this.cmsettings.epath;
                      }
                    }
                    if (this.selCMEo !== null) {
                      if (this.selCMEo['cmobject']) {
                        if (this.selCMEo.cmobject['content']) {
                          if (this.selCMEo.cmobject.content !== undefined) {
                            if (this.selCMEo.cmobject.content.length > 0) {
                              this.contentlen = this.selCMEo.cmobject.content.length;
                              this.pos = 0;
                              this.picsize = this.selCMEo.cmobject.content[this.pos].height;
                              this.contentCat = this.selCMEo.cmobject.content[this.pos].cat;
                              this.contentCorrect = this.selCMEo.cmobject.content[this.pos].correct;
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
    // this.elementService.setContentPos(this.pos);
    this.cmsettings.contentPos = this.pos;
    this.settingsService.updateSettings(this.cmsettings);
    this.picsize = this.selCMEo.cmobject.content[this.pos].height;
    this.contentCat = this.selCMEo.cmobject.content[this.pos].cat;
    this.contentCorrect = this.selCMEo.cmobject.content[this.pos].correct;
    this.snapsvgService.markElement(('c' + this.selCMEo.id.toString() + '-' + this.pos.toString()), this.selCMEo.id.toString());
    // console.log(this.pos, '/', this.contentlen);
  }

  public makeTrans(color) {
    this.transColor = color;
    this.elementService.makeTrans(color, this.tolerance);
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

  // pastes content
  public pasteContent() {
    this.elementService.pasteContent();
    // console.log(this.contentStrg);
  }

  // open content if it's a picture
  public openPicture() {
    this.metaService.openFile(this.selCMEo.cmobject.content[this.pos].object, 'picture');
    // console.log(this.contentStrg);
  }

  // inserts a edited path if there is one
  public insertPicture() {
    this.selCMEo.cmobject.content[this.pos].object = this.epath;
    this.elementService.updateSelCMEo(this.selCMEo);
    this.cmsettings.epath = '';
    this.settingsService.updateSettings(this.cmsettings);
    // console.log(this.contentStrg);
  }

  // copies content
  public copyContent() {
    this.cmsettings.copy.type = 'content';
    this.cmsettings.copy.strg = JSON.stringify(this.selCMEo.cmobject.content[this.pos]);
    this.settingsService.updateSettings(this.cmsettings);
    // console.log(this.contentStrg);
  }

  // copies content of svg object
  public copySVG() {
    this.inputType = 'svg';
    this.contentStrg = this.selCMEo.cmobject.content[this.pos].object;
    // console.log(this.contentStrg);
  }

  // copies info
  public copyInfo() {
    this.inputType = 'info';
    this.contentStrg = this.selCMEo.cmobject.content[this.pos].info;
    if (this.selCMEo.cmobject.content[this.pos].cat === 'html') {
      this.codeeditorService.code = this.contentStrg;
    }
  }

  // reads string in input field
  public readInput(input) {
    if (this.selCMEo) {
      if (this.inputType === 'info') {
        this.selCMEo.cmobject.content[this.pos].info = input;
        this.elementService.updateSelCMEo(this.selCMEo);
      } else if (this.inputType === 'svg') {
        this.selCMEo.cmobject.content[this.pos].object = input;
        this.elementService.updateSelCMEo(this.selCMEo);
      } else {
        console.log('no inputType');
      }
    }
  }

  // changes correct value
  public changeCheckbox() {
    if (this.selCMEo) {
      if (this.selCMEo.cmobject.content[this.pos].correct) {
        this.selCMEo.cmobject.content[this.pos].correct = false;
      } else {
        this.selCMEo.cmobject.content[this.pos].correct = true;
      }
      this.elementService.updateSelCMEo(this.selCMEo);
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
        this.contentlen = this.selCMEo.cmobject.content.length;
      } catch (err) {
        console.log(err);
      }
    }
  }

  // changes tollerance
  public changeTol(value: string, enter: boolean) {
    let valueNum = parseInt(value, 10);
    if (typeof valueNum === 'number') {
      if (valueNum >= 0 && valueNum <= 255) {
        this.tolerance = valueNum;
      } else {
        alert('Please enter an integer number between 0 and 255');
      }
      if (enter) {
        this.makeTrans(this.transColor);
      }
    }
  }

}
