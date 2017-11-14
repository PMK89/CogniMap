import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

// cognimap services
import { ElementService } from './element.service';
import { WindowService } from './window.service';
import { SettingsService } from './settings.service';
// import { CMCoor } from '../models/CMCoor';

import { CMSettings } from '../models/CMSettings';

@Injectable()
export class EventService {
  MouseMove: Observable<any> = Observable.fromEvent(document, 'mousemove')
                                .map((event: MouseEvent) => {
                                  return {
                                    x: event.clientX + this.windowService.Win_XOffset,
                                    y: event.clientY + this.windowService.Win_YOffset
                                  };
                                });
  start_x: number;
  start_y: number;
  drag_x: number;
  drag_y: number;
  id: number;
  dragging: boolean = false;
  cmsettings: CMSettings;

  constructor(private windowService: WindowService,
              private settingsService: SettingsService,
              private elementService: ElementService) {
                this.settingsService.cmsettings
                    .subscribe(data => {
                      this.cmsettings = data;
                      // console.log(data);
                    });
              }

  // handles mouse click
  onMouseClick(evt) {
    // executed if new elements should be created
    if (this.cmsettings.mode === 'new') {
      // console.log('MouseClick');
      if (parseInt(evt.target.title, 10) < 0 || evt.target.id === 'cmap') {
        let coor = {
          x: Math.round(evt.clientX  + this.windowService.Win_XOffset),
          y: Math.round(evt.clientY + this.windowService.Win_YOffset)
        };
        this.elementService.newElementObj(this.elementService.currentElement, coor);
      } else if (parseInt(evt.target.title, 10) > 0) {
        this.elementService.setSelectedElement(parseInt(evt.target.title, 10));
      }
    } else if (this.cmsettings.mode === 'edit') {
      if (parseInt(evt.target.title, 10) > 0) {
        this.elementService.setSelectedElement(parseInt(evt.target.title, 10));
      }
    }
  }

  // handles mouse down
  onMouseDown(evt) {
    // used in edit mode to drag
    if (this.cmsettings.mode === 'edit') {
      if (this.cmsettings.dragging === true && this.dragging === false) {
        this.dragging = true;
        this.id = parseInt(evt.target.title, 10);
        console.log('MouseDown', this.id);
        if ( this.id >= 1) {
          this.elementService.setDrag(this.id);
          // this.elementService.setSelectedElement(this.id);
        }
        this.start_x = Math.round(evt.clientX  + this.windowService.Win_XOffset);
        this.start_y = Math.round(evt.clientY + this.windowService.Win_YOffset);
        this.drag_x = Math.round(evt.clientX  + this.windowService.Win_XOffset);
        this.drag_y = Math.round(evt.clientY + this.windowService.Win_YOffset);
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
        if (this.cmsettings.dragging === true && this.dragging === true) {
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
    if (this.cmsettings.mode === 'edit') {
      if (this.cmsettings.dragging === true && this.dragging === true) {
        this.elementService.setNoDrag(this.id);
        this.drag_x = Math.round(evt.clientX  + this.windowService.Win_XOffset);
        this.drag_y = Math.round(evt.clientY + this.windowService.Win_YOffset);
        if ( this.id >= 1) {
          // this.elementService.setDrag(this.id);
          this.elementService.setSelectedElement(this.id);
        }
        this.dragging = false;
        console.log('MouseUp');
      }
    }
  }

}
