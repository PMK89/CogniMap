import { Component, OnInit } from '@angular/core';

declare var electron: any;
const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-svgeditor',
  templateUrl: './svgeditor.component.html',
  styleUrls: ['./svgeditor.component.scss']
})
export class SvgeditorComponent implements OnInit {
  svg: string;


  constructor() { }

  ngOnInit() {
    ipc.on('snap-out', function (event, arg) {
      this.svg = arg;
    });
  }

}
