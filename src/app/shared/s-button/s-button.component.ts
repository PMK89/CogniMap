import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ElementService } from'../element.service';
import { SettingsService } from '../../shared/settings.service';

// models and reducers
import { CMButton } from '../../models/CMButton';
import { CMEo } from '../../models/CMEo';
import { CMEl } from '../../models/CMEl';
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';

@Component({
  selector: 'app-s-button',
  templateUrl: './s-button.component.html',
  styleUrls: ['./s-button.component.css']
})
export class SButtonComponent implements OnInit {
  @Input() public buttons: Observable<CMButton[]>;
  @Input() public selector: number;
  public selCMEo: Observable<CMEo>;
  public selCMEl: Observable<CMEl>;
  public cmsettings: CMSettings;
  public style = {
    'border-color': '#808080',
    'background-color': '#ffffff'
  };

  constructor(private elementService: ElementService,
              private settingsService: SettingsService,
              private store: Store<CMStore>) {
                this.selCMEo = store.select('selectedcmeo');
                this.selCMEl = store.select('selectedcmel');
                this.settingsService.cmsettings
                      .subscribe((data) => {
                        if (data) {
                          this.cmsettings = data;
                        }
                      });
              }

  public ngOnInit() {
  }

  public getState(button) {
    let selElem;
    if (button.cat === 'tbline') {
      selElem = this.selCMEl;
    } else if (button.cat === 'cmsettings' || button.cat === 'function') {
      // do nothing
    } else {
      selElem = this.selCMEo;
    }
    if (selElem) {
      selElem.subscribe((cmelement) => {
        if (cmelement) {
          let n = button.variable.length;
          switch (n) {
            case 1:
              if (button.variable[0] === 'types') {
                let valuearray = button.value;
                if (cmelement.types[0] === valuearray[0] && cmelement.types[1] === valuearray[1]
                    && cmelement.types[2] === valuearray[2]) {
                  button.active = true;
                } else {
                  button.active = false;
                }
              } else {
                if (cmelement[button.variable[0]] === button.value) {
                  button.active = true;
                } else {
                  button.active = false;
                }
              }
              break;
            case 2:
              if (cmelement[button.variable[0]][button.variable[1]] === button.value) {
                button.active = true;
              } else {
                button.active = false;
              };
              break;
            case 3:
              if (cmelement[button.variable[0]][button.variable[1]][button.variable[2]]
                 === button.value) {
                button.active = true;
              } else {
                button.active = false;
              };
              break;
            case 4:
              if (cmelement[button.variable[0]][button.variable[1]][button.variable[2]][button.variable[3]]
                === button.value) {
                button.active = true;
              } else if (button.variable[3] === 'class_array') {
                if (
                  cmelement[button.variable[0]][button.variable[1]][button.variable[2]][button.variable[3]].indexOf(button.value[0])
                   !== -1) {
                  button.active = true;
                }
              } else {
                button.active = false;
              };
              break;
            default:
              button.active = false;
          }
        } else {
          button.active = false;
        }
      }).unsubscribe();
    } else if (button.cat === 'cmsettings') {
      // do nothing
      if (button.variable[0] === 'mode') {
        if (this.cmsettings.mode === button.value) {
          button.active = true;
        } else {
          button.active = false;
        }
      }
    } else if (button.cat === 'function') {
      // do nothing
    } else {
      button.active = false;
    }
    // console.log(button.active);
    if (button.active === true) {
      this.style['background-color'] = this.cmsettings.style.btnclickcolor;
      return this.style;
    } else {
      this.style['background-color'] = this.cmsettings.style.btnbgcolor0;
      return this.style;
    }
  }

  // handles click events
  public clicked(button) {
    let action = {
      variable: button.variable,
      value: button.value
    };
    console.log(button.value);
    if (button.cat === 'cmsettings') {
      if (button.variable[0] === 'mode') {
        if (button.value === 'draw_poly') {
          this.cmsettings.pointArray = [];
          this.settingsService.updateSettings(this.cmsettings);
        }
        if (this.cmsettings.mode === button.value) {
          if (button.value === 'edit' || button.value === 'quizing') {
            this.cmsettings.mode = 'view';
          } else {
            this.cmsettings.mode = 'edit';
          }
          this.settingsService.updateSettings(this.cmsettings);
        } else {
          this.cmsettings.mode = button.value;
          this.settingsService.updateSettings(this.cmsettings);
        }
      }
    } else if (button.cat === 'tbline') {
      this.elementService.changeCMEl(action);
    } else {
      this.elementService.changeCMEo(action);
    }
  }

  // get class of button
  public getClass(button) {
    if (this.cmsettings) {
      this.style['border-color'] = this.cmsettings.style.btnbordercolor;
      return this.cmsettings.style.btnclass;
    } else if (button.cat === 'cmsettings') {
      // do nothing
      if (button.variable === 'mode') {
        if (this.cmsettings.mode === button.value && this.cmsettings.mode !== 'edit') {
          this.cmsettings.mode = 'edit';
        } else {
          this.cmsettings.mode = button.value;
        }
        // console.log(this.cmsettings);
        this.settingsService.updateSettings(this.cmsettings);
      }
    } else {
      return 'btndefault';
    }
  }
}
