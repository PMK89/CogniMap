import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

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
                this.elementService.getMaxID();
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
        .map(payload => ({ type: 'ADD_CME_FROM_DB', payload }))
        .subscribe(action => {
          this.store.dispatch(action);
          // console.log(action);
        });
    }
  }
}
