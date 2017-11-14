import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// models and reducers
import { CMStore } from '../models/CMStore';
import { CMSettings } from '../models/CMSettings';

//  electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-widgets0',
  templateUrl: './widgets0.component.html',
  styleUrls: ['./widgets0.component.scss']
})
export class Widgets0Component implements OnInit {
  @ViewChild('iframe0') public iframe0: ElementRef;
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public widget0 = 'none';
  public w0width = '100px';
  public w0height = '100px';

  constructor(private store: Store<CMStore>) { }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        this.widget0 = data.widget0;
        this.w0width = data.wlayout0.width.toString() + 'px';
        this.w0height = data.wlayout0.height.toString() + 'px';
        // console.log('settings ', data);
      }
    });
    // listens on electron ipc
    /*
    ipc.on('snap-out', function (event, arg) {
      console.log(arg);
    });
    */
  }

  public cminterface0() {
    console.log('cminterface');
    let iframe = this.iframe0.nativeElement.contentDocument
    || this.iframe0.nativeElement.contentWindow;
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
