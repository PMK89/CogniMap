import { Component, OnInit,  ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { CMColorbar } from '../../models/CMColorbar';
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
  public colors: Observable<CMColorbar[]>;
  public LateX = this.mjEditorLatexService;
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public inputtext: string = this.mjeditorService.inputtext;
  public svgoutput: Object = this.mjeditorService.svgoutput;
  public svgStrg: string = '';
  public color = '#000000';
  public active = false;
  public selCMEo: any;
  public key = -1;
  public cpos: number;
  public matrixX = 2;
  public matrixY = 2;

  constructor(private store: Store<CMStore>,
              private mjEditorLatexService: MjEditorLatexService,
              private sanitizer: DomSanitizer,
              private mjeditorService: MjEditorService) {
                this.colors = store.select('colors');
              }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        if (data.widget1 || data.widget1) {
          if (data.widget0 === 'equation' || data.widget1 === 'equation') {
            if (data.latexcolor && !this.active) {
              this.color = data.latexcolor;
            }
            this.active = true;
          } else {
            this.active = false;
          }
        }
        if (data.latexcolor) {
          if (this.active) {
            if (this.color !== data.latexcolor) {
              this.colorInput(data.latexcolor);
            }
          }
          this.color = data.latexcolor;
        }
        // console.log('settings ', this.w1width, this.w1height);
      }
    });
    this.store.select('selectedcmeo').subscribe((data) => {
      if (typeof data === 'object' && this.active) {
        this.selCMEo = data;
        this.key = -1;
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
    console.log(this.vc);
  }

  // handle click on matrix button
  public matrixInput(matrix) {
    this.inputtext = this.mjeditorService.makeMatrix(matrix, this.matrixX, this.matrixY);
  }

  // handles change of color
  public colorInput(color) {
    this.inputtext = this.mjeditorService.makeColor(color);
  }

  // focus text area after click
  public focusText() {
    let el = this.vc.nativeElement.setSelectionRange(this.cpos);
    console.log(el);
    this.vc.nativeElement.focus();
  }

  // goes back one editing step
  public back() {
    this.inputtext = this.mjeditorService.goBack();
  }

  // goes forward one edditing step
  public forward() {
    this.inputtext = this.mjeditorService.goForward();
  }

  // makes buttons (svg, text, etc)
  public makeButtons() {
    this.mjeditorService.makeButtonSvg();
  }

  // get SVG for button
  public saveLateX() {
    if (this.selCMEo) {
      if (typeof this.key !== 'number') {
        this.key = -1;
      }
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
