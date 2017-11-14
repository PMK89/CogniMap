import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

declare var Snap: any;

// services
import { ElementService } from '../shared/element.service';
import { EventService } from '../shared/event.service';

// models and reducers
import { CMStore } from '../models/CMStore';

@Component({
  selector: 'app-cmapMedia',
  templateUrl: './cmap_media.component.html',
  styleUrls: ['./cmap.component.scss']
})
export class CmapMediaComponent implements OnInit {

  public type = '';
  public media = {
    display: 'none',
    position: 'absolute',
    left: '0px',
    top: '0px',
  };

  constructor(private elementService: ElementService,
              private eventService: EventService,
              private store: Store<CMStore>) {
                // o
                store.select('selectedcmeo').subscribe((data) => {
                  if (data && typeof data === 'object') {
                    if (data['cmobject']) {
                      if (data['state'] === 'selected') {
                        if (data['cmobject']['content']) {
                          if (data['cmobject']['content'].length > 0) {
                            for (let i in data['cmobject']['content']) {
                              if (data['cmobject']['content'][i]) {
                                if (data['cmobject']['content'][i].cat.indexOf('_')) {
                                  this.setMedia(data, data['cmobject']['content'][i]);
                                }
                              }
                            }
                          }
                        }
                      } else {
                        this.media.display = 'none';
                      }
                    }
                  }
                });
              }

  public ngOnInit() {}

  public hideMedia() {
    this.media.display = 'none';
  }

  public setMedia(cmelement, content) {
    if (['i_50', 'i_100'].indexOf(content.cat) !== -1) {
      this.type = 'svg';
      let s = Snap('#cmmediasvg');
      s.clear();
      let x = cmelement.coor.x - 100;
      let y = cmelement.coor.y - 100;
      this.media = {
        display: 'block',
        position: 'absolute',
        left: x + 'px',
        top: y + 'px'
      };
      let path;
      if (content.object.indexOf('assets/') === -1) {
        path = 'assets/images/' + content.object;
      } else {
        path = content.object;
      }
      let cmmedia = s.image((path), 0, 0);
      cmmedia.transform('s' + (content.height / 100));
    }
  }

}
