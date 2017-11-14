import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// services
import { SettingsService } from '../shared/settings.service';
import { WindowService } from '../shared/window.service';

// models and reducers
import { CMStore } from '../models/CMStore';
import { CMSettings } from '../models/CMSettings';

@Component({
  selector: 'app-toolbar0',
  templateUrl: './toolbar0.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class Toolbar0Component implements OnInit {
  public cmsettings: CMSettings;

  constructor(private settingsService: SettingsService,
              private windowService: WindowService,
              private store: Store<CMStore>) {
                this.settingsService.cmsettings
                      .subscribe((data) => {
                        this.cmsettings = data;
                        // console.log(data);
                      });
              }

  public ngOnInit() {
  }

  // Scrolls to starting point
  public scrollStart() {
    this.windowService.scrollXY(5000, 100000);
  }

  // changes mode in settings
  public changeMode(selector: string) {
    this.cmsettings.mode = selector;
    console.log(this.cmsettings);
    this.settingsService.updateSettings(this.cmsettings);
  }

}
