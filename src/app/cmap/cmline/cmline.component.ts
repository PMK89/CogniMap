import { Component, OnInit, Input } from '@angular/core';

import { SnapsvgService } from '../../shared/snapsvg.service';
import { ElementService } from '../../shared/element.service';

import { CMElement } from '../../models/CMElement';

@Component({
  selector: 'app-cmline',
  templateUrl: './cmline.component.html',
  styleUrls: ['./cmline.component.scss']
})

// generates the connection between the markers by calling snapsvg services
export class CmlineComponent implements OnInit {
  @Input() cmelement: CMElement;


  constructor(private snapsvgService: SnapsvgService,
              private elementService: ElementService) { }

  ngOnInit() {
    this.snapsvgService.makeShape(this.cmelement);
    /*
    if(this.cmelement.active) {
      this.elementService.newDBElement(this.cmelement);
      console.log('line emitted')
    }*/
  }

}
