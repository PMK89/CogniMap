import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import { Store } from '@ngrx/store';
import { ElementService } from'../element.service';
import { SettingsService } from'../settings.service';

// models and reducers
import { CMEo } from '../../models/CMEo';
import { CMEl } from '../../models/CMEl';
import { CMColorbar } from'../../models/CMColorbar';
import { CMAction } from'../../models/CMAction';
import { CMStore } from '../../models/CMStore';

@Component({
  selector: 'app-colorbar',
  templateUrl: './colorbar.component.html',
  styleUrls: ['./colorbar.component.scss']
})
export class ColorbarComponent implements OnInit {
  @Input() public selector: string;
  @Input() public colorbars: Observable<CMColorbar[]>;
  public action: CMAction;
  public color: string;
  public value: string;
  public selCMEo: Observable<CMEo>;
  public selCMEl: Observable<CMEl>;
  public mode = 'colors';
  @ViewChild('colorpick') public colorpick: ElementRef;

  constructor(private elementService: ElementService,
              private settingsService: SettingsService,
              private store: Store<CMStore>) {
                this.selCMEo = store.select('selectedcmeo');
                this.selCMEl = store.select('selectedcmel');
               }

  public ngOnInit() {
  }

  // changes the selected color
  public changecolor(colorbar) {
    this.color = this.colorpick.nativeElement.value;
    for (let i = 0; i < 9; i++) {
      colorbar.colors[9 - i] = colorbar.colors[8 - i];
    }
    colorbar.colors[0] = this.color;
    this.setcolor(colorbar, this.color);
    this.settingsService.changeColors(colorbar);
  }

  public getcolor(colorbar) {
    let selElem;
    if (colorbar.cat === 'tbline0' || colorbar.cat === 'tbline1') {
      selElem = this.selCMEl;
    } else {
      selElem = this.selCMEo;
    }
    // console.log(selElem);
    if (selElem) {
      selElem.subscribe((cmelement) => {
        if (cmelement) {
          let n = colorbar.variable.length;
          switch (n) {
            case 1:
              this.value = cmelement[colorbar.variable[0]];
              break;
            case 2:
              this.value = cmelement[colorbar.variable[0]][colorbar.variable[1]];
              break;
            case 3:
              this.value = cmelement[colorbar.variable[0]][colorbar.variable[1]][colorbar.variable[2]];
              break;
            case 4:
              this.value = cmelement[colorbar.variable[0]][colorbar.variable[1]][colorbar.variable[2]][colorbar.variable[3]];
              break;
            default:
              this.value = '#ffffff';
          }
        } else {
          this.value = colorbar.colors[0];
        }
      }).unsubscribe();
    } else {
      this.value = colorbar.colors[0];
    }
    return this.value;
  }

  public setcolor(colorbar, color) {
    this.action = {
      variable: colorbar.variable,
      value: color
    };
    if (colorbar.cat === 'tbline0' || colorbar.cat === 'tbline1') {
      this.elementService.changeCMEl(this.action);
    } else {
      this.elementService.changeCMEo(this.action);
    }
  }

  // saves colorbar under entered name
  public saveColors(name: string, colorbar) {
    console.log(name, colorbar);
  }

  // sets colorbar mode under entered name
  public setmode(name: string) {
    if (this.mode === name) {
      this.mode = 'colors';
    } else {
      this.mode = name;
    }
  }

}
