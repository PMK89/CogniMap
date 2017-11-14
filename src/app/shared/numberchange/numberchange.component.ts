import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ElementService } from'../element.service';
import { SettingsService } from'../settings.service';

// models and reducers
import { CMButton } from '../../models/CMButton';
import { CMElement } from '../../models/CMElement';
import { CMStore } from '../../models/CMStore';


@Component({
  selector: 'app-numberchange',
  templateUrl: './numberchange.component.html',
  styleUrls: ['./numberchange.component.scss']
})

export class NumberchangeComponent implements OnInit {
  @Input() buttons: Observable<Array<CMButton>>;
  @Input() selector: number;
  value: number;
  button: CMButton;
  currentElement: Observable<CMElement>;

  constructor(private elementService: ElementService,
              private settingsService: SettingsService,
              private store: Store<CMStore>
              ) {
                this.currentElement = store.select('selectedElement');
               }

  ngOnInit() {
  }

  // handles changes by increase and decrease button
  changenumber(num) {
    let action = {
      value: this.value + num,
      var: this.button.var
    };
    this.value = this.value + num;
    this.setnumber(action);
    // console.log(action);
  }

  // handles changes by increase and decrease button
  writenumber(value) {
    let num = Math.round(parseInt(value, 10) * 10 ) * 0.1;
    let action = {
      value: num,
      var: this.button.var
    };
    this.value = num;
    this.setnumber(action);
    // console.log(action);
  }

  // Sets number
  setbutton(button) {
    // console.log('button');
    if (this.currentElement) {
      this.currentElement.subscribe(cmelement => {
        if (cmelement) {
          let n = button.var.length;
          switch (n) {
            case 1:
              this.value = cmelement[button.var[0]];
              break;
            case 2:
              this.value = cmelement[button.var[0]][button.var[1]];
              break;
            case 3:
              this.value = cmelement[button.var[0]][button.var[1]][button.var[2]];
              break;
            case 4:
              this.value = cmelement[button.var[0]][button.var[1]][button.var[2]][button.var[3]];
              break;
          }
        }
      });
    }
    this.button = button;
  }

  // Sets number
  setnumber(action) {
    this.elementService.changeElement(action);
  }

}
