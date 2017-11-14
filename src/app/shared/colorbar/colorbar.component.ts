import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import { Store } from '@ngrx/store';
import { ElementService } from'../element.service';
import { SettingsService } from'../settings.service';

// models and reducers
import { CMElement } from '../../models/CMElement';
import { CMColorbar } from'../../models/CMColorbar';
import { CMAction } from'../../models/CMAction';
import { CMStore } from '../../models/CMStore';

@Component({
  selector: 'app-colorbar',
  templateUrl: './colorbar.component.html',
  styleUrls: ['./colorbar.component.scss']
})
export class ColorbarComponent implements OnInit {
  @Input() selector: string;
  @Input() colorbars: Observable<Array<CMColorbar>>;
  action: CMAction;
  color: string;
  value: string;
  currentElement: Observable<CMElement>;
  @ViewChild('colorpick') colorpick: ElementRef;

  constructor(private elementService: ElementService,
              private settingsService: SettingsService,
              private store: Store<CMStore>) {
                this.currentElement = store.select('selectedElement');
               }

  ngOnInit() {
  }

  changecolor(colorbar) {
    this.color = this.colorpick.nativeElement.value;
    for (let i = 0; i < 9; i++) {
      colorbar.colors[9 - i] = colorbar.colors[8 - i];
    }
    colorbar.colors[0] = this.color;
    this.setcolor(colorbar, this.color);
  }

  getcolor(colorbar) {
    if (this.currentElement) {
      this.currentElement.subscribe(cmelement => {
        if (cmelement) {
          let n = colorbar.var.length;
          switch (n) {
            case 1:
              this.value = cmelement[colorbar.var[0]];
              break;
            case 2:
              this.value = cmelement[colorbar.var[0]][colorbar.var[1]];
              break;
            case 3:
              this.value = cmelement[colorbar.var[0]][colorbar.var[1]][colorbar.var[2]];
              break;
            case 4:
              this.value = cmelement[colorbar.var[0]][colorbar.var[1]][colorbar.var[2]][colorbar.var[3]];
              break;
          }
        } else {
          this.value = colorbar.colors[0];
        }
      });
    } else {
      this.value = colorbar.colors[0];
    }
    return this.value;
  }

  setcolor(colorbar, color) {
    this.action = {
      var: colorbar.var,
      value: color
    };
    this.elementService.changeElement(this.action);
  }

}
