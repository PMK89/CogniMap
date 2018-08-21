import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

// services
import { ElementService } from '../shared/element.service';
import { EventService } from '../shared/event.service';

// models and reducers
import { CMStore } from '../models/CMStore';

@Component({
  selector: 'app-cmap',
  templateUrl: './cmap.component.html',
  styleUrls: ['./cmap.component.scss']
})
export class CmapComponent implements OnInit {
  public cmelements: Observable<any[]>;
  public cmsettings: any;
  public selCMEo: any;
  public minicmap = false;
  public color0 = '#440000';
  public color1 = '#220000';
  public quiz = 'q';
  public selection = {
    'display': 'none',
    'left': '0px',
    'top': '0px',
    'width': '0px',
    'z-index': 200,
    'height': '0px'
  };
  public position = {
    display: 'none',
    left: '0px',
    top: '0px'
  };

  constructor(private elementService: ElementService,
              private eventService: EventService,
              private store: Store<CMStore>) {
                this.cmelements = store.select('cmes');
                // subscribes to settings
                this.store.select('settings')
                .subscribe((data) => {
                  if (data) {
                    this.cmsettings = data;
                    let selCMEo0 = this.selCMEo;
                    if (this.cmsettings.mode.indexOf('quiz') === -1 || this.cmsettings.mode === 'quizing') {
                      if ((this.cmsettings.mode === 'typing' || this.cmsettings.mode === 'dragging') && selCMEo0['types'][0] === 'q') {
                        this.quiz = '';
                      } else if (this.cmsettings.mode === 'progress') {
                        this.quiz = '';
                      } else {
                        this.quiz = 'q';
                      }
                    } else {
                      this.quiz = '';
                    }
                    /*
                    if (this.cmsettings.mode === 'draw_poly') {
                      if (this.cmsettings.pointArray) {
                        if (this.cmsettings.pointArray.length !== this.pointArray.length) {
                          this.pointArray = this.cmsettings.pointArray;
                          console.log(this.pointArray);
                        }
                      }
                    }
                    */
                  }
                  // console.log('settings ', data);
                });
                this.store.select('selectedcmeo')
                .subscribe((data) => {
                  if (data ) {
                    if (data !== {}) {
                      this.selCMEo = data;
                      if (this.selCMEo) {
                        if (this.selCMEo['cmobject']['style']['object']) {
                          this.color0 = this.selCMEo['cmobject']['style']['object']['color0'];
                          this.color1 = this.selCMEo['cmobject']['style']['object']['color1'];
                        }
                      }
                    }
                  }
                  // console.log('settings ', data);
                });
                // this.elementService.getMaxID();
                this.eventService.mousedif()
                .subscribe(
                  (data) => {
                    if (data) {
                      if (data['left'] && data['top'] && data['width'] && data['height']) {
                        this.selection.left = data['left'] + 'px';
                        this.selection.top = data['top'] + 'px';
                        this.selection.width = data['width'] + 'px';
                        this.selection.height = data['height'] + 'px';
                        this.selection.display = 'block';
                        if (data['background-color'] && data['opacity']) {
                          this.selection['background-color'] = data['background-color'];
                          this.selection['opacity'] = data['opacity'];
                        }
                        // console.log(data);
                      } else {
                        this.selection.display = 'none';
                      }
                    } else {
                      this.selection.display = 'none';
                    }
                  },
                  (error) => console.log(error)
                );
                this.eventService.keyUp()
                .subscribe(
                  (data) => {
                    if (data) {
                      if (data['y'] && data['x']) {
                        this.position.left = data['x'] + 'px';
                        this.position.top = data['y'] + 'px';
                        this.position.display = 'block';
                        // console.log(data);
                      } else {
                        this.position.display = 'none';
                      }
                    } else {
                      this.position.display = 'none';
                    }
                  },
                  (error) => console.log(error)
                );
              }

  public ngOnInit() {}

  // controls style of point elementService
  public getStylePoint(point) {
    if (point['x'] && point['y']) {
      if (this.color0 && this.color1) {
        // console.log(point['x'], point['y']);
        return {
          'top': (point['y'] - 2).toString() + 'px',
          'left': (point['x'] - 2).toString() + 'px',
          'background-color': this.color0
        };
      }
    }
  }

  public trackCME(index, cmelement) {
    return cmelement ? cmelement.id : undefined;
  }

  public elementStyle(cmelement) {
    return  {
      'left': cmelement.coor.x + 'px',
      'top': cmelement.coor.y + 'px',
      'z-index': cmelement.zPos,
      'position': 'absolute'
    };
  }

}
