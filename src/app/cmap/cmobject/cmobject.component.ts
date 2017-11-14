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
export class CmobjectComponent implements OnInit {
  @Input() cmelement: CMElement;
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
    // adds property to title-div
    // this.TextInput = this.objectService.TextInput;
    this.svgid = 'svg' + this.cmelement.id.toString();
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
    // console.log('title: ', this.cmelement.title, ' w: ', (this.cmelement.x1 - this.cmelement.x0), ' h: ', (this.cmelement.y1 - this.cmelement.y0))
    if (this.cmelement.dragging === true && this.eventService.dragging === true) {
      this.eventService.mousedif()
        .subscribe(coor => {
          this.cmelement.coor.x = this.cmelement.coor.x + coor.x;
          this.cmelement.coor.y = this.cmelement.coor.y + coor.y;
        });
    }
  }

  // gets dimensions after view is initiated
  ngAfterViewInit() {
      // this.getDimensions();
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
