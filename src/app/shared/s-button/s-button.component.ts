import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ElementService } from'../element.service';

// models and reducers
import { CMButton } from '../../models/CMButton';
import { CMEo } from '../../models/CMEo';
import { CMEl } from '../../models/CMEl';
import { CMStore } from '../../models/CMStore';

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

  constructor(private elementService: ElementService,
              private store: Store<CMStore>) {
                this.selCMEo = store.select('selectedcmeo');
                this.selCMEl = store.select('selectedcmel');
              }

  public ngOnInit() {
  }

  public getState(button) {
    let selElem;
    if (button.cat === 'tbline') {
      selElem = this.selCMEl;
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
      });
    } else {
      button.active = false;
    }
    // console.log(button.active);
    if (button.active === true) {
      return 'btnclick';
    } else {
      return 'btnidle';
    }
  }

  public clicked(button) {
    let action = {
      variable: button.variable,
      value: button.value
    };
    console.log(button.value);
    if (button.cat === 'tbline') {
      this.elementService.changeCMEl(action);
    } else {
      this.elementService.changeCMEo(action);
    }
  }
}
