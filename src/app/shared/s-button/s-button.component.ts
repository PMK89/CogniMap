import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ElementService } from'../element.service';

// models and reducers
import { CMButton } from '../../models/CMButton';
import { CMElement } from '../../models/CMElement';
import { CMStore } from '../../models/CMStore';

@Component({
  selector: 'app-s-button',
  templateUrl: './s-button.component.html',
  styleUrls: ['./s-button.component.css']
})
export class SButtonComponent implements OnInit {
  @Input() buttons: Observable<Array<CMButton>>;
  @Input() selector: number;
  currentElement: Observable<CMElement>;

  constructor(private elementService: ElementService,
              private store: Store<CMStore>) {
                this.currentElement = store.select('selectedElement');
              }

  ngOnInit() {
  }

  getState(button) {
    if (this.currentElement) {
      this.currentElement.subscribe(cmelement => {
        if (cmelement) {
          let n = button.var.length;
          switch (n) {
            case 1:
              if (cmelement[button.var[0]] === button.value) {
                button.active = true;
              } else {
                button.active = false;
              };
              break;
            case 2:
              if (cmelement[button.var[0]][button.var[1]] === button.value) {
                button.active = true;
              } else {
                button.active = false;
              };
              break;
            case 3:
              if (cmelement[button.var[0]][button.var[1]][button.var[2]] === button.value) {
                button.active = true;
              } else {
                button.active = false;
              };
              break;
            case 4:
              if (cmelement[button.var[0]][button.var[1]][button.var[2]][button.var[3]] === button.value) {
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

  clicked(button) {
    this.elementService.changeElement(button);
  }
}
