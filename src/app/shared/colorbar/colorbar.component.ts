import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import { Store } from '@ngrx/store';
import { ElementService } from'../element.service';
import { SettingsService } from'../settings.service';
import { MjEditorService } from'../../widgets/mjeditor/mjeditor.service';

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
  public loccolorbars = [];
  public color: string;
  public value: string;
  public selCMEo: Observable<CMEo>;
  public selCMEl: Observable<CMEl>;
  public mode = 'colors';
  public selectcolor: string;
  public maxid = 0;
  public copiedcolor = false;
  @ViewChild('colorpick') public colorpick: ElementRef;

  constructor(private elementService: ElementService,
              private settingsService: SettingsService,
              private mjEditorService: MjEditorService,
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

  // changes the selected color
  public changecolorclick(colorbar) {
    if (this.copiedcolor) {
      this.copiedcolor = false;
      this.changecolor(colorbar);
    }
  }

  public getcolor(colorbar) {
    this.selectcolor = colorbar.id.toString();
    let selElem;
    if (colorbar.cat === 'tbline0' || colorbar.cat === 'tbline1') {
      selElem = this.selCMEl;
    } else if (colorbar.cat !== 'latex' && colorbar.cat !== 'mnemo') {
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
      if (colorbar.cat === 'latex') {
        if (this.elementService.cmsettings) {
          this.value = this.elementService.cmsettings.latexcolor;
        }
      } else if (colorbar.cat === 'mnemo') {
        if (this.elementService.cmsettings) {
          this.value = this.elementService.cmsettings.mnemocolor;
        }
      } else {
        this.value = colorbar.colors[0];
      }
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
    } else if (colorbar.cat === 'latex') {
      let settings = this.elementService.cmsettings;
      settings.latexcolor = color;
      this.settingsService.updateSettings(settings);
    } else if (colorbar.cat === 'mnemo') {
      let settings = this.elementService.cmsettings;
      settings.mnemocolor = color;
      this.settingsService.updateSettings(settings);
    } else {
      this.elementService.changeCMEo(this.action);
    }
  }

  // saves colorbar under entered name
  public saveColors(name: string, colorbar0) {
    let fuckingcolorbar = JSON.parse(JSON.stringify(colorbar0));
    fuckingcolorbar.name = name;
    this.settingsService.newColors(fuckingcolorbar);
    this.mode = 'colors';
  }

  // sets colorbar mode under entered name
  public setmode(name: string) {
    if (this.mode === name) {
      this.mode = 'colors';
    } else {
      this.mode = name;
    }
  }

  // copy color from actual selection
  public copycolor() {
    if (this.value) {
      if (this.elementService.cmsettings) {
        this.elementService.cmsettings.copycolor = this.value;
        this.settingsService.updateSettings(this.elementService.cmsettings);
      }
    }
  }

  // paste color from settings
  public pastecolor() {
    if (this.elementService.cmsettings) {
      if (this.elementService.cmsettings.copycolor) {
        this.copiedcolor = true;
        this.value = this.elementService.cmsettings.copycolor;
        this.colorpick.nativeElement.value = this.value;
      }
    }
  }

  // changes the selected color
  public changeColorbar() {
    this.colorbars.subscribe((colorbar) => {
      if (colorbar) {
        for (let key in colorbar) {
          if (colorbar[key]) {
            if (colorbar[key].cat === this.selector) {
              if (colorbar[key].id === parseInt(this.selectcolor, 10)) {
                colorbar[key].prio = 0;
              } else if (colorbar[key].prio === 0) {
                colorbar[key].prio += 1;
              }
            }
            this.loccolorbars.push(colorbar[key]);
          }
        }
        console.log(this.loccolorbars);
        this.settingsService.changeAllColors(this.loccolorbars);
        this.loccolorbars = [];
        this.mode = 'colors';
      }
    }).unsubscribe();
  }

  public getState() {
    if (this.colorbars) {
      this.colorbars.subscribe((colorbar) => {
        if (colorbar) {
          for (let key in colorbar) {
            if (colorbar[key]) {
              if (colorbar[key].prio === 0 && colorbar[key].cat === this.selector) {
                this.selectcolor = colorbar[key].id.toString();
              }
            }
          }
        }
      }).unsubscribe();
    }
  }

}
