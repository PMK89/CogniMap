import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';

// services
import { SettingsService } from '../shared/settings.service';

// models and reducers
import { CMSettings } from '../models/CMSettings';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  public cmsettings: CMSettings;

  constructor(private settingsService: SettingsService) {
                this.settingsService.cmsettings
                  .subscribe(
                    (data) => {
                      if (data) {
                        this.cmsettings = data;
                      }
                    },
                    (error) => console.log(error)
                  );
              }

  public ngOnInit() {
  }

}
