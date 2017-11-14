import { Component, OnInit,  } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { NavigatorService } from './navigator.service';

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent implements OnInit {
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public titlearray = [];
  public cmearray = [[]];
  public position = this.navigatorService.position;

  constructor(private store: Store<CMStore>,
              private navigatorService: NavigatorService) { }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        // console.log('settings ', this.w1width, this.w1height);
      }
    });
    // listens on electron ipc
    /*
    ipc.on('snap-out', function (event, arg) {
      console.log(arg);
    });
    */
    let cm = this.navigatorService.findID(1);
    if (cm) {
      this.cmearray[0] = cm;
      this.getLinkedCME(cm[0], 1);
    }
  }

  // moves view to entered coordinates
  public goTo(x: string, y: string) {
    this.navigatorService.goTo(x, y);
  }

  // moves element to entered coordinates
  public moveTo(x: string, y: string) {
    this.navigatorService.moveTo(x, y);
  }

  // moves element to entered coordinates
  public addCoor(coor: string, n0, n1) {
    this.navigatorService.addCoor(coor, n0, n1);
  }

  // moves view to entered coordinates
  public findTitle(title: string) {
    this.titlearray = this.navigatorService.findTitle(title);
    console.log(this.titlearray);
  }

  // gets the linked cmes
  public getLinkedCME(cme, i) {
    if (this.cmearray.length > (i + 1)) {
      this.cmearray = this.cmearray.slice(0, (i + 1));
    }
    this.cmearray.push(this.navigatorService.findAll(cme));
    // console.log(this.cmearray);
  }


}
