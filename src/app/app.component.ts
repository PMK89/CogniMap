import { Component, Renderer, ViewChild, ElementRef } from '@angular/core';

// services 5624535178
import { LayoutService } from './layout.service';
import { WindowService } from './shared/window.service';
import { EventService } from './shared/event.service';
import { ElementService } from './shared/element.service';
import { SettingsService } from './shared/settings.service';

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// models and reducers
// import { CMEStore } from './models/cmestore';
// import { CMSettings } from './models/CMSettings';

// components
import { CmapComponent } from './cmap/cmap.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  layout: Object;
  parameters: Object;
  @ViewChild('TPid') tpid: ElementRef;

  @ViewChild(CmapComponent)
  private cmapComponent: CmapComponent;

  ngAfterViewInit() {
    this.renderer.listenGlobal('window', 'scroll', (evt) => {
      this.cmapComponent.getData(this.windowService.getParameters());
    });
    this.renderer.listenGlobal('window', 'mousedown', (evt) => {
      this.eventService.onMouseDown(evt);
    });
    this.renderer.listenGlobal('window', 'mouseup', (evt) => {
      this.eventService.onMouseUp(evt);
      this.changedetect();
    });
    this.renderer.listenGlobal('window', 'click', (evt) => {
      this.eventService.onMouseClick(evt);
    });
    //  ipc.on('snap-out', function (event, arg) {
    //   console.log(arg);
    // });
  }


  constructor(private layoutService: LayoutService,
              private windowService: WindowService,
              private settingsService: SettingsService,
              private elementService: ElementService,
              private eventService: EventService,
              private renderer: Renderer) {
                // Catches Data from Layout-Service
                // Specially for Sophia: uncomment if you load new buttons, colors or settings
                // this.settingsService.setColors(); // uncomment to load colors from JSON-File
                // this.settingsService.setButtons(); // uncomment to load buttons from JSON-File
                // this.settingsService.setSettings(); // uncomment to load settings from JSON-File
                this.elementService.getTemplates();
                this.settingsService.getSettings();
                this.settingsService.getButtons();
                this.settingsService.getColors();
                this.layoutService.getLayout()
                  .subscribe(
                    data => this.layout = data[0],
                    error => console.log(error)
                   );
                // Sends Window Parameters
                this.windowService.setSize(window.innerWidth, window.innerHeight);
                this.renderer.listenGlobal('window', 'scroll', (evt) => {
                  this.windowService.setOffset(window.pageXOffset, window.pageYOffset); });
                console.log(this.windowService.getSize());
                this.windowService.scrollXY(5000, 100000);
              }

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
  // detects changes in third-party controlled elements.
  changedetect() {
    let tpidval = this.tpid.nativeElement.title;
    console.log('FUCK YEAH: ', tpidval);
  }

  // passes clicked element to object service
  onClick() {

  }


}
