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
      this.addLine(p, id, cmg, cme, cmsvg);
    }

    // creates a straigth line with linear marks between two point
    public createLinLine(cme, cmsvg, cmg) {
      let p;
      let id = cme.id.toString();
      if (cme.id > -1) {
        id = id.replace('.', '_');
      }
      let path0 = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x1 + ' ' + cme.y1;
      p = cmsvg.path(path0);
      let p0len = p.getTotalLength();
      let path = 'M' + cme.x0 + ' ' + cme.y0;
      for (let i = 0; i < 10; i++) {
        let point = p.getPointAtLength(i * p0len / 10);
        let point1 = p.getPointAtLength((i + 1) * p0len / 10);
        let rad = (point.alpha / 180) * Math.PI;
        // console.log(point, rad);
        path += 'L' + (point.x + Math.round(Math.sin(rad) * 2 * cme.cmobject.size0)) + ' ' +
        (point.y + Math.round(Math.cos(rad) * 2 * cme.cmobject.size0)) +
        'L' + (point.x - Math.round(Math.sin(rad) * 2 * cme.cmobject.size0)) + ' '
        + (point.y - Math.round(Math.cos(rad) * 2 * cme.cmobject.size0)) + 'L' +
        point.x + ' ' + point.y + 'L' +  point1.x + ' ' + point1.y;
      }
      let point2  = p.getPointAtLength(p0len);
      let rad1 = (point2.alpha / 180) * Math.PI;
      path += 'L' + (point2.x + Math.round(Math.sin(rad1) * 2 * cme.cmobject.size0)) +
      ' ' + (point2.y + Math.round(Math.cos(rad1) * 2 * cme.cmobject.size0) ) +
      'L' + (point2.x - Math.round(Math.sin(rad1) * 2 * cme.cmobject.size0)) +
      ' ' + (point2.y - Math.round(Math.cos(rad1) * 2 * cme.cmobject.size0)) + 'L' +
      point2.x + ' ' + point2.y;
      p = cmsvg.path(path);
      this.addLine(p, id, cmg, cme, cmsvg);
    }

    // creates a straigth line with logarithmic marks between two point
    public createLogLine(cme, cmsvg, cmg) {
      let p;
      let id = cme.id.toString();
      if (cme.id > -1) {
        id = id.replace('.', '_');
      }
      let path0 = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x1 + ' ' + cme.y1;
      p = cmsvg.path(path0);
      let p0len = p.getTotalLength();
      let path = 'M' + cme.x0 + ' ' + cme.y0;
      for (let i = 1; i < 10; i++) {
        let point = p.getPointAtLength((Math.log(i) /  Math.log(10)) * p0len);
        let point1 = p.getPointAtLength((Math.log(i + 1) /  Math.log(10)) * p0len);
        let rad = (point.alpha / 180) * Math.PI;
        // console.log((Math.log(i) /  Math.log(10)), point, rad);
        path += 'L' + (point.x + Math.round(Math.sin(rad) * 2 * cme.cmobject.size0)) + ' ' +
        (point.y + Math.round(Math.cos(rad) * 2 * cme.cmobject.size0)) +
        'L' + (point.x - Math.round(Math.sin(rad) * 2 * cme.cmobject.size0)) + ' '
        + (point.y - Math.round(Math.cos(rad) * 2 * cme.cmobject.size0)) + 'L' +
        point.x + ' ' + point.y + 'L' +  point1.x + ' ' + point1.y;
      }
      let point2  = p.getPointAtLength(p0len);
      let rad1 = (point2.alpha / 180) * Math.PI;
      path += 'L' + (point2.x + Math.round(Math.sin(rad1) * 2 * cme.cmobject.size0)) +
      ' ' + (point2.y + Math.round(Math.cos(rad1) * 2 * cme.cmobject.size0) ) +
      'L' + (point2.x - Math.round(Math.sin(rad1) * 2 * cme.cmobject.size0)) +
      ' ' + (point2.y - Math.round(Math.cos(rad1) * 2 * cme.cmobject.size0)) + 'L' +
      point2.x + ' ' + point2.y;
      p = cmsvg.path(path);
      this.addLine(p, id, cmg, cme, cmsvg);
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
      this.addLine(p, id, cmg, cme, cmsvg);
    }

    // creates a rounded edged line between two point
    public createRoundedEdge(cme, cmsvg, cmg) {
      let p;
      let id = cme.id.toString();
      if (cme.id > -1) {
        id = id.replace('.', '_');
      }
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'C' + cme.x0 +
       ' ' + cme.y1 + ' ' + cme.x0 + ' ' + cme.y1 + ' ' + cme.x1 + ' ' + cme.y1;
      p = cmsvg.path(path);
      this.addLine(p, id, cmg, cme, cmsvg);
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
      this.addLine(p, id, cmg, cme, cmsvg);
    }

    // creates a sinus wave curve between two point
    public createWave(cme, cmsvg, cmg) {
      let p;
      let id = cme.id.toString();
      if (cme.id > -1) {
        id = id.replace('.', '_');
      }
      let path0 = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x1 + ' ' + cme.y1;
      let p0 = cmsvg.path(path0);
      let p0len = p0.getTotalLength();
      let p0rest = p0len % (cme.cmobject.size0 * 10);
      let p0n = Math.floor(p0len / (cme.cmobject.size0 * 10));
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + p0.getPointAtLength(p0rest / 2).x + ' ' + p0.getPointAtLength(p0rest / 2).y;
      let peak;
      for (let i = 0; i < p0n; i++) {
        peak = p0.getPointAtLength((p0rest / 2) + ((i * (cme.cmobject.size0 * 10)) + ((cme.cmobject.size0 * 10) / 2)));
        let rad = (peak.alpha / 180) * Math.PI;
        if (i % 2 === 0) {
          path += 'C' + (peak.x - (Math.sin(rad) * (cme.cmobject.size0 * 5))) + ' '
          + (peak.y + (Math.cos(rad) * (cme.cmobject.size0 * 5))) + ' ' + (peak.x - (Math.sin(rad) * (cme.cmobject.size0 * 10))) + ' '
          + (peak.y + (Math.cos(rad) * (cme.cmobject.size0 * 5))) + ' ' + p0.getPointAtLength((p0rest / 2)
          + ((i + 1) * (cme.cmobject.size0 * 10))).x + ' ' + p0.getPointAtLength((p0rest / 2) + ((i + 1) * (cme.cmobject.size0 * 10))).y;
        } else {
          path += 'C' + (peak.x - (Math.sin(rad) * (cme.cmobject.size0 * 5) * -1)) + ' '
          + (peak.y + (Math.cos(rad) * (cme.cmobject.size0 * 5) * -1)) + ' ' + (peak.x - (Math.sin(rad) * (cme.cmobject.size0 * 10) * -1))
           + ' ' + (peak.y + (Math.cos(rad) * (cme.cmobject.size0 * 5) * -1)) + ' ' + p0.getPointAtLength((p0rest / 2)
          + ((i + 1) * (cme.cmobject.size0 * 10))).x + ' ' + p0.getPointAtLength((p0rest / 2) + ((i + 1) * (cme.cmobject.size0 * 10))).y;
        }
      }
      path += 'L' + cme.x1 + ' ' + cme.y1;
      // console.log(path);
      p = cmsvg.path(path);
      this.addLine(p, id, cmg, cme, cmsvg);
    }

    // creates a zigzag curve between two point
    public createZigzag(cme, cmsvg, cmg) {
      let p;
      let id = cme.id.toString();
      if (cme.id > -1) {
        id = id.replace('.', '_');
      }
      let path0 = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x1 + ' ' + cme.y1;
      let p0 = cmsvg.path(path0);
      let p0len = p0.getTotalLength();
      let p0rest = p0len % (cme.cmobject.size0 * 10);
      let p0n = Math.floor(p0len / (cme.cmobject.size0 * 10));
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + p0.getPointAtLength(p0rest / 2).x + ' ' + p0.getPointAtLength(p0rest / 2).y;
      let peak;
      for (let i = 0; i < p0n; i++) {
        peak = p0.getPointAtLength((p0rest / 2) + ((i * (cme.cmobject.size0 * 10)) + ((cme.cmobject.size0 * 10) / 2)));
        let rad = (peak.alpha / 180) * Math.PI;
        if (i % 2 === 0) {
          path += 'L' + (peak.x - (Math.sin(rad) * (cme.cmobject.size0 * 7))) + ' '
          + (peak.y + (Math.cos(rad) * (cme.cmobject.size0 * 7))) + 'L' + p0.getPointAtLength((p0rest / 2)
          + ((i + 1) * (cme.cmobject.size0 * 10))).x + ' ' + p0.getPointAtLength((p0rest / 2) + ((i + 1) * (cme.cmobject.size0 * 10))).y;
        } else {
          path += 'L' + (peak.x - (Math.sin(rad) * (cme.cmobject.size0 * 7) * -1)) + ' '
          + (peak.y + (Math.cos(rad) * (cme.cmobject.size0 * 7) * -1)) + 'L' + p0.getPointAtLength((p0rest / 2)
          + ((i + 1) * (cme.cmobject.size0 * 10))).x + ' ' + p0.getPointAtLength((p0rest / 2) + ((i + 1) * (cme.cmobject.size0 * 10))).y;
        }
      }
      path += 'L' + cme.x1 + ' ' + cme.y1;
      p = cmsvg.path(path);
      this.addLine(p, id, cmg, cme, cmsvg);
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
      this.addLine(p, id, cmg, cme, cmsvg);
    }

    public addLine(p, id, cmg, cme, cmsvg) {
      /*
      let arrow = cmsvg.paper.polygon([0,10, 4,10, 2,0, 0,10])
      .attr({fill: cme.cmobject.color0})
      .transform('r' + p.getPointAtLength(p.getTotalLength()).alpha.toString());
      let marker = arrow.marker(0,0, 20,20, 0,10);
      */
      p.attr({
        fill: 'none',
        opacity: cme.cmobject.trans,
        strokeDasharray: cme.cmobject.dasharray,
        stroke: cme.cmobject.color0,
        strokeWidth: cme.cmobject.size0,
        // markerEnd: marker,
        id: 'cms' + id,
      });
      cmg.add(p);
    }

}
