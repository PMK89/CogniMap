import { Injectable } from '@angular/core';

@Injectable()
export class CmlsvgService {

  constructor() { }


    // create markers
    createMarker(cme, cmsvg, p) {
      let oldelem = cmsvg.select('#m' + cme.id.toString());
      if (oldelem) {
        oldelem.remove();
        console.log('removed');
      }
      let length = p.getTotalLength();
      let mgroup = cmsvg.select('#cmm' + cme.prio.toString()).group();
      mgroup.attr({
        id: ('m' + cme.id.toString()),
        title: cme.id.toString()
      });
      if (cme.cmline.markers.length === 0) {
        let title0 = cmsvg.text(0, 0, cme.cmline.title1);
        title0.attr({
          fontSize: (20 - cme.prio) + 'px',
          fill: '#000000',
          fontFamily: "'Monotype Corsiva', 'Apple Chancery', 'ITC Zapf Chancery', 'URW Chancery L', cursive",
          opacity: 0.8,
          title: cme.id.toString()
        });
        let bbox0 = title0.getBBox();
        let mxy0 = p.getPointAtLength(200);
        title0.attr({
          x: (mxy0.x - (bbox0.w / 2)),
          y: (mxy0.y - (bbox0.h / 2))
        });
        let rect0 = cmsvg.rect(((mxy0.x - (bbox0.w / 2)) - 2), ((mxy0.y - (bbox0.h * 1.2)) - 2),
        (bbox0.w + 4), (bbox0.h + 4), 4, 4);
        rect0.attr({
          fill: cme.cmline.color0,
          opacity: 0.8,
          title: cme.id.toString()
        });
        rect0.mousedown(function(){
          window.scrollTo((cme.x1 - 500), (cme.y1 - 500));
        });
        title0.mousedown(function(){
          window.scrollTo((cme.x1 - 500), (cme.y1 - 500));
        });
        mgroup.add(rect0);
        mgroup.add(title0);
        let title1 = cmsvg.text(0, 0, cme.cmline.title0);
        title1.attr({
          fontSize: (20 - cme.prio) + 'px',
          fill: '#000000',
          fontFamily: "'Monotype Corsiva', 'Apple Chancery', 'ITC Zapf Chancery', 'URW Chancery L', cursive",
          opacity: 0.8,
          title: cme.id.toString()
        });
        let bbox1 = title1.getBBox();
        let mxy1 = p.getPointAtLength(length - 200);
        title1.attr({
          x: (mxy1.x - (bbox1.w / 2)),
          y: (mxy1.y - (bbox1.h / 2))
        });
        let rect1 = cmsvg.rect(((mxy1.x - (bbox1.w / 2)) - 2), ((mxy1.y - (bbox1.h * 1.2)) - 2),
        (bbox1.w + 4), (bbox1.h + 4), 4, 4);
        rect1.attr({
          fill: cme.cmline.color0,
          opacity: 0.8,
          title: cme.id.toString()
        });
        rect1.mousedown(function(){
          window.scrollTo((cme.x0 - 500), (cme.y0 - 500));
        });
        title1.mousedown(function(){
          window.scrollTo((cme.x0 - 500), (cme.y0 - 500));
        });
        mgroup.add(rect1);
        mgroup.add(title1);
      }
    }
    // creates a straigth line between two point
    createLine(cme, cmsvg, cmg) {
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x1 + ' ' + cme.y1;
      let p = cmsvg.path(path);
      p.attr({
        fill: 'none',
        stroke: cme.cmline.color0,
        strokeWidth: cme.cmline.size0,
        id: 'cms' + cme.id.toString(),
      });
      p.mousedown(function( ){
        document.getElementById('TPid').title = cme.id;
        console.log(document.getElementById('TPid').title);
      });
      cmg.add(p);
      if (p.getTotalLength() >= 2000) {
        cme.cmline.markers = [];
        this.createMarker(cme, cmsvg, p);
      }
    }

    // creates a edged line between two point
    createEdge(cme, cmsvg, cmg) {
      let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x0 + ' ' + cme.y1 + 'L' + cme.x1 + ' ' + cme.y1;
      let p = cmsvg.path(path);
      p.attr({
        fill: 'none',
        stroke: cme.cmline.color0,
        strokeWidth: cme.cmline.size0,
        id: 'cms' + cme.id.toString(),
      });
      p.mousedown(function( ){
        document.getElementById('TPid').title = cme.id;
        console.log(document.getElementById('TPid').title);
      });
      cmg.add(p);
      if (p.getTotalLength() >= 2000) {
        cme.cmline.markers = [];
        this.createMarker(cme, cmsvg, p);
      }
      // console.log(this.svgCanvas);
    }

    // creates a straigth line between two point
    createCurve(cme, cmsvg, cmg) {

    }

}
