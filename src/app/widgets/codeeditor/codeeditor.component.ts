import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
export class CodeeditorComponent implements OnInit, OnDestroy {
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public modes = ['text/x-sh', 'text/x-c++src', 'text/x-csrc', 'application/x-ejs', 'text/html',
  'text/x-go', 'text/javascript', 'text/x-php', 'text/x-python', 'text/x-julia', 'text/x-stex', 'application/typescript'];
  public mode: string = this.modes[7];
  public config = {
    lineNumbers: true,
    mode: this.mode
  };
  public selCMEo: any;
  public isCode = false;
  @ViewChild('codeeditor') public codeedit: any;
  public code = '';
  public copyStatus = '';
  private selectionSubscription: any;

  constructor(private store: Store<CMStore>,
              private codeeditorService: CodeeditorService) {
                this.selectionSubscription = store.select('selectedcmeo').subscribe((data) => {
                  if (typeof data === 'object') {
                    this.selCMEo = data;
                    this.isCode = false;
                    this.code = '';
                    if (this.selCMEo !== null) {
                      if (this.selCMEo['cmobject']) {
                        if (this.selCMEo.cmobject['content']) {
                          if (this.selCMEo.cmobject.content !== undefined) {
                            if (this.selCMEo.cmobject.content.length > 0) {
                              for (let key in this.selCMEo.cmobject.content) {
                                if (this.selCMEo.cmobject.content[key]) {
                                  let content = this.selCMEo.cmobject.content[key];
                                  if (content.cat === 'html') {
                                    this.code = content.info || '';
                                    if (content.language) this.mode = content.language;
                                    if (this.codeedit && this.codeedit.instance) this.changeMode();
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

  public ngOnInit() {}
  public ngOnDestroy() { if (this.selectionSubscription) this.selectionSubscription.unsubscribe(); }
  public async copySource() {
    try { await (navigator as any).clipboard.writeText(this.code); this.copyStatus = 'Source copied'; }
    catch (_) { this.copyStatus = 'Clipboard unavailable. Select and copy the source in the editor.'; }
  }

  // changes language mode
  public changeMode() {
    this.config['mode'] = this.mode;

    this.codeedit.instance.setOption('mode', this.mode);
    // this.codeedit.refresh();
  }

  // read inner html of codeeditor
  public readCode() {
    this.codeeditorService.processCode(this.codeedit.instance.getValue(), this.mode, this.isCode);
  }
}
