import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';

// services
import { SettingsService } from '../shared/settings.service';

// models and reducers
import { CMStore } from '../models/CMStore';
import { CMSettings } from '../models/CMSettings';
import { CMButton } from '../models/CMButton';

@Component({
  selector: 'app-toolbar0',
  templateUrl: './toolbar0.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class Toolbar0Component implements OnInit {
  public cmsettings: CMSettings;
  public buttons: Observable<CMButton[]>;
  public mode = '';

  constructor(private settingsService: SettingsService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.settingsService.cmsettings
                      .subscribe((data) => {
                        this.cmsettings = data;
                        if (this.cmsettings.mode === 'quizing') {
                          this.mode = 'quizing';
                        } else {
                          this.mode = '';
                        }
                        // console.log(data);
                      });
              }

  public ngOnInit() {
  }

  // changes mode in settings
  public changeMode(selector: string) {
    this.cmsettings.mode = selector;
    console.log(this.cmsettings);
    this.settingsService.updateSettings(this.cmsettings);
  }

}
