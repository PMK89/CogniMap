import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'snapsvg';
declare var Snap: any;

declare var electron: any;
const ipc = electron.ipcRenderer;

// models and reducers
import { CMElement } from '../models/CMElement';

@Injectable()
export class SnapsvgService {
  svgCanvas;
  cmsvg = Snap('#cmsvg');
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  width: number;
  height: number;
  stroke: string;

  constructor() { }

  // generates shape from prepared string or initiates new creation
  makeShape(cme: CMElement) {
    this.x0 = cme.x0;
    this.x1 = cme.x1;
    this.y0 = cme.y0;
    this.y1 = cme.y1;
    this.height = cme.x1 - cme.x0;
    /*
    this.width = cme.y1 - cme.y0;let oldelem = this.cmsvg.select('#svg' + cme.id.toString());
    if (oldelem) {
      oldelem.remove();
      console.log('removed');
    }
    */
    if (cme.prep !== '' && cme.prep !== undefined) {
      console.log('prep');
      Snap.parse(cme.prep);
    } else {
      if (cme.id > 0) {
        this.objectSvg(cme);
      } else if (cme.id < 0) {
        this.lineSvg(cme);
      } else {
        console.log('no matching element');
      }
    }
  }

  // called for object elements
  objectSvg(cme: CMElement) {
    // console.log('objectsvg');
    switch (cme.cmobject.style.object.shape) {
      case 'r':
        this.createRectangle(cme);
        break;
      case 'c':
        this.createCircle(cme);
        break;
      default:
        this.createTest(cme);
    }
  }

  // called for line elements
  lineSvg(cme: CMElement) {
    switch (cme.cmline.shape) {
      case 'e':
        this.createEdge(cme);
        break;
      case 'c':
        this.createCurve(cme);
        break;
      default:
        this.createLine(cme);
    }
  }

  // creates a straigth line between two point
  createLine(cme) {
    let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x1 + ' ' + cme.y1;
    let p = this.cmsvg.path(path);
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
  createEdge(cme) {
    let path = 'M' + cme.x0 + ' ' + cme.y0 + 'L' + cme.x0 + ' ' + cme.y1 + 'L' + cme.x1 + ' ' + cme.y1;
    let p = this.cmsvg.path(path);
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
  createCurve(cme) {

  }

  // creates a rectangle
  createRectangle(cme) {
    /*/ console.log('rectangle');
    let path = this.d = 'M' + this.x1 + ' ' + this.y1 + 'L' + this.x1 + ' ' +
    (this.height - this.y1) + 'L' + (this.width - this.x1) + ' ' + (this.height - this.y1);
    let p = this.cmsvg.path(path);
    p.attr({
      fill: 'none',  + (this.width / 2)
      stroke: cme.cmline.color0, + (this.height / 2)
      strokeWidth: cme.cmline.size0,
    });
    */
  }

  // creates a circle
  createCircle(cme) {
    let cx = (cme.x0 + cme.x1) / 2;
    let cy = (cme.y0 + cme.y1) / 2;
    let r = Math.round(Math.max(this.height, this.width) * 0.6 );
    // console.log('circle: ', r);
    let c = this.cmsvg.circle(cx, cy, r);
    c.attr({
      fill: cme.cmobject.style.object.color0,
      stroke: cme.cmobject.style.object.color0,
      strokeWidth: cme.prio,
      id: 'svg' + cme.id.toString(),
    });
    ipc.send('snap-in', cme.id);
    /*
    elementController.test(cme.id)
      .subscribe(x => {
        if (x) {
          console.log('snap: ', x);
        }
      });
    */
  }

  // test
  createTest(cme) {

  }


}
