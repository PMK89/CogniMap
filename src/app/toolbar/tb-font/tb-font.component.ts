import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from '../../shared/settings.service';
import { SButtonComponent } from '../../shared/s-button/s-button.component';

// models and reducers
import { CMTBFont } from '../../models/CMTBFont';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';

@Component({
  selector: 'app-tb-font',
  templateUrl: './tb-font.component.html',
  styleUrls: ['./tb-font.component.scss']
})
export class TbFontComponent implements OnInit {
  @Input() cmtbfont: CMTBFont;

  constructor() { }

  ngOnInit() {
  }

}
