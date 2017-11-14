import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import 'snapsvg';
declare var Snap: any;

// services
import { ElementService } from '../../shared/element.service';
import { SnapsvgService } from '../../shared/snapsvg.service';
import { EventService } from '../../shared/event.service';

// models and reducers
import { CMElement } from '../../models/CMElement';
import { CMEStore } from '../../models/CMEstore';

@Component({
  selector: 'app-cmobject',
  templateUrl: './cmobject.component.html',
  styleUrls: ['./cmobject.component.scss']
})
export class CmobjectComponent implements OnInit {
  @Input() cmelement: CMElement;
  cmgroup: any;
  objectStyle: Object;
  objectClass: Array<string>;
  textStyle: Object;
  textClass: Array<string>;
  hasContent: boolean;
  svgid: string;
  // dragging: boolean = false;
  contentStyle: Object;
  TextInput: boolean;

  constructor(private eventService: EventService,
              private snapsvgService: SnapsvgService,
              private store: Store<CMEStore>,
              private elementRef: ElementRef,
              private elementService: ElementService) {
              }

  ngOnInit() {
    if (this.cmelement.active) {
      this.TextInput = true;
    }
    let s = Snap('#cmsvg');
    let id = this.cmelement.id;
    if (this.cmelement.prio <= 0) {
      this.cmelement.prio = 0;
    } else if (this.cmelement.prio >= 99) {
      this.cmelement.prio = 99;
    }
    this.cmgroup = s.select('#cmo' + this.cmelement.prio.toString()).group();
    this.cmgroup.attr({
      id: ('g' + id.toString()),
      title: id.toString()
    });
    // transfers id in case of click events
    this.cmgroup.mousedown(function( ){
      if (document.getElementById('TPid') !== undefined) {
        document.getElementById('TPid').title = id.toString();
        // console.log(document.getElementById('TPid').title);
      }
    });
    let img = s.image('assets/images/basic/empty.png', (this.cmelement.coor.x),
    (this.cmelement.coor.y));
    if (this.cmelement.cmobject.content.length > 0) {
      for (let i in this.cmelement.cmobject.content) {
        if (this.cmelement.cmobject.content[i]) {
          let content = this.cmelement.cmobject.content[i];
          if (content.cat === 'i') {
            img = s.image(('assets/images/' + content.object), (this.cmelement.coor.x + content.coor.x),
            (this.cmelement.coor.y + content.coor.y));
            this.cmgroup.add(img);
          } else if (content.cat === 'l' || content.cat === 'p') {
            img = s.image('assets/images/basic/empty.png', (this.cmelement.coor.x + content.coor.x),
            (this.cmelement.coor.y + content.coor.y));
            this.cmgroup.add(img);
          } else {
            img = s.image(content.object, (this.cmelement.coor.x + content.coor.x),
            (this.cmelement.coor.y + content.coor.y));
            this.cmgroup.add(img);
          }
        }
      }
    } else {
      let title = s.text(this.cmelement.coor.x, this.cmelement.coor.y, this.cmelement.title);
      title.attr({
        fontSize: this.cmelement.cmobject.style.title.size + 'px',
        fill: this.cmelement.cmobject.style.title.color,
        fontFamily: this.cmelement.cmobject.style.title.font,
        opacity: this.cmelement.cmobject.style.object.trans,
        title: this.cmelement.id.toString()
      });
      this.cmgroup.add(title);
      let bbox = this.cmgroup.getBBox();
      this.snapsvgService.makeShape(this.cmelement, bbox, this.cmgroup);
      this.cmgroup.add(title);
    }
    // enables dragging of the group
    if (this.cmelement.dragging) {
      let move = function(dx, dy) {
          this.attr({
                      transform: this.data('origTransform') + (this.data('origTransform') ? 'T' : 't') + [dx, dy]
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
      console.log('undrag');
    }
    // adds property to title-div
    // this.TextInput = this.objectService.TextInput;
    /*
    this.textStyle = {
      'font-size': this.cmelement.cmobject.style.title.size + 'px',
      'font-color': this.cmelement.cmobject.style.title.color,
      'font': this.cmelement.cmobject.style.title.font,
      'position': 'relative',
      'text-align': 'center',
      'left': '0px',
      'top': '0px',
      'z-index': 10
    };
    this.textClass = this.cmelement.cmobject.style.title.class_array;
    this.objectStyle = {
      'opacity': this.cmelement.cmobject.style.object.trans
    };
    // adds attributes to standard a element
    if (this.cmelement.types[0] === 'a') {
      this.objectClass = this.cmelement.cmobject.style.object.class_array;
      this.objectStyle = {
        'background-color': this.cmelement.cmobject.style.object.color0,
        'opacity': this.cmelement.cmobject.style.object.trans
      };
      this.objectClass = ['a' + this.cmelement.types[1]];
    } else if (this.cmelement.types[0] === 's') {
      let svgid1 = document.getElementById(this.svgid);
      console.log(svgid1);
      this.snapsvgService.makeShape(this.cmelement);
    }
    if (this.cmelement.cmobject.content) {
      this.hasContent = true;
    }
    // console.log(this.cmelement);
    // console.log('title: ', this.cmelement.title, ' w: ', (this.cmelement.x1 -
    this.cmelement.x0), ' h: ', (this.cmelement.y1 - this.cmelement.y0))
    if (this.cmelement.dragging === true && this.eventService.dragging === true) {
      this.eventService.mousedif()
        .subscribe(coor => {
          this.cmelement.coor.x = this.cmelement.coor.x + coor.x;
          this.cmelement.coor.y = this.cmelement.coor.y + coor.y;
        });
    }
    */
  }

  // gets dimensions after view is initiated
  ngOnDestroy() {

    let s = Snap('#cmsvg');
    let oldelem = s.select('#g' + this.cmelement.id.toString());
    if (oldelem) {
      oldelem.remove();
      // console.log('removed');
    }

  }

  // converts utf-8 text
  /*
  decode_utf8(utftext: string) {
    let plaintext = '';
    let i = 0;
    let c, c1, c2 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        plaintext += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c1 = utftext.charCodeAt(i + 1);
        plaintext += String.fromCharCode((( c&31 ) << 6) | (c2&63));
        i += 2;
      } else {
        c1 = utftext.charCodeAt(i + 1); c2 = utftext.charCodeAt(i + 2);
        plaintext += String.fromCharCode(((c&15)<<12) | ((c1&63)<<6) | (c2&63));
        i += 3;
      }
    }
    console.log(plaintext);
    return plaintext;
  } */

  // set content possition
  contentPos(content) {
    if (content) {
      return {
        'position': 'relative',
        'left': content.coor.x,
        'top': content.coor.y,
        'z-index': content.z_pos
      };
    }
  }
  // get dimensions
  getDimensions() {
    this.cmelement.x1 = this.cmelement.x0 + this.elementRef.nativeElement.offsetWidth;
    this.cmelement.y1 = this.cmelement.y0 + this.elementRef.nativeElement.offsetHeight;
    this.elementService.newDBElement(this.cmelement);
  }

  // creates an action of entered text
  passText(text) {
    // console.log(text);
    this.cmelement.title = text;
    this.elementService.updateElement(this.cmelement);
    this.elementService.setInactive(this.cmelement.id);
  }
  // Sets number
  changeElement(action) {
    this.elementService.changeElement(action);
  }
}
