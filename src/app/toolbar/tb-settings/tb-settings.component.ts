import { Component, OnInit, Input } from '@angular/core';

import { SettingsService } from '../../shared/settings.service';
// models and reducers
import { CMSettings } from '../../models/CMSettings';

@Component({
  selector: 'app-tb-settings',
  templateUrl: './tb-settings.component.html',
  styleUrls: ['./tb-settings.component.scss']
})
export class TbSettingsComponent implements OnInit {
  @Input() public cmsettings: CMSettings;

  constructor(private settingsService: SettingsService) {
    this.settingsService.cmsettings
        .subscribe((data) => {
          this.cmsettings = data;
          // console.log(data);
        });
  }

  public ngOnInit() { }

  // changes mode in settings
  public changeMode(selector: string) {
    this.cmsettings.mode = selector;
    console.log(this.cmsettings);
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

}
