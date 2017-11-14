import { Component, Input, OnInit } from '@angular/core';
import 'snapsvg';
declare var Snap: any;

// models and reducers
import { CMElement } from '../../models/CMElement';

@Component({
  selector: 'app-shape',
  templateUrl: './shape.component.html',
  styleUrls: ['./shape.component.scss']
})
export class ShapeComponent implements OnInit {
  @Input() cmelement: CMElement;
  svgCanvas;
  cmsvg;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  width: number;
  height: number;
  stroke: string;
  d: string;

  constructor() { }

  ngOnInit() {
    this.cmsvg = Snap('#cmsvg');
    if (this.cmelement.prep !== '' && this.cmelement.prep !== undefined) {
      console.log('prep');
      Snap.parse(this.cmelement.prep);
    } else {
      if (this.cmelement.id > 1) {
        this.objectSvg(this.cmelement);
      } else if (this.cmelement.id < 1) {
        this.lineSvg(this.cmelement);
      } else {
        console.log('no matching element');
      }
    }
  }

  // called for object elements
  objectSvg(cme: CMElement) {

    // Lets create big circle in the middle:
    let bigCircle = this.svgCanvas.circle(150, 150, 100);
    // By default its black, lets change its attributes
    bigCircle.attr({
      fill: '#bada55',
      stroke: '#000',
      strokeWidth: 5
    });
    // Now lets create another small circle:
    let smallCircle = this.svgCanvas.circle(100, 150, 70);
  }

  // called for line elements
  lineSvg(cme: CMElement) {
    this.x0 = this.cmelement.x0;
    this.x1 = this.cmelement.x1;
    this.y0 = this.cmelement.y0;
    this.y1 = this.cmelement.y1;
    switch (this.cmelement.cmline.shape) {
      case 'e':
        this.createEdge(this.cmelement);
        break;
      case 'c':
        this.createCurve(this.cmelement);
        break;
      default:
        this.createLine(this.cmelement);
    }

  }

  // creates a straigth line between two point
  createLine(cme) {
    let path = 'M' + this.x0 + ' ' + this.y0 + 'L' + this.x1
            + ' ' + this.y1;
    let p = this.cmsvg.path(path);
    p.attr({
      fill: 'none',
      stroke: cme.cmline.color0,
      strokeWidth: cme.cmline.size0,
    });
    p.mousedown(function( ){
      document.getElementById('TPid').title = cme.id;
      // console.log(document.getElementById('TPid').title);
    });
    // console.log(path);
  }

  // creates a edged line between two point
  createEdge(cme) {
    let path = this.d = 'M' + this.x1 + ' ' + this.y1 + 'L' + this.x1 + ' ' +
    (this.height - this.y1) + 'L' + (this.width - this.x1) + ' ' + (this.height - this.y1);
    let p = this.cmsvg.path(path);
    p.attr({
      fill: 'none',
      stroke: cme.cmline.color0,
      strokeWidth: cme.cmline.size0,
    });
    // console.log(this.svgCanvas);
  }

  // creates a straigth line between two point
  createCurve(cmelement) {

  }

}
