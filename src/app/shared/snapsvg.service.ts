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
              private cmlsvgService: CmlsvgService) {
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      if (data !== undefined) {
                        this.cmsettings = data;
                        // console.log(data);
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
      default:
        this.cmosvgService.createTest(cme, bbox, cmg);
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
      default:
        this.cmlsvgService.createLine(cme, this.cmsvg, cmg);
    }
  }

  // generates shape from prepared string or initiates new creation
  public makeContent(cme: any, cmg: any, i: any, totwidth: number) {
    console.log(cmg);
    if (typeof cme.cmobject === 'string') {
      cme = this.elementService.CMEtoCMEol(cme);
    }
    if (cme !== undefined && this.cmsettings !== undefined) {
      this.cmsvg = Snap('#cmsvg');
      let con;
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
              if (content.object.indexOf('assets/') === -1) {
                path = 'assets/images/' + content.object;
              } else {
                path = content.object;
              }
              con = s.image((path), coorX, coorY);
              cmg.add(con);
              con.attr({
                opacity: cme.cmobject.style.object.trans,
                id: id.toString() + '_' + i.toString(),
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
                  console.log();
                  conBig.attr({
                    opacity: cme.cmobject.style.object.trans,
                    id: id.toString() + '_' + i.toString() + 'Big',
                    title: id
                  });
                  conBig.transform('s' + (content.height / 100));
                  conBig.click( () => {
                    conBig.remove();
                  });
                });
              }
              break;
            case 'svg':
              // inserts svg to marker group
              let svggroup = cmg.g();
              con = Snap.parse(content.object);
              svggroup.append(con);
              // svggroup.selectAll('rect').remove();
              let svgbbox = svggroup.getBBox();
              console.log(svgbbox);
              svggroup.transform('t' + (coorX + totwidth - svgbbox.x) + ',' + (coorY - svgbbox.y));
              content.width = svgbbox.width;
              cmg.add(svggroup);
              cmg.transform('s' + (content.height / 100));
              break;
            case 'jsme-svg':
              // inserts jsme-svg to marker group and removes white rect
              let jsmesvggroup = cmg.g();
              con = Snap.parse(content.object);
              jsmesvggroup.append(con);
              jsmesvggroup.selectAll('rect').remove();
              let jsmesvgbbox = jsmesvggroup.getBBox();
              console.log(jsmesvgbbox);
              jsmesvggroup.transform('t' + (coorX + totwidth - jsmesvgbbox.x) + ',' + (coorY - jsmesvgbbox.y));
              content.width = jsmesvgbbox.width;
              cmg.add(jsmesvggroup);
              cmg.transform('s' + (content.height / 100));
              break;
            case 'LateX':
              // do something with images
              let xmlgroup = cmg.g();
              let mjsvg = this.mathjaxService.getMjSVG(content.object);
              con = Snap.parse(mjsvg);
              xmlgroup.append(con);
              let xmlbbox = xmlgroup.getBBox();
              console.log(xmlgroup);
              xmlgroup.transform('t' + (coorX + totwidth - xmlbbox.x) + ',' + (coorY - xmlbbox.y));
              content.width = xmlbbox.width;
              cmg.add(xmlgroup);
              break;
            case 'html':
              // do something with html
              let htmlgroup = cmg.g();
              con = Snap.parse(content.object);
              htmlgroup.append(con);
              let htmlbbox = htmlgroup.getBBox();
              console.log(htmlgroup);
              htmlgroup.selectAll('foreignObject').attr({
                x: (coorX + totwidth - htmlbbox.x),
                y: (coorY - htmlbbox.y)
              });
              content.width = htmlbbox.width;
              cmg.add(htmlgroup);
              break;
            case 'p':
              // do something with images
              con = s.image('assets/images/basic/empty.png', coorX, coorY);
              cmg.add(con);
              break;
            case 'l':
              // do something with images
              con = s.image('assets/images/basic/empty.png', coorX, coorY);
              cmg.add(con);
              break;
            case 'mp4':
              console.log(content.object);
              break;
            default:
              // do something with images {
              console.log('no usable content found');
              break;
          }
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

  // creates popups for media with thumbnails
  public displayContent(BBox) {
    // makes picture closable by click
    console.log('pic');
  }

}
