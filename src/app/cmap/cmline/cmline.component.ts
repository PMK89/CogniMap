import { Component, OnInit, Input } from '@angular/core';
import { CMElement } from '../../models/element';

@Component({
  selector: 'app-cmline',
  templateUrl: './cmline.component.html',
  styleUrls: ['./cmline.component.scss']
})
export class CmlineComponent implements OnInit {
  @Input() cmelement: CMElement;
  svgStyle: Object;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  width: number;
  height: number;
  stroke: string;
  d: string;
  strokewidth: number;

  constructor() { }

  ngOnInit() {
    if (this.cmelement) {
      // defines corners of line
      if (this.cmelement.x1 >= this.cmelement.x0) {
        this.x0 = this.cmelement.x0;
        this.width = this.cmelement.x1 - this.cmelement.x0;
        this.x1 = 0;
      } else {
        this.x0 = this.cmelement.x1;
        this.width = this.cmelement.x0 - this.cmelement.x1;
        this.x1 = this.width;
      }
      if (this.cmelement.y1 >= this.cmelement.y0) {
        this.y0 = this.cmelement.y0;
        this.height = this.cmelement.y1 - this.cmelement.y0;
        this.y1 = 0;
      } else {
        this.y0 = this.cmelement.y1;
        this.height = this.cmelement.y0 - this.cmelement.y1;
        this.y1 = this.height;
      }
      // handles shallow lines so they don't get cut
      if (this.height < this.cmelement.cmline.size0) {
        this.height = this.cmelement.cmline.size0;
        this.y1 = Math.floor(this.height * 0.5);
      }
      if (this.width < this.cmelement.cmline.size0) {
        this.width = this.cmelement.cmline.size0;
        this.x1 = Math.floor(this.width * 0.5);
      }
      // creates div with raw SVG
      this.svgStyle = {
        'position': 'absolute',
        'width': this.width,
        'height': this.height
      };
      if (this.cmelement.cmline.shape === 'e') {
        this.d = 'M' + this.x1 + ' ' + this.y1 + 'L' + this.x1 + ' ' +
        (this.height - this.y1) + 'L' + (this.width - this.x1) + ' ' + (this.height - this.y1);
      } else {
        this.d = 'M' + this.x1 + ' ' + this.y1 + 'L' + (this.width - this.x1) + ' ' + (this.height - this.y1);
      }
      this.stroke = this.cmelement.cmline.color0;
      this.strokewidth = this.cmelement.cmline.size0;
      if (this.width >= 1500 || this.height >= 1000) {
        // this.cmapComponent.passMarker(this.cmelement, this.x0, this.y0, this.x1, this.y1);
      }
    }
  }

}
