import { Component, OnInit, Input } from '@angular/core';
import { SButtonComponent } from '../../shared/s-button/s-button.component';

// models and reducers
import { CMSettings } from '../../models/CMSettings';

@Component({
  selector: 'app-tb-settings',
  templateUrl: './tb-settings.component.html',
  styleUrls: ['./tb-settings.component.scss']
})
export class TbSettingsComponent implements OnInit {
  @Input() cmsettings: CMSettings;

  constructor() { }

  ngOnInit() {
  }

}
