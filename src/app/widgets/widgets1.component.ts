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
  selector: 'app-widgets1',
  templateUrl: './widgets1.component.html',
  styleUrls: ['./widgets1.component.scss']
})
export class Widgets1Component implements OnInit {
  @ViewChild('iframe1') public iframe1: ElementRef;
  public cmsettings: Observable<CMSettings> = this.store.select('settings');
  public widget1 = 'none';
  public widgetDef: WidgetDefinition = getWidget('none');
  public w1width = '100px';
  public w1height = '100px';

  constructor(private store: Store<CMStore>) { }

  public ngOnInit() {
    this.cmsettings.subscribe((data) => {
      if (data) {
        this.widget1 = data.widget1;
        this.widgetDef = getWidget(data.widget1);
        this.w1width = data.wlayout1.width.toString() + 'px';
        this.w1height = data.wlayout1.height.toString() + 'px';
      }
    });
  }

  /** typed bridge to the iframe plugin (JSME / SVG editor) */
  public adapter(): WidgetIframeAdapter {
    return new WidgetIframeAdapter(this.iframe1);
  }

  public cminterface1() {
    const output = this.adapter().readOutput();
    if (output) {
      console.log('[widget1] plugin output:', output.type);
    }
  }

  // loads Smiles structure to JSME
  public loadStructure(structure) {
    if (!this.adapter().loadStructure(structure)) {
      console.log('no structure');
    }
  }
}
