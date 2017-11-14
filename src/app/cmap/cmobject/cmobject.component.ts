import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';

// services
import { ElementService } from '../../shared/element.service';
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
  dragging: boolean = false;
  contentStyle: Object;
  TextInput: boolean;
  start_x: number;
  start_y: number;
  drag_x: number;
  drag_y: number;

  constructor(private eventService: EventService,
              private store: Store<CMEStore>,
              private elementService: ElementService) { }

  ngOnInit() {
    // adds property to title-div
    // this.TextInput = this.objectService.TextInput;
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
    if (this.cmelement.type === 'a') {
      this.objectClass = this.cmelement.cmobject.style.object.class_array;
      this.objectStyle = {
        'background-color': this.cmelement.cmobject.style.object.color0,
        'opacity': this.cmelement.cmobject.style.object.trans
      };
      this.objectClass = ['a' + this.cmelement.cmobject.style.object.shape];
    }
    if (this.cmelement.cmobject.content) {
      this.hasContent = true;
    }
  }

  contentPos(content) {
    return {
      'position': 'relative',
      'left': content.coor.x,
      'top': content.coor.y,
      'z-index': content.z_pos
    };
  }
  // passes clicked element to object service
  onSelect(cmelement) {
    console.log(cmelement);
    this.elementService.setSelectedElement(cmelement);
    let action = {
      value: 's',
      var: ['type']
    };
    // this.changeElement(action);
  }

  // activates dragging
  onMouseDown() {
    if (this.dragging === false) {
      this.dragging = true;
      this.eventService.mousedown()
      .subscribe(coor => {
        this.start_x = Math.round(coor.x);
        this.start_y = Math.round(coor.y);
        console.log('start_x:', this.start_x, ' start_y:', this.start_y);
        this.drag_x = Math.round(coor.x);
        this.drag_y = Math.round(coor.y);
      });
    }
  }

  // changes position for dragging
  onMouseMove() {
    if (this.dragging === true) {
      let dif_x = 0;
      let dif_y = 0;
      this.eventService.mousemove()
      .subscribe(coor => {
        if (this.dragging === true) {
          dif_x = Math.round((coor.x) - this.drag_x);
          dif_y = Math.round((coor.y) - this.drag_y);
          this.cmelement.coor.x = this.cmelement.coor.x + dif_x;
          this.cmelement.coor.y = this.cmelement.coor.y + dif_y;
          this.drag_x = (coor.x);
          this.drag_y = (coor.y);
        }
      });
    }
  }

  // deactivates dragging
  onMouseUp() {
    this.dragging = false;
    this.elementService.updateElement(this.cmelement);
    let links = this.cmelement.cmobject.links;
    let dif_x = Math.round(this.drag_x - this.start_x);
    let dif_y = Math.round(this.drag_y - this.start_y);
    console.log('dif_x:', dif_x, ' dif_y:', dif_y);
    for (let i = 0; i < links.length; i++) {
      if (links[i]) {
        if (links[i].start) {
          let posaction = {type: 'UPDATE_CME_POSITION0', payload: {
            id: links[i].id,
            x0: dif_x,
            y0: dif_y
          } };
          this.store.dispatch(posaction);
        } else {
          let posaction = {type: 'UPDATE_CME_POSITION1', payload: {
            id: links[i].id,
            x1: dif_x,
            y1: dif_y
          } };
          this.store.dispatch(posaction);
        }
      }
    }
  }

  // Sets number
  changeElement(action) {
    this.elementService.changeElement(action);
  }
  passText(text) {
    this.cmelement.title = text;
    this.elementService.setSelectedElement(this.cmelement);
  }

}
