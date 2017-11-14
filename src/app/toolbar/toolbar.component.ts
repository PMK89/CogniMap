import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// services
import { SettingsService } from '../shared/settings.service';

// models and reducers
import { CMEStore } from '../models/cmestore';
import { CMSettings } from '../models/CMSettings';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  cmsettings: Observable<CMSettings>;

  constructor(private elementService: SettingsService,
              private store: Store<CMEStore>) {
                this.cmsettings = store.select('settings');
              }


  ngOnInit() {
  }

}
