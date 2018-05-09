import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
// import { Snap } from 'snapsvg';
declare var Snap: any;

// services
import { ElementService } from '../../shared/element.service';
import { SnapsvgService } from '../../shared/snapsvg.service';
import { EventService } from '../../shared/event.service';
import { MetaService } from '../../shared/meta.service';

// models and reducers
import { CME } from '../../models/CME';
import { CMEo } from '../../models/CMEo';
import { CMStore } from '../../models/CMStore';

@Component({
  selector: 'app-cmobject',
  templateUrl: './cmobject.component.html',
  styleUrls: ['./cmobject.component.scss']
})
export class CmobjectComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() public cmelement: CME;
  @ViewChild('box') public vc;
  public cmeo: CMEo;
  public cmgroup: any;
  public textStyle: Object;
  public textClass: string[];
  public inputtext: string = this.elementService.inputtext;
  public TextInput = false;
  public video = false;
  public html: any;
  public videourl: string;

  constructor(private eventService: EventService,
              private snapsvgService: SnapsvgService,
              private metaService: MetaService,
              private sanitizer: DomSanitizer,
              private store: Store<CMStore>,
              private elementService: ElementService) {
              }

  public ngAfterViewInit() {
    if (this.TextInput) {
      this.vc.nativeElement.focus();
    }
  }

  public ngOnInit() {
    if (this.cmelement) {
      // let d = new Date();
      // let t0 = d.getTime();
      // console.log('cmobject start: ', this.cmelement, t0);
      let s = Snap('#cmsvg');
      let id = this.cmelement.id.toString();
      if (this.cmelement.id < 1) {
        id = id.replace('.', '_');
      }
      this.cmgroup = s.select('#cmo' + this.cmelement.prio.toString()).group();
      if (this.cmgroup === undefined) {
        this.cmgroup = s.select('#cmo99').group();
      }
      this.cmgroup.attr({
        id: ('g' + id),
        title: id
      });
      if (this.cmelement.prep !== '' && this.cmelement.prep !== undefined) {
        this.cmgroup.append(Snap.parse(this.cmelement.prep));
        // console.log(this.cmelement.prep);
      } else {
        let marking = s.select('#cmmark' + id);
        if (marking) {
          marking.remove();
        }
        this.cmeo = this.elementService.CMEtoCMEol(this.cmelement);
        // console.log(this.cmeo);
        if (this.cmeo.prio <= 0) {
          this.cmeo.prio = 0;
        } else if (this.cmeo.prio >= 99) {
          this.cmeo.prio = 99;
        }
        let bbox0 = this.cmgroup.getBBox();
        let bbox = this.cmgroup.getBBox();
        if (this.cmeo.cmobject.content.length > 0) {
          // generates content as svg
          // checks for markers with video
          let totwidth = 0;
          for (let i in this.cmeo.cmobject.content) {
            if (this.cmeo.cmobject.content[i]) {
              let content = this.cmeo.cmobject.content[i];
              if (this.cmeo.cmobject.content[i].cat === 'mp4') {
                console.log(content);
                this.video = true;
                this.videourl = content.object;
              } else {
                if (this.cmeo.cmobject.content[i].cat === 'im') {
                  if (this.cmeo.state === 'typing') {
                    this.cmeo.state = 'selected';
                  }
                }
                let oldwidth = bbox.w - bbox0.w;
                this.snapsvgService.makeContent(this.cmeo, this.cmgroup, i, totwidth);
                bbox = this.cmgroup.getBBox();
                content.width = bbox.w - oldwidth;
              }
              totwidth += content.width + (content.width / 20);
            }
          }
        } else if (this.cmeo.types[0].indexOf('q') !== -1) {
          let midx = this.cmeo.x0 + ((this.cmeo.x1 - this.cmeo.x0) / 2);
          let midy = this.cmeo.y0 + ((this.cmeo.y1 - this.cmeo.y0) / 2);
          let anstxt = s.text((midx - 40), (midy - 10), 'Check answer');
          anstxt.attr({
            fontSize: this.cmeo.cmobject.style.title.size + 'px',
            fill: this.cmeo.cmobject.style.title.color,
            fontFamily: this.cmeo.cmobject.style.title.font,
            opacity: this.cmeo.cmobject.style.object.trans,
            id: 'ansbtn' + id.toString(),
            title: id
          });
          let ansbbox = anstxt.getBBox();
          let ansrect = s.rect(ansbbox.x, ansbbox.y, ansbbox.w, ansbbox.h);
          ansrect.attr({
            id: 'cont' + id.toString() + '_ans',
            title: id,
            strokeWidth: 2,
            fill: '#ffffff',
            opacity: 0
          });
          this.cmgroup.add(anstxt);
          this.cmgroup.add(ansrect);
        }
        let types = this.cmeo.types;
        if (types[0] === 'i' || types[0] === 'p') {
          // console.log(this.cmeo)
        } else {
          if (types[0] === 'm' || this.cmeo.types[0].indexOf('q') !== -1) {
            let emptymark = s.rect(this.cmeo.coor.x, this.cmeo.coor.y, this.cmeo.x1 - this.cmeo.x0, this.cmeo.y1 - this.cmeo.y0);
            emptymark.attr({
              fill: 'none',
              stroke: 'none',
              strokeWidth: 0,
              opacity: 0,
              id: 'marker' + id.toString()
            });
            this.cmgroup.add(emptymark);
          }
          if (types[0] !== 'm') {
            let title = s.text(this.cmeo.coor.x, this.cmeo.coor.y, this.cmeo.title);
            title.attr({
              fontSize: this.cmeo.cmobject.style.title.size + 'px',
              fill: this.cmeo.cmobject.style.title.color,
              fontFamily: this.cmeo.cmobject.style.title.font,
              opacity: this.cmeo.cmobject.style.object.trans,
              textDecoration: this.cmeo.cmobject.style.title.deco,
              id: 'title' + id.toString(),
              title: id
            });
            if (this.cmeo.cmobject.style.title.class_array.indexOf('hidden') !== -1) {
              title.attr({display: 'none'});
            }
            this.cmgroup.add(title);
          }
          bbox = this.cmgroup.getBBox();
          if (this.cmeo.cmobject.meta) {
            if (this.cmeo.cmobject.meta.length > 0) {
              for (let key in this.cmeo.cmobject.meta) {
                // ads symbol for each meta element + click function to open meta element
                if (this.cmeo.cmobject.meta[key]) {
                  let metaImg;
                  let meta = this.cmeo.cmobject.meta[key];
                  let size = this.cmeo.cmobject.style.title.size * 1.0;
                  switch (meta.type) {
                    case 'pdf':
                      metaImg = s.image('assets/images/svgelements/symbols/pdf.svg',
                      bbox.x2, (this.cmeo.coor.y - size * 0.8), size, size);
                      break;
                    case 'videos':
                      metaImg = s.image('assets/images/svgelements/symbols/video.svg',
                      bbox.x2, (this.cmeo.coor.y - size * 0.8), size, size);
                      break;
                    case 'audio':
                      metaImg = s.image('assets/images/svgelements/symbols/audio.svg',
                      bbox.x2, (this.cmeo.coor.y - size * 0.8), size, size);
                      break;
                    case 'link':
                      metaImg = s.image('assets/images/svgelements/symbols/link.svg',
                      bbox.x2, (this.cmeo.coor.y - size * 0.8), size, size);
                      break;
                    case 'txt':
                      metaImg = s.image('assets/images/svgelements/symbols/txt.svg',
                      bbox.x2, (this.cmeo.coor.y - size * 0.8), size, size);
                      break;
                    case 'comment':
                      metaImg = s.image('assets/images/svgelements/symbols/comment.svg',
                      bbox.x2, (this.cmeo.coor.y - size * 0.8), size, size);
                      break;
                    case 'code':
                      metaImg = s.image('assets/images/svgelements/symbols/code.svg',
                      bbox.x2, (this.cmeo.coor.y - size * 0.8), size, size);
                      break;
                    default:
                      console.log('unknown type: ', meta.type);
                  }
                  if (metaImg) {
                    metaImg.attr({id: id + 'meta' + key.toString()});
                    this.cmgroup.add(metaImg);
                    bbox = this.cmgroup.getBBox();
                  }
                }
              }
            }
          }
          let content = this.cmgroup.innerSVG();
          content = content.replace(/ \\"/g, " '");
          content = content.replace(/\\",/g, "',");
          this.cmgroup.clear();
          this.snapsvgService.makeShape(this.cmeo, bbox, this.cmgroup);
          this.cmgroup.add(Snap.parse(content));
        }
        // sets size of element
        bbox = this.cmgroup.getBBox();
        if (this.cmeo.types[0] !== 'm' && this.cmeo.types[0].indexOf('q') === -1) {
          this.cmeo.x0 = bbox.x;
          this.cmeo.y0 = bbox.y;
          this.cmeo.x1 = bbox.x2;
          this.cmeo.y1 = bbox.y2;
        }
        if (this.cmeo.cmobject.meta.length === 0) {
          let text = this.cmgroup.select('#title' + id.toString());
          if (text) {
            let tbbox = text.getBBox();
            let xdif = ((bbox.x2 - bbox.x) / 2) - ((tbbox.x2 - tbbox.x) / 2);
            text.transform('t' + xdif.toString() + ',0');
          }
        }
        // saves prepared element to save loading time
        if (this.TextInput === false) {
          // performes a matrix transformation
          if (this.cmeo.cmobject.style.object.str) {
            if (['q', 'q1', 's'].indexOf(this.cmeo.types[0]) === -1) {
              let matrixstr = this.cmeo.cmobject.style.object.str;
              try {
                let tmo = JSON.parse(matrixstr);
                console.log(tmo);
                let transformmatrix = Snap.matrix(tmo.a, tmo.b, tmo.c, tmo.d, tmo.e, tmo.f);
                console.log(transformmatrix);
                this.cmgroup.transform(transformmatrix);
                /*
                let innertcmo = this.cmgroup.innerSVG();
                let stbcmo = Snap.parse(innertcmo);
                let matrixgroup = s.g(stbcmo);
                this.cmgroup.remove();
                this.cmgroup = s.select('#cmo' + this.cmelement.prio.toString()).group(matrixgroup);
                this.cmgroup.attr({
                  id: ('g' + id),
                  title: id
                });
                */
              } catch (err) {
                console.log('Error at Matrix transform', this.cmeo.id, err);
              }
            }
          }
          if (this.elementService.selCMEo) {
            if (this.elementService.selCMEo.id === this.cmeo.id) {
              this.elementService.updateSelCMEo(this.cmeo);
            }
          }
          let prep = this.cmgroup.innerSVG();
          prep = prep.replace(/ \\"/g, " '");
          prep = prep.replace(/\\",/g, "',");
          this.cmeo.prep = prep;
          this.cmelement.prep = prep;
          // console.log(prep);
          this.elementService.updateCMEol(this.cmeo);
        }
      }
      if (this.cmelement.id < 1) {
        // console.log(this.cmelement);
        let stb = Snap('#templatesvg');
        let bbox = this.cmgroup.getBBox();
        let innertcmo = this.cmgroup.innerSVG();
        let scaling = Math.min((40 / bbox.h), (100 / bbox.w));
        let stbcmo = Snap.parse(innertcmo);
        let gt = stb.group().append(stbcmo);
        gt.attr({
          id: ('gt' + id),
          title: id
        });
        gt.transform('s' + scaling);
        gt.transform('t240,235');
      } else {
        // transfers id in case of click events
        this.cmgroup.mousedown( (e) => {
          if (document.getElementById('TPid') !== undefined) {
            if (e.target) {
              if (e.target.id) {
                if (e.target.id.indexOf('meta') === -1 && e.target.id.indexOf('_') === -1) {
                  document.getElementById('TPid').title = id;
                } else {
                  if (!this.cmeo) {
                    this.cmeo = this.elementService.CMEtoCMEol(this.cmelement);
                  }
                  if (e.target.id.indexOf('meta') !== -1) {
                    let pos = e.target.id.substr((e.target.id.indexOf('meta') + 4));
                    let arg = JSON.stringify(this.cmeo.cmobject.meta[pos]);
                    console.log(arg);
                    document.getElementById('TPmeta').title = arg;
                  }
                  if (e.target.id.indexOf('_') !== -1) {
                    document.getElementById('TPquiz').title = e.target.id;
                  }
                }
              } else {
                document.getElementById('TPid').title = id;
              }
            }
          }
        });

        // generates marking for different states
        if (this.cmelement.state !== '') {
          let cmBBox = this.cmgroup.getBBox();
          let marking = s.ellipse(cmBBox.cx, cmBBox.cy, (cmBBox.r0), (cmBBox.h));
          marking.attr({
            fill: 'none',
            opacity: 0.5,
            strokeWidth: 5,
            id: 'cmmark' + this.cmelement.id
          });
          // marks selected Element
          if (this.cmelement.state === 'selected') {
            marking.attr({stroke: '#0000ff'});
          }
          if (this.cmelement.state === 'typing') {
            this.TextInput = true;
            this.elementService.inputtext = this.cmelement.title;
            marking.attr({stroke: '#00ff00'});
          }
          if (this.cmelement.state === 'svginput') {
            this.TextInput = true;
            marking.attr({stroke: '#ef18f7'});
          }
          // enables dragging of the group
          if (this.cmelement.state === 'dragging') {
            marking.attr({stroke: '#ff0000'});
            let move = function(dx, dy) {
              this.attr({
                        transform: this.data('origTransform') +
                         (this.data('origTransform') ? 'T' : 't') + [dx, dy]
                      });
                    };

            let start = function() {
                this.data('origTransform', this.transform().local );
              };
            let stop = function() {
                // console.log('finished dragging');
                document.getElementById('TPid').title = '0';
                // document.getElementById('TPy').title = this.cmgroup.attr('y');
              };
            this.cmgroup.drag(move, start, stop);
          } else {
            this.cmgroup.undrag();
            // console.log('undrag');
          }
          this.cmgroup.add(marking);
          // this.cmgroup.add(marking);
        } else {
          let marking = s.select('#cmmark' + id);
          if (marking) {
            marking.remove();
          }
          let tmrect0 = s.select('#cmark' + id);
          if (tmrect0) {
            tmrect0.remove();
          }
        }
        // d = new Date();
        // let t1 = d.getTime();
        // console.log('cmobject end: t', t1, 'delta_t:', (t1 - t0));
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
      let oldstbelem = stb.select('#gt' + id);
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

  }

  // creates an action of entered text
  public passText(text) {
    this.TextInput = false;
    if (this.cmelement.state === 'svginput') {
      // something
    } else if (this.cmelement.state === 'typing') {
      this.elementService.changeCMEo({variable: ['title'], value: text});
    }
  }

  // Sets number
  public updateText(text) {
    this.elementService.inputtext = text;
  }

  // Sets number
  public changeElement(action) {
    this.elementService.changeCMEo(action);
  }
}
