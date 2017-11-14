import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';

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

// generates markers, titles, places contetnt and starts generation of shapes
export class CmobjectComponent implements OnInit {
  @Input() cmelement: CMElement;
  objectStyle: Object;
  objectClass: Array<string>;
  textStyle: Object;
  textClass: Array<string>;
  hasContent: boolean;
  svgid: string;
  svgStyle: Object;
  // dragging: boolean = false;
  contentStyle: Object;
  TextInput: boolean;

  constructor(private eventService: EventService,
              private store: Store<CMEStore>,
              private elementRef: ElementRef,
              private snapsvgService: SnapsvgService,
              private elementService: ElementService) {
              }

  ngOnInit() {
    // adds property to title-div
    // this.TextInput = this.objectService.TextInput;
    this.svgid = 'svg' + this.cmelement.id.toString();
    // adds objectstyle for every object
    this.objectStyle = {
      'opacity': this.cmelement.cmobject.style.object.trans,
      'overflow': 'auto'
    };
    // adds attributes to standard (a) element
    if (this.cmelement.type[0] === 'a') {
      this.objectClass = this.cmelement.cmobject.style.object.class_array;
      this.objectStyle = {
        'background-color': this.cmelement.cmobject.style.object.color0,
        'overflow': 'auto',
        'opacity': this.cmelement.cmobject.style.object.trans
      };
      this.objectClass = ['a' + this.cmelement.type[1]];
    }
    // generates  style for text object
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
    // generates style for svg object
    this.svgStyle = {
      'position': 'absolute',
      'left': '0px',
      'top': '0px',
      'z-index': 0
    };
    this.textClass = this.cmelement.cmobject.style.title.class_array;

    this.snapsvgService.makeShape(this.cmelement);
    if (this.cmelement.cmobject.content) {
      this.hasContent = true;
    }
    if (this.cmelement.active) {
      this.getDimensions();
    }
    // console.log('o');

    if (this.cmelement.dragging === true && this.eventService.dragging === true) {
      this.eventService.mousedif()
        .subscribe(coor => {
          this.cmelement.coor.x = this.cmelement.coor.x + coor.x;
          this.cmelement.coor.y = this.cmelement.coor.y + coor.y;
        });
    }
    if (this.cmelement.active) {
      this.getDimensions();
    }
  }


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
    this.elementService.updateDBElement(this.cmelement);
    console.log(this.cmelement.x1, this.cmelement.y1);
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
