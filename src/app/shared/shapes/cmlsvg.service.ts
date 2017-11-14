import { Injectable } from '@angular/core';

@Injectable()
export class CmlsvgService {

  constructor() { }


    // creates a straigth line between two point
    createLine(cme, cmsvg) {
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x1 + ' ' + cme.y1;
      let p = cmsvg.path(path);
      p.attr({
        fill: 'none',
        stroke: cme.cmline.color0,
        strokeWidth: cme.cmline.size0,
        id: 'svg' + cme.id.toString(),
      });
      p.mousedown(function( ){
        document.getElementById('TPid').title = cme.id;
        // console.log(document.getElementById('TPid').title);
      });
      // console.log(path);
    }

    // creates a edged line between two point
    createEdge(cme, cmsvg) {
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x0 + ' ' + cme.y1 + 'L' + cme.x1 + ' ' + cme.y1;
      let p = cmsvg.path(path);
      p.attr({
        fill: 'none',
        stroke: cme.cmline.color0,
        strokeWidth: cme.cmline.size0,
        id: 'svg' + cme.id.toString(),
      });
      p.mousedown(function( ){
        document.getElementById('TPid').title = cme.id;
        // console.log(document.getElementById('TPid').title);
      });
      // console.log(this.svgCanvas);
    }

    // creates a straigth line between two point
    createCurve(cme, cmsvg) {

    }

}
