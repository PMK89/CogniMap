import { Injectable } from '@angular/core';
import { ElementService } from '../element.service';
declare var Snap: any;

@Injectable()
export class CmlsvgService {

  constructor(private elementService: ElementService) {}

    // creates a straigth line between two point
    public createLine(cme, cmsvg, cmg) {
      let p;
      let id = cme.id.toString();
      if (cme.id > -1) {
        id = id.replace('.', '_');
      }
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x1 + ' ' + cme.y1;
      p = cmsvg.path(path);
      p.attr({
        fill: 'none',
        stroke: cme.cmobject.color0,
        strokeWidth: cme.cmobject.size0,
        id: 'cms' + id,
      });
      cmg.add(p);
    }

    // creates a edged line between two point
    public createEdge(cme, cmsvg, cmg) {
      let p;
      let id = cme.id.toString();
      if (cme.id > -1) {
        id = id.replace('.', '_');
      }
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x0 +
       ' ' + cme.y1 + 'L' + cme.x1 + ' ' + cme.y1;
      p = cmsvg.path(path);
      p.attr({
        fill: 'none',
        stroke: cme.cmobject.color0,
        strokeWidth: cme.cmobject.size0,
        id: 'cms' + id,
      });
      cmg.add(p);
    }

    // creates a cubic bezier curve between two point
    public createCurve(cme, cmsvg, cmg) {
      let p;
      let id = cme.id.toString();
      if (cme.id > -1) {
        id = id.replace('.', '_');
      }
      let width = (cme.x1 - cme.x0);
      let height = (cme.y1 - cme.y0);
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'C' + cme.x0 + ' ' + (cme.y0 + (height / 2))
       + ' ' + (cme.x1 - (width / 2)) + ' ' + cme.y1 + ' ' + cme.x1 + ' ' + cme.y1;
      p = cmsvg.path(path);
      p.attr({
        fill: 'none',
        stroke: cme.cmobject.color0,
        strokeWidth: cme.cmobject.size0,
        id: 'cms' + id,
      });
      cmg.add(p);
    }

    // creates a s shapedcubic bezier curve between two point
    public createSCurve(cme, cmsvg, cmg) {
      let p;
      let id = cme.id.toString();
      if (cme.id > -1) {
        id = id.replace('.', '_');
      }
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'C' + cme.x1 + ' ' + cme.y0
       + ' ' + cme.x0 + ' ' + cme.y1 + ' ' + cme.x1 + ' ' + cme.y1;
      p = cmsvg.path(path);
      p.attr({
        fill: 'none',
        stroke: cme.cmobject.color0,
        strokeWidth: cme.cmobject.size0,
        id: 'cms' + id,
      });
      cmg.add(p);
    }

}
