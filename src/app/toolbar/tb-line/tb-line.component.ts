import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../shared/settings.service';

// models and reducers
import { CMTBLine } from '../../models/CMTBLine';
import { CMStore } from '../../models/CMStore';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';

@Component({
  selector: 'app-tb-line',
  templateUrl: './tb-line.component.html',
  styleUrls: ['./tb-line.component.scss']
})
export class TbLineComponent implements OnInit {
  @Input() cmtbline: CMTBLine;
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
