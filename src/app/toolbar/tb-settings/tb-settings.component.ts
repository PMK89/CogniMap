import { Component, OnInit, Input } from '@angular/core';
import { SButtonComponent } from '../../shared/s-button/s-button.component';

import { SettingsService } from '../../shared/settings.service';
// models and reducers
import { CMSettings } from '../../models/CMSettings';

@Component({
  selector: 'app-tb-settings',
  templateUrl: './tb-settings.component.html',
  styleUrls: ['./tb-settings.component.scss']
})
export class TbSettingsComponent implements OnInit {
  @Input() cmsettings: CMSettings;

  constructor(private settingsService: SettingsService) {
    this.settingsService.cmsettings
        .subscribe(data => {
          this.cmsettings = data;
          // console.log(data);
        });
  }

  ngOnInit() {
  }

  // changes mode in settings
  changeMode(selector: string) {
    this.cmsettings.mode = selector;
    console.log(this.cmsettings);
    this.settingsService.updateSettings(this.cmsettings);
  }

  // changes drag in settings
  changeDrag() {
    let drag = this.cmsettings.dragging;
    if (drag === true) {
      this.cmsettings.dragging = false;
    } else {
      this.cmsettings.dragging = true;
    }
    this.settingsService.updateSettings(this.cmsettings);
  }

  // mark selection
  selectionStyle(selector) {
    if (this.cmsettings.mode === selector) {
      let style: Object = {'background-color': '#ff0000'};
      // console.log('selectionStyle: ', style);
      return style;
    } else {
      let style: Object = {'background-color': '#ffffff'};
      return style;
    }
  }

  // mark drag
  selectionDrag() {
    if (this.cmsettings.dragging === true) {
      // console.log('selectionDrag');
      return {'background-color': '#ff0000'};
    } else {
      return {'background-color': '#ffffff'};
    }
  }

}
