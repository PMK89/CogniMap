import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

// cognimap services
import { ElementService } from './element.service';
import { WindowService } from './window.service';
import { SettingsService } from './settings.service';
// import { CMCoor } from '../models/CMCoor';

import { CMSettings } from '../models/CMSettings';
import { CMAction } from '../models/CMAction';

@Injectable()
export class EventService {
  MouseMove: Observable<any> = Observable.fromEvent(document, 'mousemove')
                                .map((event: MouseEvent) => {
                                  return {
                                    x: event.clientX + this.windowService.Win_XOffset,
                                    y: event.clientY + this.windowService.Win_YOffset
                                  };
                                });
  click_x: number;
  click_y: number;
  start_x: number;
  start_y: number;
  drag_x: number;
  drag_y: number;
  id: number;
  dragging: boolean = false;
  cmaction: CMAction = new CMAction;
  cmsettings: CMSettings;

  constructor(private windowService: WindowService,
              private elementService: ElementService) {}

  // handles mouse click
  onMouseClick(evt) {
    // executed if new elements should be created
    this.click_x = Math.round(evt.clientX + this.windowService.Win_XOffset);
    this.click_y = Math.round(evt.clientY + this.windowService.Win_YOffset);
    if (this.elementService.cmsettings.mode === 'new') {
      // console.log(evt.target);
      if (parseInt(evt.target.title, 10) < 0 || evt.target.id === 'cmap' || evt.target.id === 'cmsvg') {
        let coor = {
          x: this.click_x,
          y: this.click_y
        };
        // console.log(coor);
        this.elementService.newElementObj(this.elementService.currentElement, coor);
      } else if (parseInt(evt.target.title, 10) > 0) {
        this.elementService.setSelectedElement(parseInt(evt.target.title, 10));
      }
    } else if (this.elementService.cmsettings.mode === 'edit') {
      if (parseInt(evt.target.title, 10) > 0) {
        this.elementService.setSelectedElement(parseInt(evt.target.title, 10));
      }
    }
  }

  // handles mouse down
  onMouseDown(evt) {
    // used in edit mode to drag
    this.click_x = Math.round(evt.clientX + this.windowService.Win_XOffset);
    this.click_y = Math.round(evt.clientY + this.windowService.Win_YOffset);
    if (this.elementService.cmsettings.mode === 'edit') {
      if (this.elementService.cmsettings.dragging === true) {
        this.start_x = this.click_x;
        this.start_y = this.click_y;
        this.drag_x = 0;
        this.drag_y = 0;
      }
    }
  }

  // handles mouse movement
  onMouseMove() {
    return this.MouseMove;
  }

  // handles mouse movement differences;
  mousedif() {
    return this.MouseMove
      .map(coor => {
        if (this.elementService.cmsettings.dragging === true && this.dragging === true) {
          let dif = {
            x: Math.round(coor.x - this.drag_x),
            y: Math.round(coor.y - this.drag_y)
          };
          this.drag_x = Math.round(coor.x);
          this.drag_y = Math.round(coor.y);
          return dif;
        }
      });
  }

  // handles mouse up
  onMouseUp(evt) {
    // used in edit mode to drag
    if (this.elementService.cmsettings.mode === 'edit') {
      if (this.elementService.cmsettings.dragging === true) {
        this.drag_x = Math.round(evt.clientX  + this.windowService.Win_XOffset) - this.start_x;
        this.drag_y = Math.round(evt.clientY + this.windowService.Win_YOffset) - this.start_y;
        this.elementService.moveElement(this.drag_x, this.drag_y);
        console.log(this.drag_x, this.drag_y);
      }
    }
  }

}
