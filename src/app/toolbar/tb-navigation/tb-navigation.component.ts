import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from '../../shared/settings.service';
// models and reducers
import { CMSettings } from '../../models/CMSettings';

@Component({
  selector: 'app-tb-navigation',
  templateUrl: './tb-navigation.component.html',
  styleUrls: ['./tb-navigation.component.scss']
})
export class TbNavigationComponent implements OnInit {
  @Input() public cmsettings: CMSettings;
  public widget0: string;
  public widget1: string;
  public widgets: string[] = ['none', 'equation', 'formula', 'svg', 'media'];

  constructor(private settingsService: SettingsService) {
    this.settingsService.cmsettings
          .subscribe((data) => {
            if (data) {
              this.cmsettings = data;
              // console.log(data);
              this.widget0 = this.cmsettings.widget0;
              this.widget1 = this.cmsettings.widget1;
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

  // changes widget in settings
  public changeWidget(num: number) {
    if (num === 0) {
      this.cmsettings.widget0 = this.widget0;
      if (this.widget0 === 'none') {
        this.cmsettings.wlayout0.display = 'none';
      } else {
        this.cmsettings.wlayout0.display = 'block';
      }
    } else {
      this.cmsettings.widget1 = this.widget1;
      if (this.widget1 === 'none') {
        this.cmsettings.wlayout1.display = 'none';
      } else {
        this.cmsettings.wlayout1.display = 'block';
      }
    }
    console.log('changeWidget: ', this.cmsettings);
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
