import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// models and reducers
import { CMStore } from '../models/CMStore';
import { CMSettings } from '../models/CMSettings';

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-widgets1',
  templateUrl: './widgets1.component.html',
  styleUrls: ['./widgets1.component.scss']
})
export class Widgets1Component implements OnInit {
  @ViewChild('iframe1') public iframe1: ElementRef;
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public widget1= 'none';
  public w1width = '100px';
  public w1height = '100px';

  constructor(private store: Store<CMStore>) { }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        this.widget1 = data.widget1;
        this.w1width = data.wlayout1.width.toString() + 'px';
        this.w1height = data.wlayout1.height.toString() + 'px';
        // console.log('settings ', this.w1width, this.w1height);
      }
    });
    // listens on electron ipc
    /*
    ipc.on('snap-out', function (event, arg) {
      console.log(arg);
    });
    */
  }

  public cminterface1() {
    let iframe = this.iframe1.nativeElement.contentDocument
    || this.iframe1.nativeElement.contentWindow;
    let output = iframe.getElementById('cmoutput');
    if (output) {
      console.log(output.innerHTML);
    } else {
      console.log('no output');
    }
    let input = iframe.getElementById('cminput');
    if (input) {
      input.innerHTML = 'wabadabadu';
      console.log('input: ', input.innerHTML);
    } else {
      console.log('no input');
    }
  }

}
