import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

declare var electron: any;
const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.scss']
})
export class WidgetsComponent implements OnInit {
  @ViewChild('iframe1') iframe1: ElementRef;

  constructor() { }

  ngOnInit() {
    ipc.on('snap-out', function (event, arg) {
      console.log(arg);
    });
  }

  cminterface() {
    let iframe = this.iframe1.nativeElement.contentDocument || this.iframe1.nativeElement.contentWindow;
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
