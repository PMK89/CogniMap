import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
declare var Snap: any;

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// services
import { SettingsService } from './settings.service';
import { MathJaxService } from './mathjax.service';
import { ElementService } from './element.service';
import { CmosvgService } from './shapes/cmosvg.service';
import { CmlsvgService } from './shapes/cmlsvg.service';
import { LineShapesService } from './shapes/lineshapes.service';

// models and reducers
import { CMSettings } from '../models/CMSettings';
import { CMEo } from '../models/CMEo';
import { CMEl } from '../models/CMEl';
import { SBBox } from '../models/SBBox';

@Injectable()
export class SnapsvgService {
  public cmsvg: any;
  public cmsettings: CMSettings;

  constructor(private cmosvgService: CmosvgService,
              private settingsService: SettingsService,
              private mathjaxService: MathJaxService,
              private elementService: ElementService,
              private lineShapesService: LineShapesService,
              private cmlsvgService: CmlsvgService) {
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      if (data !== undefined && data !== null) {
                        this.cmsettings = data;
                        // console.log(data);
                        if (this.cmsettings.mode !== 'draw_poly') {
                          this.clearPointLine();
                        }
                      }
                    });
              }

  // generates shape from prepared string or initiates new creation
  public makeShape(cme: any, bbox?: SBBox, cmg?: any) {
    if (typeof cme.cmobject === 'string') {
      cme = this.elementService.CMEtoCMEol(cme);
    }
    if (cme !== undefined && this.cmsettings !== undefined) {
      this.cmsvg = Snap('#cmsvg');
      if (this.cmsettings.mode === 'edit') {
        let id = cme.id.toString();
        if (cme.id < 1) {
          id = id.replace('.', '_');
        }
        let oldelem = this.cmsvg.select('#cms' + id);
        if (oldelem) {
          oldelem.remove();
          console.log('removed');
        }
      }
      if (cme.id > 0) {
        this.objectSvg(cme, bbox, cmg);
      } else if (cme.id < 0) {
        this.lineSvg(cme, cmg);
      } else {
        console.log('no matching element');
      }
    }
  }

  // called for object elements
  public objectSvg(cme: CMEo, bbox: SBBox, cmg: any) {
    // console.log(this.cmsvg);
    switch (cme.types[1]) {
      case 'r':
        this.cmosvgService.createRectangle(cme, bbox, cmg);
        break;
      case 'c':
        this.cmosvgService.createCircle(cme, bbox, cmg);
        break;
      case 'e':
        this.cmosvgService.createEllipse(cme, bbox, cmg);
        break;
      case 't':
        this.cmosvgService.createText(cme, bbox, cmg);
        break;
      case 'p':
        this.cmosvgService.createPoly(cme, bbox, cmg);
        break;
      case 'a':
        this.cmosvgService.createTest(cme, bbox, cmg);
        break;
      default:
        this.cmosvgService.createShapes(cme, bbox, cmg);
    }
  }

  // called for line elements
  public lineSvg(cme: CMEl, cmg: any) {

    switch (cme.types[1]) {
      case 'e':
        this.cmlsvgService.createEdge(cme, this.cmsvg, cmg);
        break;
      case 'c':
        this.cmlsvgService.createCurve(cme, this.cmsvg, cmg);
        break;
      case 's':
        this.cmlsvgService.createSCurve(cme, this.cmsvg, cmg);
        break;
      case 'w':
        this.cmlsvgService.createWave(cme, this.cmsvg, cmg);
        break;
      case 'z':
        this.cmlsvgService.createZigzag(cme, this.cmsvg, cmg);
        break;
      case 'r':
        this.cmlsvgService.createRoundedEdge(cme, this.cmsvg, cmg);
        break;
      default:
        this.cmlsvgService.createLine(cme, this.cmsvg, cmg);
    }
  }

  // places arrowhead on end of an line
  public makeArrow(cme: CMEl, cmg: any) {
    let source;
    let lengthreducer = 0;
    this.cmsvg = Snap('#cmsvg');
    switch (cme.cmobject.end) {
      case 'slim':
        source = this.lineShapesService.ArrowHeads['slim'];
        lengthreducer = 0;
        break;
      case 'fat':
        source = this.lineShapesService.ArrowHeads['fat'];
        lengthreducer = cme.cmobject.size0 * 2;
        break;
      case 'triangle':
        source  = this.lineShapesService.ArrowHeads['triangle'];
        lengthreducer = cme.cmobject.size0 * 2;
        break;
      default:
        source  = this.lineShapesService.ArrowHeads['triangle'];
        lengthreducer = cme.cmobject.size0 * 2;
    }
    let svggroup = cmg.g();
    let p = cmg.select('#cms' + cme.id);
    if (p) {
      let length = p.getTotalLength();
      let edgelen = 5 * cme.cmobject.size0;
      let endpoint = p.getPointAtLength(length - lengthreducer);
      let svg = Snap.parse(source);
      svggroup.add(svg);
      let svgbbox = svggroup.getBBox();
      let layer1 = svggroup.select('#layer1');
      if (layer1) {
        console.log(endpoint);
        layer1.transform('s' + (edgelen / svgbbox.h));
        svgbbox = svggroup.getBBox();
        svggroup.transform('r' + (endpoint.alpha - 180) + ',' + (svgbbox.x + (svgbbox.w / 2)) + ',' + (svgbbox.y + (svgbbox.w / 2)));
        svgbbox = svggroup.getBBox();
        let transformgroup = cmg.g();
        transformgroup.add(svggroup);
        transformgroup.transform('t' + ((endpoint.x - edgelen  / 2) - svgbbox.x) + ',' + ((endpoint.y - edgelen / 2) - svgbbox.y));
      }
      let arrowhead = svggroup.select('#svg_1');
      if (arrowhead) {
        arrowhead.attr({
          opacity: cme.cmobject.trans,
          stroke: cme.cmobject.color1,
          fill: cme.cmobject.color0
        });
      }
    }
  }

  // generates shape from prepared string or initiates new creation
  public makeContent(cme: any, cmg: any, i: any, totwidth: number) {
    // console.log(cmg);
    if (typeof cme.cmobject === 'string') {
      cme = this.elementService.CMEtoCMEol(cme);
    }
    if (cme !== undefined && this.cmsettings !== undefined) {
      this.cmsvg = Snap('#cmsvg');
      let con;
      let concmg = cmg.g();
      let s = this.cmsvg;
      let id = cme.id.toString();
      if (cme.id < 1) {
        id = id.replace('.', '_');
      }
      if (cme.cmobject.content[i]) {
          let content = cme.cmobject.content[i];
          let coorX = cme.coor.x + content.coor.x;
          let coorY = cme.coor.y + content.coor.y;
          switch (content.cat) {
            case 'i':
            case 'i_100':
              // insertes images (png, jpg, gif)
              let path;
              let imggroup = concmg.g();
              if (content.object.indexOf('assets/') === -1) {
                path = 'assets/images/' + content.object;
              } else {
                path = content.object;
              }
              con = s.image((path), coorX, coorY);
              imggroup.append(con);
              con.attr({
                opacity: cme.cmobject.style.object.trans,
                id: id.toString() + '-' + i.toString(),
                title: id
              });
              if (content.cat === 'i') {
                con.transform('s' + (content.height / 100));
              } else if (content.cat === 'i_100' || content.cat === 'i_50') {
                let size;
                if (content.cat === 'i_100') {
                  size = '100px';
                } else if (content.cat === 'i_50') {
                  size = '50px';
                }
                let imgBBox = con.getBBox();
                if (imgBBox.w >= imgBBox.h) {
                  con.attr({width: size});
                } else {
                  con.attr({height: size});
                }
                con.click( () => {
                  let conBig = s.image((path), (coorX - (imgBBox.w / 2)), (coorY) - (imgBBox.h / 2));
                  conBig.attr({
                    opacity: cme.cmobject.style.object.trans,
                    id: id.toString() + '-' + i.toString() + 'Big',
                    title: id
                  });
                  conBig.transform('s' + (content.height / 100));
                  conBig.click( () => {
                    conBig.remove();
                  });
                });
              }
              let imgbbox = imggroup.getBBox();
              content.width = imgbbox.w;
              imggroup.transform('t' + (coorX + totwidth - imgbbox.x) + ',' + (coorY - imgbbox.y));
              concmg.add(imggroup);
              break;
            case 'svg':
              // inserts svg to marker group
              let svggroup = concmg.g();
              con = Snap.parse(content.object);
              svggroup.append(con);
              // svggroup.selectAll('rect').remove();
              let svgbbox = svggroup.getBBox();
              console.log(svgbbox);
              svggroup.transform('t' + (coorX + totwidth - svgbbox.x) + ',' + (coorY - svgbbox.y));
              content.width = svgbbox.width;
              concmg.add(svggroup);
              concmg.transform('s' + (content.height / 100));
              break;
            case 'title':
              // inserts svg to marker group
              let titlegroup = concmg.g();
              let titlestyle = JSON.parse(content.info);
              let title = s.text((coorX + totwidth), coorY, content.object);
              title.attr({
                fontSize: titlestyle.size + 'px',
                fill: titlestyle.color,
                fontFamily: titlestyle.font,
                textDecoration: titlestyle.deco,
                id: id.toString() + '-' + i.toString(),
                title: id
              });
              titlegroup.append(title);
              // titlegroup.selectAll('rect').remove();
              let titlebbox = titlegroup.getBBox();
              console.log(titlebbox);
              content.width = titlebbox.width;
              titlegroup.transform('t' + (coorX + totwidth - titlebbox.x) + ',' + (coorY - titlebbox.y));
              concmg.add(titlegroup);
              concmg.transform('s' + (content.height / 100));
              break;
            case 'jsme-svg':
              // inserts jsme-svg to marker group and removes white rect
              let jsmesvggroup = concmg.g();
              con = Snap.parse(content.object);
              jsmesvggroup.append(con);
              let rectgrp = jsmesvggroup.selectAll('rect');
              if (rectgrp[0]) {
                rectgrp[0].remove();
              }
              let jsmesvgbbox = jsmesvggroup.getBBox();
              console.log(jsmesvgbbox);
              jsmesvggroup.transform('t' + (coorX + totwidth - jsmesvgbbox.x) + ',' + (coorY - jsmesvgbbox.y));
              content.width = jsmesvgbbox.width;
              concmg.add(jsmesvggroup);
              concmg.transform('s' + (content.height / 100));
              break;
            case 'LateX':
              // do something with latex
              let xmlgroup = concmg.g();
              content.object = this.mathjaxService.getMjSVG(content.info);
              con = Snap.parse(content.object);
              xmlgroup.append(con);
              let xmlbbox = xmlgroup.getBBox();
              // console.log(content.object);
              xmlgroup.transform('t' + (coorX + totwidth - xmlbbox.x) + ',' + (coorY - xmlbbox.y));
              content.width = xmlbbox.width;
              concmg.add(xmlgroup);
              break;
            case 'html':
              // do something with html
              let htmlgroup = concmg.g();
              con = Snap.parse(content.object);
              htmlgroup.append(con);
              let htmlbbox = htmlgroup.getBBox();
              console.log(htmlgroup);
              htmlgroup.selectAll('foreignObject').attr({
                x: (coorX + totwidth - htmlbbox.x),
                y: (coorY - htmlbbox.y),
                title: id
              });
              content.width = htmlbbox.width;
              let rect = s.rect((coorX + totwidth - htmlbbox.x), (coorY - htmlbbox.y), htmlbbox.width, htmlbbox.height);
              rect.attr({
                title: id,
                opacity: 0,
                fill: '#ffffff'
              });
              concmg.add(rect);
              break;
            case 'p':
              // do something with images
              con = s.image('assets/images/basic/empty.png', coorX, coorY);
              concmg.add(con);
              break;
            case 'l':
              // do something with images
              con = s.image('assets/images/basic/empty.png', coorX, coorY);
              concmg.add(con);
              break;
            case 'mp4':
              console.log(content.object);
              break;
            default:
              // do something with images {
              console.log('no usable content found');
              break;
          }
          concmg.attr({id: 'c' + id.toString() + '-' + i.toString()});
          let concmgbbox = concmg.getBBox();
          let concmgrect = s.rect(concmgbbox.x, concmgbbox.y, concmgbbox.w, concmgbbox.h);
          concmgrect.attr({
            id: 'cont' + id.toString() + '_' + i.toString(),
            title: id,
            strokeWidth: 0,
            fill: '#ffffff',
            opacity: 0
          });
          cmg.add(concmg);
          cmg.add(concmgrect);
      }
      /*
      if (this.cmsettings.mode === 'edit') {
        let id = cme.id.toString();
        if (cme.id < 1) {
          id = id.replace('.', '_');
        }
        let oldelem = this.cmsvg.select('#cms' + id);
        if (oldelem) {
          oldelem.remove();
          console.log('removed');
        }
      }
      */
    }
  }

  // greates points and lines in between them for ployeder figures
  public pointLine(coor: any, color0: string, color1: string) {
    if (coor.length > 0) {
      this.cmsvg = Snap('#cmsvg');
      let polypoints = this.cmsvg.select('#polypoints');
      if (polypoints) {
        polypoints.clear();
        let pathStrg = 'M';
        for (let key in coor) {
          if (coor[key]) {
            pathStrg += coor[key].x + ' ' + coor[key].y + 'L';
            let c = this.cmsvg.circle(coor[key].x, coor[key].y, 3);
            c.attr({
              fill: color0,
              title: 'point'
            });
            polypoints.add(c);
          }
        }
        let polylines = this.cmsvg.select('#polylines');
        if (polylines) {
          polylines.clear();
          pathStrg = pathStrg.substring(0, pathStrg.length - 1);
          let path = this.cmsvg.path(pathStrg);
          path.attr({
            stroke: color1,
            fill: 'none',
            id: 'pointpath',
            strokeWidth: 1
          });
          polylines.add(path);
          return pathStrg;
        }
      }
    }
  }

  // greates points and lines in between them for ployeder figures
  public closeLine(coor: any, color0: string, color1: string) {
    this.cmsvg = Snap('#cmsvg');
    if (coor.length > 0) {
      coor.push(coor[0]);
      let path = this.pointLine(coor, color0, color1);
      let pointpath = this.cmsvg.select('#pointpath');
      if (pointpath) {
        pointpath.attr({
          fill: color0
        });
        this.clearPointLine();
        return path;
      }
    }
  }

  // removes points and lines
  public clearPointLine() {
    this.cmsvg = Snap('#cmsvg');
    if (this.cmsvg) {
      let polylines = this.cmsvg.select('#polylines');
      if (polylines) {
        polylines.clear();
      }
      let polypoints = this.cmsvg.select('#polypoints');
      if (polypoints) {
        polypoints.clear();
      }
    }
  }

  // removes points and lines
  public markElement(id: string, groupid: string) {
    console.log(id, groupid);
    this.cmsvg = Snap('#cmsvg');
    let tmrect0 = this.cmsvg.select('#cmark' + groupid);
    if (tmrect0) {
      tmrect0.remove();
    }
    let tomark = this.cmsvg.select('#' + id);
    let grp = this.cmsvg.select('#g' + groupid);
    if (tomark && grp) {
      let tmbbox = tomark.getBBox();
      let tmrect = this.cmsvg.rect(tmbbox.x, tmbbox.y, tmbbox.w, tmbbox.h);
      tmrect.attr({
        id: 'cmark' + groupid,
        title: groupid,
        stroke: '#0000ff',
        strokeWidth: 2,
        fill: 'none',
        opacity: 0.7
      });
      grp.add(tmrect);
    }
  }

  // creates popups for media with thumbnails
  public displayContent(BBox) {
    // makes picture closable by click
    console.log('pic');
  }

}
