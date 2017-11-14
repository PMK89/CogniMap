import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
// import { Snap } from 'snapsvg';
declare var Snap: any;

// services
import { ElementService } from '../../shared/element.service';
import { SnapsvgService } from '../../shared/snapsvg.service';
import { EventService } from '../../shared/event.service';

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
                this.snapsvgService.makeContent(this.cmeo, this.cmgroup, i, totwidth);
              }
              totwidth += content.width;
            }
          }
        }
        let types = this.cmeo.types;
        if (types[0] === 'i' || types[0] === 'p') {
          // console.log(this.cmeo)
        } else {
          if (types[0] === 'm') {
            let emptymark = s.rect(this.cmeo.coor.x, this.cmeo.coor.y, this.cmeo.x1 - this.cmeo.x0, this.cmeo.y1 - this.cmeo.y0);
            emptymark.attr({
              fill: 'none',
              stroke: 'none',
              strokeWidth: 0,
              opacity: 0,
              id: 'marker' + id.toString()
            });
            this.cmgroup.add(emptymark);
          } else {
            let title = s.text(this.cmeo.coor.x, this.cmeo.coor.y, this.cmeo.title);
            title.attr({
              fontSize: this.cmeo.cmobject.style.title.size + 'px',
              fill: this.cmeo.cmobject.style.title.color,
              fontFamily: this.cmeo.cmobject.style.title.font,
              opacity: this.cmeo.cmobject.style.object.trans,
              textDecoration: this.cmeo.cmobject.style.title.deco,
              title: id
            });
            if (this.cmeo.cmobject.style.title.class_array.indexOf('hidden') !== -1) {
              title.attr({display: 'none'});
            }
            this.cmgroup.add(title);
          }
          bbox = this.cmgroup.getBBox();
          let content = this.cmgroup.innerSVG();
          content = content.replace(/ \\"/g, " '");
          content = content.replace(/\\",/g, "',");
          this.snapsvgService.makeShape(this.cmeo, bbox, this.cmgroup);
          this.cmgroup.add(Snap.parse(content));
        }
        bbox = this.cmgroup.getBBox();
        this.cmeo.x0 = bbox.x;
        this.cmeo.y0 = bbox.y;
        this.cmeo.x1 = bbox.x2;
        this.cmeo.y1 = bbox.y2;

        if (this.TextInput === false) {
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
        this.cmgroup.mousedown( () => {
          if (document.getElementById('TPid') !== undefined) {
            console.log('cmobject.component: mousedown');
            document.getElementById('TPid').title = id;
            // console.log(document.getElementById('TPid').title);
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
