import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';

// models and reducers
import { CMTBFont } from '../../models/CMTBFont';
import { CMStore } from '../../models/CMStore';
import { CMEo } from '../../models/CMEo';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';

@Component({
  selector: 'app-tb-font',
  templateUrl: './tb-font.component.html',
  styleUrls: ['./tb-font.component.scss']
})
export class TbFontComponent implements OnInit {
  @Input() public cmtbfont: CMTBFont;
  public buttons: Observable<CMButton[]>;
  public colors: Observable<CMColorbar[]>;
  public currentElement: Observable<CMEo>;
  public fontarray: string[] = [
    "'Times New Roman', Times, serif",
    'Arial, Helvetica, sans-serif',
    "'Comic Sans MS', cursive, sans-serif",
    "'Courier New', Courier, monospace",
    "'Monotype Corsiva', 'Apple Chancery', 'ITC Zapf Chancery', 'URW Chancery L', cursive"
  ];
  public cfont: string = this.fontarray[4];

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.colors = store.select('colors');
                this.currentElement = store.select('selectedCMEo');
              }

  public ngOnInit() {
  }

  // changes fontstyle
  public changeFont() {
    let action = {
      variable: ['cmobject', 'style', 'title', 'font'],
      value: this.cfont
    };
    this.elementService.changeCMEo(action);
  }

  // gets Image from clipboard
  public getPicture() {
    this.elementService.getPicture();
  }

  // get fontstyle of currentElement
  public getState() {
    if (this.currentElement) {
      this.currentElement.subscribe((cmelement) => {
        if (cmelement) {
          this.cfont = cmelement.cmobject.style.title.font;
        }
      });
    }
  }
}
