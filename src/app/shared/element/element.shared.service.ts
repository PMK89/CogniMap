import { Injectable } from '@angular/core';

// models and reducers

import { CME } from '../../models/CME';
// import { CMEo } from '../../models/CMEo';
// import { CMEl } from '../../models/CMEl';

@Injectable()
export class ElementSharedService {

  constructor() {

              }

  /*---------------------------------------------------------------------------
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  C------------Class transformation-------------------------------------------M
  M---------------------------------------------------------------------------C
  C---------------------------------------------------------------------------M
  M---------------------------------------------------------------------------C
  ---------------------------------------------------------------------------*/

  // returns an CMEo/l from an CMEdb
  public CMEtoCMEol(cme: CME) {
    if (cme !== undefined) {
      let cmeol = {
        id: cme.id,
        x0: cme.x0,
        y0: cme.y0,
        x1: cme.x1,
        y1: cme.y1,
        prio: cme.prio,
        title: cme.title,
        types: cme.types,
        coor: cme.coor,
        cat: cme.cat,
        state: cme.state,
        cmobject: JSON.parse(cme.cmobject),
        prep: cme.prep,
        prep1: cme.prep1
      };
      // console.log('CMEtoCMEol: ', cmeol);
      return cmeol;
    } else {
      return undefined;
    }
  }

  public newCME(cme) {
    if (cme !== undefined) {
      let CME = {
        id: cme.id,
        x0: cme.x0,
        y0: cme.y0,
        x1: cme.x1,
        y1: cme.y1,
        cdate: Date.now(),
        vdate: Date.now(),
        prio: cme.prio,
        title: cme.title,
        types: cme.types,
        coor: cme.coor,
        cat: cme.cat,
        state: cme.state,
        cmobject: JSON.stringify(cme.cmobject),
        prep: cme.prep,
        prep1: cme.prep1
      };
      return CME;
    } else {
      return undefined;
    }
  }

  // setting connectors
  // !

  // generates connection coordinates
  public conectionCoor(cmelement, link) {
    let width = cmelement.x1 - cmelement.x0;
    let height = cmelement.y1 - cmelement.y0;
    let modx = 5;
    let mody = 5;
    if (cmelement.types[1] === 'c') {
      modx += (width / 4);
      mody += (height / 4);
    } else if (cmelement.types[1] === 'e') {
      modx += (width / 3);
      mody += (height / 3);
    } else if (cmelement.types[1] === 'a') {
      modx += (width / 10);
      mody += (height / 10);
    } else if (cmelement.types[1] === 't') {
      link.con = 't';
      mody = height - 3;
      if (link.peerCoor.x >= (cmelement.coor.x + width)) {
        modx = width - 3;
      } else {
        modx = 3;
      }
    }
    switch (link.con) {
      case 'a':
        return [cmelement.x0 + modx, cmelement.y0 + mody];
      case 'ab':
        return [(cmelement.x0 + (width / 2) ), cmelement.y0];
      case 'b':
        return [(cmelement.x0 + width - modx ), cmelement.y0 + mody];
      case 'bc':
        return [(cmelement.x0 + width), (cmelement.y0 + (height / 2 ))];
      case 'c':
        return [(cmelement.x0 + width - modx), (cmelement.y0 + height - mody)];
      case 'cd':
        return [(cmelement.x0 + (width / 2 )), (cmelement.y0 + height)];
      case 'd':
        return [cmelement.x0 + modx, (cmelement.y0 + height - mody)];
      case 'da':
        return [cmelement.x0, (cmelement.y0 + (height / 2 ))];
      case 'e':
        // console.log(cmelement.x0, width, cmelement.y0, height);
        return [(cmelement.x0 + (width / 2 )), (cmelement.y0
          + (height / 2 ))];
      case 't':
        // console.log(cmelement.x0, width, cmelement.y0, height);
        return [(cmelement.x0 + modx), (cmelement.y0 + mody)];
      default:
        return [cmelement.x0, cmelement.y0];
    }
  }

}
