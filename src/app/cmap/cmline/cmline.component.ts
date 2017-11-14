import { Component, OnInit, Input } from '@angular/core';

import { SnapsvgService } from '../../shared/snapsvg.service';

import { CMElement } from '../../models/CMElement';

@Component({
  selector: 'app-cmline',
  templateUrl: './cmline.component.html',
  styleUrls: ['./cmline.component.scss']
})

// generates the connection between the markers by calling snapsvg services
export class CmlineComponent implements OnInit {
  @Input() cmelement: CMElement;

  constructor(private snapsvgService: SnapsvgService) { }

  ngOnInit() {
    this.snapsvgService.makeShape(this.cmelement);
  }

}
