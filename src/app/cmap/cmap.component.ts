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

  constructor(private elementService: ElementService,
              private eventService: EventService,
              private store: Store<CMStore>) {
                this.cmelements = store.select('cmes');
                // this.elementService.getMaxID();
              }

  public ngOnInit() {}

  public trackCME(index, cmelement) {
    return cmelement ? cmelement.id : undefined;
  }

  public elementStyle(cmelement) {
    return  {
      'left': cmelement.coor.x + 'px',
      'top': cmelement.coor.y + 'px',
      'z-index': cmelement.z_pos,
      'position': 'absolute'
    };
  }

}
