import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from '../../shared/settings.service';
import { SButtonComponent } from '../../shared/s-button/s-button.component';

// models and reducers
import { CMTBLine } from '../../models/CMTBLine';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';

@Component({
  selector: 'app-tb-line',
  templateUrl: './tb-line.component.html',
  styleUrls: ['./tb-line.component.scss']
})
export class TbLineComponent implements OnInit {
  @Input() cmtbline: CMTBLine;

  constructor() { }

  ngOnInit() {
  }

}
