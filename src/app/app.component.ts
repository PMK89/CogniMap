import { Component, Renderer, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';

// services 5624535178
import { LayoutService } from './layout.service';
import { WindowService } from './shared/window.service';
import { EventService } from './shared/event.service';
import { ElementService } from './shared/element.service';
import { SettingsService } from './shared/settings.service';

// electron specific 12179045330235230182
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// models and reducers
import { CMEStore } from './models/cmestore';
import { CMSettings } from './models/CMSettings';
import { CMAction } from './models/CMAction';

// components
import { CmapComponent } from './cmap/cmap.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  layout: Object;
  parameters: Object;
  cmsettings: CMSettings;
  cmaction: CMAction = new CMAction;
  @ViewChild('TPid') tpid: ElementRef;
  @ViewChild('TPx') tpx: ElementRef;
  @ViewChild('TPy') tpy: ElementRef;

  @ViewChild(CmapComponent)
  private cmapComponent: CmapComponent;

  ngAfterViewInit() {
    this.renderer.listenGlobal('window', 'scroll', (evt) => {
      this.cmapComponent.getData(this.windowService.getParameters(window.pageXOffset, window.pageYOffset));
    });
    this.renderer.listenGlobal('window', 'resize', (evt) => {
      this.windowService.setSize(window.innerWidth, window.innerHeight);
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
              private store: Store<CMEStore>,
              private renderer: Renderer) {
                // Catches Data from Layout-Service
                // Specially for Sophia: uncomment if you load new buttons, colors or settings
                // this.settingsService.setColors(); // uncomment to load colors from JSON-File
                // this.settingsService.setButtons(); // uncomment to load buttons from JSON-File
                // this.settingsService.setSettings(); // uncomment to load settings from JSON-File
                // this.elementService.setTemplates(); // uncomment to load settings from JSON-File
                this.elementService.getTemplates();
                this.elementService.getMaxID();
                this.settingsService.getSettings();
                this.settingsService.getButtons();
                this.settingsService.getColors();
                this.layoutService.getLayout()
                  .subscribe(
                    data => {
                      this.cmsettings = data[0];
                      this.setSizes();
                      let action = {type: 'ADD_CMS_FROM_DB', payload: data[0] };
                      this.store.dispatch(action);
                    },
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
    if ( this.cmsettings ) {
      let styles;
      if ( this.cmsettings[id] ) {
        styles = {
          // CSS property names
          'position': this.cmsettings[id].position,
          'left': this.cmsettings[id].pos.x + 'px',
          'top': this.cmsettings[id].pos.y + 'px',
          'width': this.cmsettings[id].width + 'px',
          'height': this.cmsettings[id].height + 'px',
          'opacity': this.cmsettings[id].trans,
          'background-color': this.cmsettings['style'].bgcolor,
          'display': 'none'
        };
        if (this.cmsettings[id].vis === true) {
          styles.display = 'block';
        }
      } else {
        styles = {
          // CSS property names
          'position': 'relative',
          'left': 0,
          'top': 0,
          'width': 0,
          'height': 0,
          'opacity': 0,
          'background-color': '#ffffff',
          'display': 'none'
        };
        console.log('ID not known');
      };
      return styles;
    }
  }
  // detects changes in third-party controlled elements.
  changedetect() {
    let tpidval = this.tpid.nativeElement.title;
    // let tpxval = this.tpx.nativeElement.title;
    // let tpyval = this.tpy.nativeElement.title;
    let id = parseInt(tpidval, 10);
    if (id > 0) {
      if (this.elementService.currentElement) {
        if (this.elementService.cmsettings.dragging && this.elementService.currentElement.dragging === false) {
          this.elementService.setSelectedElement(id);
          this.cmaction.var = ['dragging'];
          this.cmaction.value = true;
          this.elementService.changeElement(this.cmaction);
        } else if (this.elementService.currentElement.id === id) {
          console.log(this.elementService.cmsettings.dragging, this.elementService.cmsettings.mode);
          if (this.elementService.cmsettings.mode === 'edit' && this.elementService.cmsettings.dragging === false) {
            this.elementService.setActive(id);
            this.elementService.cmsettings.mode = 'typing';
            this.settingsService.updateSettings(this.cmsettings);
          }
        }
      } else {
        this.elementService.setSelectedElement(id);
      }
    }
    // console.log('FUCK YEAH: ', tpidval);
  }

  // creates exact position for layout
  setSizes() {
    if (this.cmsettings) {
      this.cmsettings['tblayout1'].width = this.windowService.Win_Width;
      this.cmsettings['wlayout0'].pos.y = this.cmsettings['tblayout1.height'];
      this.cmsettings['wlayout0'].height = (this.windowService.Win_Height - this.cmsettings['tblayout1'].height) / 2;
      this.cmsettings['wlayout1'].pos.y = this.cmsettings['tblayout1'].height + this.cmsettings['wlayout0'].height;
      this.cmsettings['wlayout1'].height = (this.windowService.Win_Height - this.cmsettings['tblayout1'].height) / 2;
    }
  }
}
