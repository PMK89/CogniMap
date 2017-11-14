import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';

// models and reducers
import { CMTBLine } from '../../models/CMTBLine';
import { CMStore } from '../../models/CMStore';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';
import { CMSettings } from '../../models/CMSettings';

@Component({
  selector: 'app-tb-line',
  templateUrl: './tb-line.component.html',
  styleUrls: ['./tb-line.component.scss']
})
export class TbLineComponent implements OnInit {
  @Input() public cmtbline: CMTBLine;
  public cmsettings: CMSettings;
  public buttons: Observable<CMButton[]>;
  public colors: Observable<CMColorbar[]>;
  public selCMEl: any;

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.colors = store.select('colors');
                this.settingsService.cmsettings
                      .subscribe((data) => {
                        if (data) {
                          this.cmsettings = data;
                        }
                      });
              }

  public ngOnInit() {
  }

  // changes mode in settings
  public changeMode(selector: string) {
    if (this.cmsettings.mode === selector && this.cmsettings.mode !== 'edit') {
      this.cmsettings.mode = 'edit';
    } else {
      this.cmsettings.mode = selector;
    }
    // console.log(this.cmsettings);
    this.settingsService.updateSettings(this.cmsettings);
  }

  // mark selection
  public selectionStyle(selector) {
    if (this.cmsettings.mode === selector) {
      let style: Object = {'background-color': '#ff0000'};
      // console.log('selectionStyle: ', style);
      return style;
    } else {
      let style: Object = {'background-color': '#ffffff'};
      return style;
    }
  }

  public delselCMEl() {
    if (this.elementService.selCMEl) {
      this.elementService.delCME(this.elementService.selCMEl.id);
    }
  }

}
