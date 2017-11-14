import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// services
import { ElementService } from '../shared/element.service';

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
              private store: Store<CMStore>) {
                this.cmelements = store.select('elements');
              }

  ngOnInit() {
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
