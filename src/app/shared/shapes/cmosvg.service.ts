import { Injectable } from '@angular/core';
declare var Snap: any;

@Injectable()
export class CmosvgService {

  constructor() { }

  // creates a rectangle
  createRectangle(cme, cmsvg) {
    let pathstr = 'm0.99679,148.19614c0.277,-34.75176 -0.17724,-69.54997 2.27791,-104.24061c60.32762,11.41171 119.94372,30.08407 179.25477,46.87597c3.18407,-17.04019 1.68541,-31.17523 4.4519,-46.93008c38.1039,33.15254 75.86421,66.77718 112.07695,102.003c-34.74261,39.95821 -74.59364,74.65916 -113.71667,110.1933c-1.26689,-16.54773 -2.53401,-33.09534 -3.80092,-49.64307c-57.66159,16.00916 -118.64064,32.56108 -176.67504,47.19652c-3.94662,-33.77068 -3.83062,-70.54794 -3.8689,-105.45503z';
    let p = cmsvg.path(pathstr);
    p.attr({
      fill: '#00ff00',
      stroke: cme.cmobject.style.object.color0,
      strokeWidth: 2,
      id: 'svgp' + cme.id.toString(),
    });
    let pwidth = p.getBBox().width;
    let pheight = p.getBBox().height;
    let cmewidth = (cme.x1 - cme.x0) * 1.5;
    let cmeheight = (cme.y1 - cme.y0) * 1.5;
    let swidth = cmewidth / pwidth;
    let sheight = cmeheight / pheight;
    let t = 'S' + ' ' + swidth + ',' + sheight + 'T' + (cme.coor.x).toString() + ',' + (cme.coor.y - (cmeheight * 1.5)).toString();
    console.log(t);
    p.transform(t);
    // let spath = 'S' + String(cme.x1 - cme.x0) + ' ' + String(cme.y1 - cme.y0);
    // p.transform(spath);  (cme.coor.x + (width / 2)).toString() + ',' + (cme.coor.y + (height / 2)).toString() +
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
  createCircle(cme, cmsvg, width, height) {
    let cx = (cme.x0 + cme.x1) / 2;
    let cy = (cme.y0 + cme.y1) / 2;
    let r = Math.round(Math.max(height, width) * 0.6 );
    // console.log('circle: ', r);
    let c = cmsvg.circle(cx, cy, r);
    c.attr({
      fill: cme.cmobject.style.object.color0,
      stroke: cme.cmobject.style.object.color0,
      strokeWidth: cme.prio,
      id: 'svgp' + cme.id.toString(),
    });
    // ipc.send('snap-in', cme.id);
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
