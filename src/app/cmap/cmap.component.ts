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
import { CMElement } from '../models/CMElement';

@Component({
  selector: 'app-cmap',
  templateUrl: './cmap.component.html',
  styleUrls: ['./cmap.component.scss']
})
export class CmapComponent implements OnInit {
  cmelements: Observable<Array<CMElement>>;

  constructor(private elementService: ElementService,
              private eventService: EventService,
              private store: Store<CMStore>) {
                this.cmelements = store.select('elements');
                // this.elementService.getMaxID();
              }

  ngOnInit() { }

  elementStyle(cmelement) {
    return  {
      'left': cmelement.coor.x + 'px',
      'top': cmelement.coor.y + 'px',
      'z-index': cmelement.z_pos,
      'position': 'absolute' };
  }

  getData(parameters) {
    if (parameters) {
      // Catches Data from Element-Service
      this.elementService.getElements(parameters)
        // Dev: handle server response
        /*
        .map(payload => ({ type: 'ADD_CME_FROM_DB', payload }))
        .subscribe(action => {
          this.store.dispatch(action);
          // console.log(action);
        });
        */
        // Prod: handle electron response
        // /*
        .subscribe(x => {
          let action = {
            type: 'ADD_CME_FROM_DB',
            payload: x
          };
          this.store.dispatch(action);
          /*
          for (let i in x) {
            if (x[i]) {
              x[i].cmobject = JSON.parse(x[i].cmobject);
              x[i].cmline = JSON.parse(x[i].cmline);
              let action = {
                type: 'ADD_CME',
                payload: x[i]
              };
              this.store.dispatch(action);
            }
          }
          */
        });
        // */
    }
  }
}
