import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { CodeeditorService } from './codeeditor.service';
import 'codemirror/mode/go/go';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/python/python';
import 'codemirror/mode/php/php';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlembedded/htmlembedded';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/stex/stex';

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
  public modes = ['text/x-sh', 'text/x-c++src', 'text/x-csrc', 'application/x-ejs', 'text/html',
  'text/x-go', 'text/javascript', 'text/x-php', 'text/x-python', 'text/x-stex', 'application/typescript'];
  public mode: string = this.modes[7];
  public config = { lineNumbers: true, mode: this.mode };
  public selCMEo: any;
  public isCode = false;
  @ViewChild('codeeditor') public codeedit: any;
  public code = '';

  constructor(private store: Store<CMStore>,
              private codeeditorService: CodeeditorService) {
                store.select('selectedcmeo').subscribe((data) => {
                  if (typeof data === 'object') {
                    this.selCMEo = data;
                    this.isCode = false;
                    if (this.selCMEo !== null) {
                      if (this.selCMEo['cmobject']) {
                        if (this.selCMEo.cmobject['content']) {
                          if (this.selCMEo.cmobject.content !== undefined) {
                            if (this.selCMEo.cmobject.content.length > 0) {
                              for (let key in this.selCMEo.cmobject.content) {
                                if (this.selCMEo.cmobject.content[key]) {
                                  let content = this.selCMEo.cmobject.content[key];
                                  if (content.cat === 'html') {
                                    this.code = content.info;
                                    this.isCode = true;
                                    // console.log(this.code, key);
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    // console.log(data);
                  }
                });
              }

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

  // changes language mode
  public changeMode() {
    this.config['mode'] = this.mode;
    console.log(this.codeedit);
    this.codeedit.instance.setOption('mode', this.mode);
    // this.codeedit.refresh();
  }

  // read inner html of codeeditor
  public readCode() {
    // console.log(this.codeedit.instance);
    this.codeeditorService.processCode(this.codeedit.instance.display, this.codeedit.instance.getValue(), this.isCode);
  }

}
