import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../shared/settings.service';

// models and reducers
import { CMTBFont } from '../../models/CMTBFont';
import { CMStore } from '../../models/CMStore';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';

@Component({
  selector: 'app-tb-font',
  templateUrl: './tb-font.component.html',
  styleUrls: ['./tb-font.component.scss']
})
export class TbFontComponent implements OnInit {
  @Input() cmtbfont: CMTBFont;
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
