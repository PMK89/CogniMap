import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../shared/settings.service';
// import { SButtonComponent } from '../../shared/s-button/s-button.component';

// models and reducers
import { CMTBObject } from '../../models/CMTBObject';
import { CMStore } from '../../models/CMStore';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';

@Component({
  selector: 'app-tb-object',
  templateUrl: './tb-object.component.html',
  styleUrls: ['./tb-object.component.scss']
})
export class TbObjectComponent implements OnInit {
  @Input() cmtbobject: CMTBObject;
  buttons: Observable<Array<CMButton>>;
  colors: Observable<Array<CMColorbar>>;

  constructor(private settingsService: SettingsService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.colors = store.select('colors');
              }

  ngOnInit() {
  }

}
