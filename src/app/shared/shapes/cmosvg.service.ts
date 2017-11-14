import { Injectable } from '@angular/core';
// import { Snap } from 'snapsvg';
declare var Snap: any;

@Injectable()
export class CmosvgService {

  constructor() { }

  // creates a rectangle
  public createRectangle(cme, bbox, cmg: any) {
    let s = Snap('#cmsvg');
    let mrg = 2;
    let r = s.rect((bbox.x - (mrg / 2)), (bbox.y - (mrg / 2)), (bbox.w + mrg), (bbox.h + mrg));
    this.addShape(cme, cmg, r);
  }

  // creates an standart object
  public createRounded(cme, bbox, cmg: any) {
    let s = Snap('#cmsvg');
    let mrg = 5;
    let a = s.rect((bbox.x - (mrg / 2)), (bbox.y - (mrg / 2)),
     (bbox.w + mrg), (bbox.h + mrg), 3, 3);
    this.addShape(cme, cmg, a);
  }

  // creates an ellipse
  public createEllipse(cme, bbox, cmg: any) {
    let s = Snap('#cmsvg');
    let mrg = 2;
    let e = s.ellipse(bbox.cx, bbox.cy, (bbox.r0 + mrg), (bbox.h + mrg));
    this.addShape(cme, cmg, e);
  }

  // creates a circle
  public createCircle(cme, bbox, cmg: any) {
    let s = Snap('#cmsvg');
    let c = s.circle(bbox.cx, bbox.cy, bbox.r0);
    this.addShape(cme, cmg, c);
  }

  // creates a Text
  public createText(cme, bbox, cmg: any) {
    let s = Snap('#cmsvg');
    let mrg = (cme.cmobject.style.title.size / 8);
    let p = s.path('M' + bbox.x + ' ' + (bbox.y2 - (mrg / 2))
     + 'L' + bbox.x2 + ' ' + (bbox.y2 - (mrg / 2)));
    p.attr({
      fill: 'none',
      stroke: cme.cmobject.style.object.color0,
      strokeWidth: mrg,
      opacity: cme.cmobject.style.object.trans,
      id: 'cms' + cme.id.toString(),
    });
    if (cme.types[2] === 'b') {
      let r = s.rect(bbox.x, (bbox.y - (mrg / 2)), bbox.w, (bbox.h + mrg));
      r.attr({
        fill: 'none',
        stroke: cme.cmobject.style.object.color1,
        strokeWidth: mrg,
        opacity: cme.cmobject.style.object.trans,
      });
      cmg.add(r);
    }
    cmg.add(p);
  }

  // test
  public createTest(cme, bbox, cmg: any) {
    let s = Snap('#cmsvg');
    let mrg = 5;
    let a = s.rect((bbox.x - (mrg / 2)), (bbox.y - (mrg / 2)),
     (bbox.w + mrg), (bbox.h + mrg), 5, 5);
    this.addShape(cme, cmg, a);
  }

  public addShape(cme, cmg, a) {
    a.attr({
      fill: cme.cmobject.style.object.color0,
      opacity: cme.cmobject.style.object.trans,
      id: 'cms' + cme.id.toString(),
    });
    if (cme.types[2] === 'b') {
      a.attr({
        stroke: cme.cmobject.style.object.color1,
        strokeWidth: (cme.cmobject.style.title.size / 8),
      });
    }
    cmg.add(a);
  }

}
