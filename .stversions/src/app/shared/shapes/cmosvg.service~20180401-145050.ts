import { Injectable } from '@angular/core';
import { ObjectShapesService } from './objectshapes.service';
// import { Snap } from 'snapsvg';
declare var Snap: any;

@Injectable()
export class CmosvgService {

  constructor(private objectShapesService: ObjectShapesService) { }

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

  // creates a circle
  public createPoly(cme, bbox, cmg: any) {
    let s = Snap('#cmsvg');
    if (cme.cmobject.style.object.str) {
      let str = cme.cmobject.style.object.str;
      let xIndex = str.indexOf('xdif:');
      let yIndex = str.indexOf('ydif:');
      if (xIndex !== -1 && yIndex !== -1) {
        let xdif = parseFloat(str.substr((xIndex + 5), yIndex));
        let ydif = parseFloat(str.substr((yIndex + 5)));
        str = str.substr(0, xIndex);
        let p = s.path(str);
        p.transform('t' + (cme.coor.x + xdif) + ','
         + (cme.coor.y + ydif));
        console.log(p);
        this.addShape(cme, cmg, p);
      }
    }

  }

  // creates a Text
  public createText(cme, bbox, cmg: any) {
    let s = Snap('#cmsvg');
    let mrg = (cme.cmobject.style.title.size / 8);
    if (cme.types[2] === 'l') {
      let p = s.path('M' + bbox.x + ' ' + (bbox.y2 - (mrg / 2))
       + 'L' + bbox.x2 + ' ' + (bbox.y2 - (mrg / 2)));
      p.attr({
        fill: 'none',
        stroke: cme.cmobject.style.object.color0,
        strokeWidth: mrg,
        opacity: cme.cmobject.style.object.trans,
        id: 'cms' + cme.id.toString(),
      });
      cmg.add(p);
    } else if (cme.types[2] === 'b') {
      let r = s.rect(bbox.x, (bbox.y - (mrg / 2)), bbox.w, (bbox.h + mrg));
      r.attr({
        fill: 'none',
        stroke: cme.cmobject.style.object.color1,
        strokeWidth: mrg,
        opacity: cme.cmobject.style.object.trans,
      });
      cmg.add(r);
    }
  }

  // create special shapes
  public createShapes(cme, bbox, cmg: any) {
    let source;
    let xdif = 0.5;
    let ydif = 0.5;
    let wdif = 10;
    let hdif = 10;
    switch (cme.types[1]) {
      case 'da':
        source = this.objectShapesService.Shapes['doublearrow'];
        wdif = cme.cmobject.style.title.size * 2;
        hdif = cme.cmobject.style.title.size * 1.5;
        break;
      case 'sb':
        source = this.objectShapesService.Shapes['speechbubble'];
        ydif = 0.2;
        wdif = cme.cmobject.style.title.size * 0.5;
        hdif = cme.cmobject.style.title.size;
        break;
      case 'tb':
        source = this.objectShapesService.Shapes['thoughtbubble'];
        ydif = 0.3;
        wdif = cme.cmobject.style.title.size * 0.5;
        hdif = cme.cmobject.style.title.size + (bbox.w * 0.1);
        break;
      case 'tb1':
        source = this.objectShapesService.Shapes['thoughtbubble1'];
        ydif = 0.2;
        wdif = cme.cmobject.style.title.size * 0.5;
        hdif = cme.cmobject.style.title.size;
        break;
      case 'd':
        source = this.objectShapesService.Shapes['diamond'];
        wdif = cme.cmobject.style.title.size;
        hdif = bbox.w * 0.5;
        break;
      case 'h':
        source = this.objectShapesService.Shapes['hexagon'];
        wdif = cme.cmobject.style.title.size * 0.5;
        hdif = cme.cmobject.style.title.size + bbox.w * 0.2;
        break;
      case 'p':
        source = this.objectShapesService.Shapes['pentagon'];
        wdif = cme.cmobject.style.title.size * 0.5;
        hdif = cme.cmobject.style.title.size + bbox.w * 0.2;
        ydif = 0.4;
        break;
      default:
        source = this.objectShapesService.Shapes['diamond'];
    }
    let svggroup = cmg.g();
    let tsvggroup = cmg.g();
    let svg = Snap.parse(source);
    tsvggroup.add(svg);
    let layer1 = tsvggroup.select('#layer1');
    if (layer1) {
      tsvggroup.remove();
      svggroup.add(layer1);
      let svgbbox = svggroup.getBBox();
      layer1.transform('s' + ((bbox.w + wdif) / svgbbox.w) + ' ' + ((bbox.h + hdif) / svgbbox.h));
      svgbbox = svggroup.getBBox();
      // let transformgroup = cmg.g();
      // transformgroup.add(svggroup);
      svggroup.transform('t' + ((bbox.x - (xdif * (svgbbox.w - bbox.w))) - svgbbox.x) +
      ',' + ((bbox.y - (ydif * (svgbbox.h - bbox.h))) - svgbbox.y));
      console.log(xdif, ydif, wdif, hdif);
    }
    let a = svggroup.select('#svg_1');
    if (a) {
      a.attr({
        fill: cme.cmobject.style.object.color0,
        stroke: cme.cmobject.style.object.color1,
        opacity: cme.cmobject.style.object.trans,
        id: 'cms' + cme.id.toString(),
      });
    }
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
