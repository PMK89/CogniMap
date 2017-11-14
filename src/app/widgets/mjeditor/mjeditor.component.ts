import { Component, OnInit,  ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// models and reducers
import { CMStore } from '../../models/CMStore';
import { CMSettings } from '../../models/CMSettings';
import { MjEditorService } from './mjeditor.service';

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
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public caretPos: number = this.mjeditorService.caretPos;
  public inputtext: string = this.mjeditorService.inputtext;
  public svgoutput: Object = this.mjeditorService.svgoutput;

  constructor(private store: Store<CMStore>,
              private mjeditorService: MjEditorService) { }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        // console.log('settings ', this.w1width, this.w1height);
      }
    });
  }

  // make LaTeX SVG
  public makeLatex(oField, tex) {
    this.mjeditorService.makeLatex(oField, tex);
  }

}
