import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

// cognimap services
import { WindowService } from './window.service';
import { Boundaries } from '../models/boundaries';

@Injectable()
export class EventService {
  boundaries: Boundaries = this.windowService.Boundaries0;
  MouseMove: Observable<any> = Observable.fromEvent(document, 'mousemove')
                                .map((event: MouseEvent) => {
                                  return {
                                    x: event.clientX + this.windowService.Win_XOffset,
                                    y: event.clientY + this.windowService.Win_YOffset
                                  };
                                });
  MouseDown: Observable<any> = Observable.fromEvent(document, 'mousedown')
                              .map((event: MouseEvent) => {
                                return {
                                  x: event.clientX + this.windowService.Win_XOffset,
                                  y: event.clientY + this.windowService.Win_YOffset
                                };
                              });
  start_x: number;
  start_y: number;

  constructor(private windowService: WindowService) {  }
  // handles mouse down
  mousedown() {
    return this.MouseDown;
  }

  // handles mouse movement
  mousemove() {
    return this.MouseMove;
  }

}
