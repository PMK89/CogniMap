import { Component, OnInit, Input } from '@angular/core';
import { CMMarker } from '../../models/CMMarker';
import { CMElement } from '../../models/CMElement';
import { WindowService } from '../../shared/window.service';

@Component({
  selector: 'app-cmmarker',
  templateUrl: './cmmarker.component.html',
  styleUrls: ['./cmmarker.component.scss']
})
export class CmmarkerComponent implements OnInit {
  @Input() cmmarker: CMMarker;
  @Input() cmelement: CMElement;

  constructor(private windowService: WindowService) { }

  // Scrolls to given position
  scrollXY(x, y) {
    this.windowService.scrollXY(x, y);
  }

  ngOnInit() {
  }

}
