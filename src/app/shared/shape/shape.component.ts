import { Component, OnInit } from '@angular/core';
import 'snapsvg';
declare var Snap: any;

@Component({
  selector: 'app-shape',
  templateUrl: './shape.component.html',
  styleUrls: ['./shape.component.scss']
})
export class ShapeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.createSvg();
  }

  createSvg() {

    let svgCanvas;
    svgCanvas = Snap('#svg');

    // Lets create big circle in the middle:
    let bigCircle = svgCanvas.circle(150, 150, 100);
    // By default its black, lets change its attributes
    bigCircle.attr({
      fill: '#bada55',
      stroke: '#000',
      strokeWidth: 5
    });
    // Now lets create another small circle:
    let smallCircle = svgCanvas.circle(100, 150, 70);

}

}
