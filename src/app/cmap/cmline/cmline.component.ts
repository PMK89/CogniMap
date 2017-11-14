import { Component, OnInit, Input, OnDestroy } from '@angular/core';
declare var Snap: any;

import { SnapsvgService } from '../../shared/snapsvg.service';
import { ElementService } from '../../shared/element.service';

import { CME } from '../../models/CME';
import { CMEl } from '../../models/CMEl';

@Component({
  selector: 'app-cmline',
  templateUrl: './cmline.component.html',
  styleUrls: ['./cmline.component.scss']
})

// generates the connection between the markers by calling snapsvg services
export class CmlineComponent implements OnInit, OnDestroy {
  @Input() public cmelement: CME;
  public cmgroup: any;
  public cmel: CMEl;

  constructor(private snapsvgService: SnapsvgService,
              private elementService: ElementService) { }

  public ngOnInit() {
    if (this.cmelement) {
      // console.log(this.cmelement);
      let s = Snap('#cmsvg');
      let id = this.cmelement.id.toString();
      if (this.cmelement.id < 1) {
        id = id.replace('.', '_');
      }
      this.cmgroup = s.select('#cml' + this.cmelement.prio.toString()).group();
      this.cmgroup.attr({
        id: ('g' + id),
        title: id
      });
      if (this.cmelement.prep !== '' && this.cmelement.prep !== undefined) {
        let o = Snap.parse(this.cmelement.prep);
        this.cmgroup.append(o);
        // console.log('prep');
      } else {
        let marking = s.select('#cmmark' + id);
        if (marking) {
          marking.remove();
        }
        this.cmel = this.elementService.CMEtoCMEol(this.cmelement);
        // console.log(this.cmelement.id);
        if (this.cmelement.prio <= 0) {
          this.cmelement.prio = 0;
        } else if (this.cmelement.prio >= 99) {
          this.cmelement.prio = 99;
        }
        this.snapsvgService.makeShape(this.cmel, null, this.cmgroup);
        let prep = this.cmgroup.innerSVG();
        prep = prep.replace(/ \\"/g, " '");
        prep = prep.replace(/\\",/g, "',");
        this.cmel.prep = prep;
        this.cmelement.prep = prep;
        // console.log('line update');
        if (this.cmel.id > -1) {
          this.projectTemplate(this.cmgroup, id);
        }
        let p = s.select('#cms' + id);
        if (p) {
          if (p.getTotalLength() >= 2000) {
            // this.cmel.cmobject.markers = [];
            this.createMarker(s, p);
          } else {
            this.elementService.updateCMEol(this.cmel);
          }
        }
      }
      if (this.cmelement.prep1 !== '' && this.cmelement.prep1 !== undefined) {
        let oldm = s.select('#m' + id);
        if (oldm) {
          oldm.remove();
          console.log('removed');
        }
        let mgroup = s.select('#cmm' + this.cmelement.prio.toString()).group();
        mgroup.attr({
          id: ('m' + id),
          title: id
        });
        let mo = Snap.parse(this.cmelement.prep1);
        mgroup.append(mo);
        let rect0 = s.select('#rect0' + id);
        let title0 = s.select('#title0' + id);
        rect0.click( () => {
          window.scrollTo((this.cmelement.x1 - 500), (this.cmelement.y1 - 500));
        });
        title0.click( () => {
          window.scrollTo((this.cmelement.x1 - 500), (this.cmelement.y1 - 500));
        });
        let rect1 = s.select('#rect1' + id);
        let title1 = s.select('#title1' + id);
        rect1.click( () => {
          window.scrollTo((this.cmelement.x0 - 500), (this.cmelement.y0 - 500));
        });
        title1.click( () => {
          window.scrollTo((this.cmelement.x0 - 500), (this.cmelement.y0 - 500));
        });
        // console.log('prep1 click: ', this.cmelement.id);
      } else {
        let p = s.select('#cms' + id);
        if (p) {
          if (p.getTotalLength() >= 2000) {
            if (this.cmel) {
              this.createMarker(s, p);
            } else {
              this.cmel = this.elementService.CMEtoCMEol(this.cmelement);
              this.createMarker(s, p);
            }
          }
        }
      }
      this.cmgroup.mousedown( () => {
          if (document.getElementById('TPid') !== undefined) {
            document.getElementById('TPid').title = id;
            // console.log(document.getElementById('TPid').title);
          }
        });
      if (this.cmelement.state === 'selected') {
        if (this.cmel === undefined) {
          this.cmel = this.elementService.CMEtoCMEol(this.cmelement);
        }
        let marking = s.select('#cms' + id).clone();
        marking.attr({
          stroke: '#0000ff',
          opacity: 0.3,
          strokeWidth: this.cmel.cmobject.size1 + 4,
          id: 'cmmark' + id
        });
        // marks selected Element
        this.cmgroup.add(marking);
        // this.cmgroup.add(marking);
      } else {
        let marking = s.select('#cmmark' + id);
        if (marking) {
          marking.remove();
        }
      }
    }
  }

  // removes SVG-Object after element is destroyed
  public ngOnDestroy() {

    let s = Snap('#cmsvg');
    let id = this.cmelement.id.toString();
    if (this.cmelement.id < 1) {
      id = id.replace('.', '_');
      let stb = Snap('#templatesvg');
      let oldstbelem = stb.select('#g' + id);
      if (oldstbelem) {
        oldstbelem.remove();
        // console.log('removed');
      }
    }
    let oldelem = s.select('#g' + id);
    if (oldelem) {
      oldelem.remove();
      // console.log('removed');
    }
    let oldm = s.select('#m' + id);
    if (oldm) {
      oldm.remove();
      // console.log('removed');
    }
  }

  // projects template windows to preview window
  public projectTemplate(cmsvg, id) {
    let stb = Snap('#templatesvg');
    let bbox = cmsvg.getBBox();
    let innertcmo = cmsvg.innerSVG();
    console.log(innertcmo);
    let scaling = Math.min((40 / bbox.h), (100 / bbox.w));
    let stbcmo = Snap.parse(innertcmo);
    let gt = stb.group().append(stbcmo);
    gt.attr({
      id: ('gt' + id),
      title: id
    });
    gt.transform('s' + scaling);
    gt.transform('t240,235');
  }

  // create markers
  public createMarker(s, p) {
    let id = this.cmel.id.toString();
    if (this.cmel.id < 1) {
      id = id.replace('.', '_');
    }
    let oldelem = s.select('#m' + id);
    if (oldelem) {
      oldelem.remove();
      // console.log('removed');
    }
    let length = p.getTotalLength();
    let mgroup = s.select('#cmm' + this.cmel.prio.toString()).group();
    mgroup.attr({
      id: ('m' + id),
      title: id
    });
    if (mgroup) {
      let title0 = s.text(0, 0, this.cmel.cmobject.title1);
      title0.attr({
        fontSize: (20 - this.cmel.prio) + 'px',
        fill: '#000000',
        fontFamily:
         "'Monotype Corsiva', 'Apple Chancery', 'ITC Zapf Chancery', 'URW Chancery L', cursive",
        opacity: 0.8,
        title: id,
        id: 'title0' + id
      });
      let bbox0 = title0.getBBox();
      let alpha0 = Math.sin((p.getPointAtLength(200).alpha
      * Math.PI) / 180);
      let len0 = 100 + 200 - (Math.abs(alpha0) * 100);
      if (Math.abs(alpha0) > 0.8) {
        len0 += ((Math.abs(alpha0) * 100) % 10) * 10;
      }
      let mxy0 = p.getPointAtLength(len0);
      title0.attr({
        x: (mxy0.x - (bbox0.w / 2)),
        y: (mxy0.y - (bbox0.h / 2))
      });
      let rect0 = s.rect(((mxy0.x - (bbox0.w / 2)) - 2), ((mxy0.y - (bbox0.h * 1.2)) - 2),
      (bbox0.w + 4), (bbox0.h + 4), 4, 4);
      rect0.attr({
        fill: this.cmel.cmobject.color0,
        opacity: 0.8,
        title: id,
        id: 'rect0' + id
      });
      mgroup.add(rect0);
      mgroup.add(title0);
      rect0.click( () => {
        window.scrollTo((this.cmel.x1 - 500), (this.cmel.y1 - 500));
      });
      title0.click( () => {
        window.scrollTo((this.cmel.x1 - 500), (this.cmel.y1 - 500));
      });
      let title1 = s.text(0, 0, this.cmel.cmobject.title0);
      title1.attr({
        fontSize: (20 - this.cmel.prio) + 'px',
        fill: '#000000',
        fontFamily:
         "'Monotype Corsiva', 'Apple Chancery', 'ITC Zapf Chancery', 'URW Chancery L', cursive",
        opacity: 0.8,
        title: id,
        id: 'title1' + id
      });
      let bbox1 = title1.getBBox();
      let alpha1 = Math.sin((p.getPointAtLength(length - 200).alpha
      * Math.PI) / 180);
      let len1 = 100 + 200 - (Math.abs(alpha1) * 100);
      if (Math.abs(alpha1) > 0.8) {
        len1 += ((Math.abs(alpha1) * 100) % 10) * 10;
      }
      let mxy1 = p.getPointAtLength(length - len1);
      title1.attr({
        x: (mxy1.x - (bbox1.w / 2)),
        y: (mxy1.y - (bbox1.h / 2))
      });
      let rect1 = s.rect(((mxy1.x - (bbox1.w / 2)) - 2), ((mxy1.y - (bbox1.h * 1.2)) - 2),
      (bbox1.w + 4), (bbox1.h + 4), 4, 4);
      rect1.attr({
        fill: this.cmel.cmobject.color0,
        opacity: 0.8,
        title: id,
        id: 'rect1' + id
      });
      mgroup.add(rect1);
      mgroup.add(title1);
      rect1.click( () => {
        window.scrollTo((this.cmel.x0 - 500), (this.cmel.y0 - 500));
      });
      title1.click( () => {
        window.scrollTo((this.cmel.x0 - 500), (this.cmel.y0 - 500));
      });
      // console.log('new click: ', this.cmelement.id);
      let prep1 = mgroup.innerSVG();
      prep1 = prep1.replace(/ \\"/g, " '");
      prep1 = prep1.replace(/\\",/g, "',");
      this.cmel.prep1 = prep1;
      this.cmelement.prep1 = prep1;
      // console.log('marker update');
      if (this.cmel.state === 'selected') {
        this.elementService.updateSelCMEl(this.cmel);
      } else {
        this.elementService.updateCMEol(this.cmel);
      }
    }
  }

}
