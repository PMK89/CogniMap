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
  selector: 'app-tb-quizedit',
  templateUrl: './tb-quizedit.component.html',
  styleUrls: ['./tb-quizedit.component.scss']
})
export class TbQuizeditComponent implements OnInit {
  @Input() public cmsettings: CMSettings;
  public buttons: Observable<CMButton[]>;
  public colors: Observable<CMColorbar[]>;
  public selCMEo: any;
  public width = 0;
  public height = 0;
  public difarray = ['very easy', 'easy', 'normal', 'hard', 'harder', 'hardest'];
  public dif: string = this.difarray[2];
  public difnum = 2.5;
  public int = '1';
  public maxQ = '42';

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.colors = store.select('colors');
                store.select('selectedcmeo').subscribe((data) => {
                  if (typeof data === 'object') {
                    this.selCMEo = data;
                    if (this.selCMEo !== null) {
                      if (this.selCMEo['types']) {
                        if (this.selCMEo['types'][0] === 'q') {
                          this.width = this.selCMEo.x1 - this.selCMEo.x0;
                          this.height = this.selCMEo.y1 - this.selCMEo.y0;
                          if (this.selCMEo['cmobject']['style']['object']['weight']) {
                            let dif0 = this.selCMEo['cmobject']['style']['object']['weight'];
                            if (dif0) {
                              if (dif0 > 1.3) {
                                this.difnum = dif0;
                                if (dif0 >= 2.5) {
                                  this.dif = this.difarray[0];
                                } else if (dif0 < 2.5 && dif0 > 2.30) {
                                  this.dif = this.difarray[1];
                                } else if (dif0 <= 2.30 && dif0 > 2.10) {
                                  this.dif = this.difarray[1];
                                } else if (dif0 <= 2.10 && dif0 > 1.90) {
                                  this.dif = this.difarray[2];
                                } else if (dif0 <= 1.90 && dif0 > 1.65) {
                                  this.dif = this.difarray[3];
                                } else if (dif0 <= 1.65 && dif0 > 1.40) {
                                  this.dif = this.difarray[4];
                                } else if (dif0 <= 1.40) {
                                  this.dif = this.difarray[5];
                                }
                              }
                            }
                          }
                          if (this.selCMEo['cmobject']['style']['object']['str']) {
                            let int0 = this.selCMEo['cmobject']['style']['object']['str'];
                            if (typeof parseInt(int0, 10) === 'number') {
                              this.int = int0;
                            }
                          }
                        } else {
                          this.width = 0;
                          this.height = 0;
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
              if (this.selCMEo.cmobject.links[i].start === start) {7
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
}Interval

  public changeCon(con: string, start: boolean) {
    // cange connection goes here
    this.elementService.changeCon(con, start);
  }

  public setSize(xvalue: string, yvalue: string) {
    // cange connection goes here
    if (this.selCMEo) {
      let newwidth = parseInt(xvalue, 10);
      let newheight = parseInt(yvalue, 10);
      if (newwidth > 0 && newheight > 0) {
        let oldwidth = this.selCMEo.x1 - this.selCMEo.x0;
        let difx = (newwidth - oldwidth) / 2;
        let oldheight = this.selCMEo.y1 - this.selCMEo.y0;
        let dify = (newheight - oldheight) / 2;
        if (typeof dify === 'number' && typeof difx === 'number') {
          console.log(oldwidth, newwidth, difx, oldheight, newheight, dify);
          this.selCMEo.coor.x -= difx;
          this.selCMEo.x0 -= difx;
          this.selCMEo.x1 += difx;
          this.selCMEo.coor.y -= dify;
          this.selCMEo.y0 -= dify;
          this.selCMEo.y1 += dify;
          this.selCMEo.prep = '';
          this.selCMEo.prep1 = '';
          this.elementService.updateSelCMEo(this.selCMEo);
        }
      }
    }
  }

  // changes interval counter
  public changeInt(int0) {
    if (typeof parseInt(int0, 10) === 'number') {
      this.int = int0;
      console.log(this.int);
      let action = {
        variable: ['cmobject', 'style', 'object', 'str'],
        value: this.int
      };
      this.elementService.changeCMEo(action);
    }
  }

  // changes maximal quizes
  public changeMaxQ(int0) {
    if (typeof parseInt(int0, 10) === 'number') {
      this.maxQ = int0;
      console.log(this.maxQ);
      if (this.cmsettings) {
        this.cmsettings.cmtbquizedit.interval = this.maxQ.toString();
        this.settingsService.changeSetting(this.cmsettings);
      }
    }
  }

  // changes the difficulty
  public changeDif() {
    switch (this.dif) {
      case 'very easy':
        this.difnum = 2.5;
        break;
      case 'easy':
        this.difnum = 2.4;
        break;
      case 'normal':
        this.difnum = 2.2;
        break;
      case 'hard':
        this.difnum = 1.8;
        break;
      case 'harder':
        this.difnum = 1.5;
        break;
      case 'hardest':
        this.difnum = 1.35;
        break;
      default:
        this.difnum = 2.5;
        break;
    }
    console.log(this.dif, this.difnum);
    let action = {
      variable: ['cmobject', 'style', 'object', 'weight'],
      value: this.difnum
    };
    if (this.cmsettings) {
      this.cmsettings.cmtbquizedit.difficulty = this.difnum;
      this.settingsService.changeSetting(this.cmsettings);
    }
    this.elementService.changeCMEo(action);
  }

}
