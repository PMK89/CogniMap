import { Component, OnInit,  ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { MjEditorService } from './mjeditor.service';
import { MjEditorLatexService } from './mjeditor.latex.service';

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

@Component({
  selector: 'app-mjeditor',
  templateUrl: './mjeditor.component.html',
  styleUrls: ['./mjeditor.component.scss']
})
export class MjEditorComponent implements OnInit {
  @ViewChild('latexInput') public vc;
  public LateX = this.mjEditorLatexService;
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public inputtext: string = this.mjeditorService.inputtext;
  public svgoutput: Object = this.mjeditorService.svgoutput;
  public svgStrg: string = '';
  public active = false;
  public selCMEo: any;
  public key: number;
  public cpos: number;

  constructor(private store: Store<CMStore>,
              private mjEditorLatexService: MjEditorLatexService,
              private sanitizer: DomSanitizer,
              private mjeditorService: MjEditorService) {

              }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        if (data.widget1 || data.widget1) {
          if (data.widget0 === 'equation' || data.widget1 === 'equation') {
            this.active = true;
          } else {
            this.active = false;
          }
        }
        // console.log('settings ', this.w1width, this.w1height);
      }
    });
    this.store.select('selectedcmeo').subscribe((data) => {
      if (typeof data === 'object' && this.active) {
        this.selCMEo = data;
        if (this.selCMEo !== null) {
          if (this.selCMEo['cmobject']) {
            if (this.selCMEo.cmobject['content']) {
              if (this.selCMEo.cmobject.content !== undefined) {
                if (this.selCMEo.cmobject.content.length > 0) {
                  let counter = 0;
                  for (let key in this.selCMEo.cmobject.content) {
                    if (this.selCMEo.cmobject.content[key]) {
                      let content = this.selCMEo.cmobject.content[key];
                      if (content.cat === 'LateX') {
                        this.key = counter;
                        this.inputtext = content.info;
                        this.mjeditorService.placeSvg(this.inputtext);
                        // console.log(this.code, key);
                      }
                      counter++;
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

  // make LaTeX SVG
  public makeLatex(oField, tex) {
    this.cpos = oField.selectionStart;
    this.mjeditorService.makeLatex(oField, tex);
  }

  // handle click on button
  public buttonInput(cell) {
    this.inputtext = this.mjeditorService.buttonInput(cell, this.vc.nativeElement.value);
    this.vc.nativeElement.focus();
    console.log(this.vc);
  }

  // get SVG for button
  public saveLateX() {
    if (this.selCMEo && typeof this.key === 'number') {
      this.mjeditorService.saveLateX(this.selCMEo, this.key);
    }
  }

  // get SVG for button
  public getSVG(cell) {
    if (cell['svg']) {
      return this.sanitizer.bypassSecurityTrustHtml(cell.svg);
    }
  }

}
