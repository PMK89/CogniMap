import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
// models and reducers
import { CMStore } from '../models/CMStore';
import { CMSettings } from '../models/CMSettings';
// widget plugin architecture
import { getWidget, WidgetDefinition } from './widget-registry';
import { WidgetIframeAdapter } from './widget-iframe.adapter';

@Component({
  selector: 'app-widgets0',
  templateUrl: './widgets0.component.html',
  styleUrls: ['./widgets0.component.scss']
})
export class Widgets0Component implements OnInit {
  @ViewChild('iframe0') public iframe0: ElementRef;
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public widget0 = 'none';
  public widgetDef: WidgetDefinition = getWidget('none');
  public w0width = '100px';
  public w0height = '100px';

  constructor(private store: Store<CMStore>) { }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        this.widget0 = data.widget0;
        this.widgetDef = getWidget(data.widget0);
        this.w0width = data.wlayout0.width.toString() + 'px';
        this.w0height = data.wlayout0.height.toString() + 'px';
      }
    });
  }

  /** typed bridge to the iframe plugin (JSME / SVG editor) */
  public adapter(): WidgetIframeAdapter {
    return new WidgetIframeAdapter(this.iframe0);
  }

  public cminterface0() {
    const output = this.adapter().readOutput();
    if (output) {
      console.log('[widget0] plugin output:', output.type);
    }
  }

  // loads Smiles structure to JSME
  public loadStructure(structure) {
    if (!this.adapter().loadStructure(structure)) {
      console.log('no structure');
    }
  }
}
