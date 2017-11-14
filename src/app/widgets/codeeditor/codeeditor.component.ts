import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { CodeeditorService } from './codeeditor.service';
import 'codemirror/mode/go/go';

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-codeeditor',
  templateUrl: './codeeditor.component.html',
  styleUrls: ['./codeeditor.component.scss']
})
export class CodeeditorComponent implements OnInit {
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public config = { lineNumbers: true, mode: 'text/x-go' };
  @ViewChild('codeeditor') public codeedit: any;
  @ViewChild('codeeditor') public codedisplay: ElementRef;
  public code =  `// ... some code !
package main

import "fmt"

// Send the sequence 2, 3, 4, ... to channel 'ch'.
func generate(ch chan<- int) {
	for i := 2; ; i++ {
		ch <- i  // Send 'i' to channel 'ch'
	}
}`;

  constructor(private store: Store<CMStore>,
              private codeeditorService: CodeeditorService) {}

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
  }

  // read inner html of codeeditor
  public readCode() {
    console.log(this.codeedit.instance);
    this.codeeditorService.processCode(this.codeedit.instance.display);
  }

}
