import { Component, Renderer, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';

// services 5624535178
import { LayoutService } from './layout.service';
import { WindowService } from './shared/window.service';
import { EventService } from './shared/event.service';
import { MetaService } from './shared/meta.service';
import { QuizService } from './shared/quiz.service';
import { ElementService } from './shared/element.service';
import { SettingsService } from './shared/settings.service';
import { TemplateService } from './shared/template.service';

// electron specific 12179045330235230182
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// models and reducers
import { CMStore } from './models/CMStore';
import { CMSettings } from './models/CMSettings';
import { CMLayout } from './models/CMLayout';
import { CMAction } from './models/CMAction';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit {
  public layout: any;
  public parameters: any;
  public cmsettings: CMSettings;
  public cmaction: CMAction = new CMAction();
  public toolbar0Style: any = this.layoutService.toolbar0Style;
  public toolbar1Style: any = this.layoutService.toolbar1Style;
  public cmapStyle: any = this.layoutService.cmapStyle;
  public menueStyle: any = this.layoutService.menueStyle;
  public widgets0Style: any = this.layoutService.widgets0Style;
  public widgets1Style: any = this.layoutService.widgets1Style;
  public strDown: boolean;
  @ViewChild('TPid') public tpid: ElementRef;
  @ViewChild('TPmaxid') public tpmaxid: ElementRef;
  @ViewChild('TPmeta') public tpmeta: ElementRef;
  @ViewChild('TPquiz') public tpquiz: ElementRef;
  @ViewChild('TPy') public tpy: ElementRef;
  private sizesset = false;

  constructor(private layoutService: LayoutService,
              private windowService: WindowService,
              private settingsService: SettingsService,
              private elementService: ElementService,
              private templateService: TemplateService,
              private eventService: EventService,
              private metaService: MetaService,
              private quizService: QuizService,
              private store: Store<CMStore>,
              private renderer: Renderer) {
                this.windowService.setSize(window.innerWidth, window.innerHeight);
                this.windowService.setOffset(window.pageXOffset, window.pageYOffset);
                this.settingsService.getSettings();
                console.log(this.windowService.getSize());
                this.windowService.getParameters(window.pageXOffset, window.pageYOffset);
                this.settingsService.getButtons();
                this.settingsService.getColors();
                this.settingsService.cmsettings
                  .subscribe(
                    (data) => {
                      if (data) {
                        this.cmsettings = data;
                        // console.log(data);
                        this.setSizes(data);
                      }
                    },
                    (error) => console.log(error)
                  );
                // Sends Window Parameters
              }

  // after viewinit
  public ngAfterViewInit() {
    this.windowService.setOffset(window.pageXOffset, window.pageYOffset);
    window.scrollTo(this.cmsettings.coor.x, this.cmsettings.coor.y);
    this.renderer.listenGlobal('window', 'scroll', (evt) => {
      this.elementService.getElements(this.windowService.getParameters(
        window.pageXOffset, window.pageYOffset));
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
    this.renderer.listenGlobal('window', 'keydown', (evt) => {
      this.strDown = this.eventService.onKeyDown(evt);
      // console.log(evt.key);
    });
    this.renderer.listenGlobal('window', 'keyup', (evt) => {
      this.eventService.onKeyUp(evt);
      if (evt['key']) {
        if (evt['key'] === 'Control') {
          this.strDown = false;
        }
      }
      // console.log(evt.key);
    });
  }

  public setLayout(style: CMLayout, name: string) {
    // console.log(style);
    this.layoutService[name].position = style.position;
    this.layoutService[name].left = style.left.toString() + 'px';
    this.layoutService[name].top = style.top.toString() + 'px';
    this.layoutService[name].width = style.width.toString() + 'px';
    this.layoutService[name].height = style.height.toString() + 'px';
    this.layoutService[name].opacity = style.opacity;
    this.layoutService[name].display = style.display;
  }

  // detects changes in third-party controlled elements.
  public changedetect() {
    // reads values from dom element / communication between incompatible libraries
    let tpidval = this.tpid.nativeElement.title;
    if (this.cmsettings.mode !== 'view' && this.cmsettings.mode !== 'quizing') {
      let id = parseInt(tpidval, 10);
      if (id >= 1) {
        if (this.elementService.selCMEo) {
          if (this.elementService.selCMEo.id === id) {
            console.log(this.cmsettings.mode);
            if ((this.cmsettings.mode === 'edit' || this.cmsettings.mode === 'quizedit') && this.strDown) {
              if (this.elementService.selCMEo.types[0] !== 'i') {
                this.cmaction.variable = ['state'];
                this.cmaction.value = 'typing';
                this.elementService.changeCMEo(this.cmaction);
                this.cmsettings.mode = 'typing';
                this.settingsService.updateSettings(this.cmsettings);
              }
            } else if (this.elementService.selCMEo.cmobject.style.object.class_array.indexOf('beam') !== -1) {
              if (this.elementService.selCMEo.cmobject.style.object.num_array.length > 1) {
                this.windowService.scrollXY(this.elementService.selCMEo.cmobject.style.object.num_array[0],
                 this.elementService.selCMEo.cmobject.style.object.num_array[1]);
              }
            }
          } else if (this.cmsettings.mode === 'marking') {
            if (this.elementService.markCMEo.id !== id) {
              this.elementService.markCMEo = this.elementService.CMEtoCMEol(this.elementService.getDBCMEbyId(id));
            }
          } else if (this.cmsettings.mode === 'beam') {
            // do nothing
          } else if (this.cmsettings.mode === 'quizadd') {
            this.elementService.addQuizContent(id);
          } else if (this.cmsettings.mode === 'latexquiz') {
            this.elementService.addLatexQuiz(id);
          } else {
            if (this.cmsettings.mode === 'connecting') {
              this.elementService.newConnector(id);
            } else {
              this.elementService.setSelectedCME(id);
            }
          }
        } else {
          this.elementService.setSelectedCME(id);
        }
      } else if (id < -1) {
        this.eventService.selCMElTime = Date.now();
        this.elementService.setSelectedCME(id);
      }
      this.tpid.nativeElement.title = '0';
    }
    let tpmetaval = this.tpmeta.nativeElement.title;
    if (tpmetaval) {
      tpmetaval = JSON.parse(tpmetaval);
      if (tpmetaval['type'] && tpmetaval['path'] && tpmetaval['name']) {
        console.log(tpmetaval);
        this.cmsettings.currentMeta = tpmetaval;
        this.settingsService.updateSettings(this.cmsettings);
        if (tpmetaval['type'] === 'pdf' && tpmetaval['pos']) {
          this.metaService.openPdfPage(tpmetaval['path'], parseInt(tpmetaval['pos'], 10));
        } else if (tpmetaval['type'] === 'link' && tpmetaval['pos']) {
          this.metaService.openLinkPosition(tpmetaval['path'], tpmetaval['pos']);
        } else if ((tpmetaval['type'] === 'audio' || tpmetaval['type'] === 'videos') && tpmetaval['pos']) {
          this.metaService.openVideoTime(tpmetaval['path'], parseInt(tpmetaval['pos'], 10));
        } else {
          this.metaService.openFile(tpmetaval['path'], tpmetaval['type']);
        }
        this.tpmeta.nativeElement.title = '0';
      }
    }
    if (this.cmsettings.mode === 'quizing') {
      let tpquizval = this.tpquiz.nativeElement.title;
      console.log(tpquizval);
      if (tpquizval) {
        if (tpquizval.indexOf('_') !== -1) {
          this.quizService.checkAnswer(tpquizval);
          this.tpquiz.nativeElement.title = '0';
        }
      }
    } else {
      let tpquizval = this.tpquiz.nativeElement.title;
      if (tpquizval) {
        let id0;
        if (typeof parseInt(tpquizval.slice(0, tpquizval.indexOf('_')), 10) === 'number' &&
        !isNaN(parseInt(tpquizval.slice(0, tpquizval.indexOf('_')), 10))) {
          id0 = parseInt(tpquizval.slice(0, tpquizval.indexOf('_')), 10);
        } else {
          id0 = parseInt(tpquizval.slice(4, tpquizval.indexOf('_')), 10);
        }
        if (id0) {
          if ((id0.toString() !== this.tpid.nativeElement.title)) {
            this.tpid.nativeElement.title = id0;
            this.tpquiz.nativeElement.title = '0';
            this.changedetect();
          }
        }
      }
    }
  }

  // creates exact position for layout
  public setSizes(cmsettings: CMSettings ) {
    if (this.cmsettings) {
      if (this.cmsettings.mode === 'view' || this.cmsettings.mode === 'quizing') {
        if (this.toolbar0Style.display === 'none') {
          this.cmsettings['tblayout0'].display = 'block';
          this.cmsettings['tblayout1'].display = 'none';
          this.cmsettings['wlayout0'].display = 'none';
          this.cmsettings['wlayout1'].display = 'none';
          if (this.cmsettings.mode === 'quizing') {
            this.cmsettings['tblayout0'].height = 80;
            this.cmsettings['tblayout0'].width = 1800;
          }
          this.setLayout(this.cmsettings['tblayout0'], 'toolbar0Style');
          this.setLayout(this.cmsettings['tblayout1'], 'toolbar1Style');
          this.setLayout(this.cmsettings['wlayout0'], 'widgets0Style');
          this.setLayout(this.cmsettings['wlayout1'], 'widgets1Style');
          this.settingsService.updateSettings(this.cmsettings);
        }
      } else {
        if (this.toolbar0Style.display === 'block') {
          this.cmsettings['tblayout0'].display = 'none';
          this.cmsettings['tblayout1'].display = 'block';
          if (this.cmsettings.widget0 !== 'none') {
            this.cmsettings['wlayout0'].display = 'block';
            this.setLayout(this.cmsettings['wlayout0'], 'widgets0Style');
          }
          if (this.cmsettings.widget1 !== 'none') {
            this.cmsettings['wlayout1'].display = 'block';
            this.setLayout(this.cmsettings['wlayout1'], 'widgets1Style');
          }
          this.setLayout(this.cmsettings['tblayout0'], 'toolbar0Style');
          this.setLayout(this.cmsettings['tblayout1'], 'toolbar1Style');
          this.settingsService.updateSettings(this.cmsettings);
        }
      }
      if (this.cmsettings.wlayout0.display !== this.layoutService.widgets0Style.display) {
        this.setLayout(this.cmsettings['wlayout0'], 'widgets0Style');
        this.settingsService.updateSettings(this.cmsettings);
      }
      if (this.cmsettings.wlayout1.display !== this.layoutService.widgets1Style.display) {
        this.setLayout(this.cmsettings['wlayout1'], 'widgets1Style');
        this.settingsService.updateSettings(this.cmsettings);
      }
      // console.log('setSizes');
      if (this.sizesset === false) {
        this.cmsettings['tblayout1'].width = this.windowService.WinWidth;
        this.cmsettings['wlayout0'].top = this.cmsettings['tblayout1'].height + 1;
        this.cmsettings['wlayout0'].height = (this.windowService.WinHeight -
          (this.cmsettings['tblayout1'].height + 2)) / 2;
        this.cmsettings['wlayout1'].top = this.cmsettings['tblayout1'].height +
          this.cmsettings['wlayout0'].height + 2;
        this.cmsettings['wlayout1'].height = (this.windowService.WinHeight -
          (this.cmsettings['tblayout1'].height + 2)) / 2;
        this.sizesset = true;
        this.setLayout(this.cmsettings['tblayout1'], 'toolbar1Style');
        this.setLayout(this.cmsettings['wlayout0'], 'widgets0Style');
        this.setLayout(this.cmsettings['wlayout1'], 'widgets1Style');
        this.settingsService.updateSettings(this.cmsettings);
      }
    }
  }
}
