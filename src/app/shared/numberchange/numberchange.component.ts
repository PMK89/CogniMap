import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ElementService } from'../element.service';
import { SettingsService } from'../settings.service';

// models and reducers
import { CMButton } from '../../models/CMButton';
import { CMEo } from '../../models/CMEo';
import { CMEl } from '../../models/CMEl';
import { CMStore } from '../../models/CMStore';

@Component({
  selector: 'app-numberchange',
  templateUrl: './numberchange.component.html',
  styleUrls: ['./numberchange.component.scss']
})

export class NumberchangeComponent implements OnInit {
  @Input() public buttons: Observable<CMButton[]>;
  @Input() public selector: number;
  public value = 1;
  public button: CMButton;
  public selCMEo: Observable<CMEo>;
  public selCMEl: Observable<CMEl>;

  constructor(private elementService: ElementService,
              private settingsService: SettingsService,
              private store: Store<CMStore>
              ) {
                this.selCMEo = store.select('selectedcmeo');
                this.selCMEl = store.select('selectedcmel');
               }

  public ngOnInit() {
  }

  // handles changes by increase and decrease button
  public changenumber(num) {
    let action = {
      value: this.value + num,
      variable: this.button.variable
    };
    this.value = this.value + num;
    if (this.button.cat === 'tbline') {
      this.setnumberl(action);
    } else {
      this.setnumbero(action);
    }
    // console.log(action);
  }

  // handles changes by increase and decrease button
  public writenumber(value) {
    let num = Math.round(parseInt(value, 10) * 10 ) * 0.1;
    let action = {
      value: num,
      variable: this.button.variable
    };
    this.value = num;
    if (this.button.cat === 'tbline') {
      this.setnumberl(action);
    } else {
      this.setnumbero(action);
    }
    // console.log(action);
  }

  // Sets number
  public setbutton(button) {
    // console.log('button');
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
              this.value = cmelement[button.variable[0]];
              break;
            case 2:
              this.value = cmelement[button.variable[0]][button.variable[1]];
              break;
            case 3:
              this.value = cmelement[button.variable[0]][button.variable[1]][button.variable[2]];
              break;
            case 4:
              this.value = cmelement[button.variable[0]][button.variable[1]][button.variable[2]][button.variable[3]];
              break;
            default:
              this.value = 1;
          }
          if (!this.value) {
            this.value = 0;
          }
        }
      }).unsubscribe();
    }
    this.button = button;
  }

  // Sets number on CMEo
  public setnumbero(action) {
    this.elementService.changeCMEo(action);
  }

  // Sets number on CMEl
  public setnumberl(action) {
    this.elementService.changeCMEl(action);
  }

}
