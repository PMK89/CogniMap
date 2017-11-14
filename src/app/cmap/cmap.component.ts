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
  public minicmap = false;
  public selection = {
    'display': 'none',
    'left': '0px',
    'top': '0px',
    'width': '0px',
    'z-index': 200,
    'height': '0px'
  };

  constructor(private elementService: ElementService,
              private eventService: EventService,
              private store: Store<CMStore>) {
                this.cmelements = store.select('cmes');
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
                    }
                  },
                  (error) => console.log(error)
                );
              }

  public ngOnInit() {}

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
