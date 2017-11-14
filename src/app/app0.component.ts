import { Component } from '@angular/core';

import { LayoutService } from './layout.service';
import { WindowService } from './shared/window.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  layout: Object;
  parameters: Object;

  constructor() {}

  setLayout(id) {
    if ( this.layout ) {
      let styles = {
        // CSS property names
        'background-color':  '#ff0000'  // italic
      };
      if ( this.layout[id] ) {
        styles = this.layout[id];
      } else {
        console.log('ID not known');
      };
      return styles;
    }
  }

}
