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
  public cmapwidth = 500000;
  public cmapheight = 500000;
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
                        // widget-slot open state as cheap html classes for
                        // the layout CSS (never use :has()/[style*] here —
                        // catastrophic for perf on this page's huge DOM).
                        // NOTE: no safe-top measurement here — forcing layout
                        // on every settings update janks the whole app; the
                        // ResizeObserver on the toolbars covers all cases.
                        document.documentElement.classList.toggle(
                          'cm-w0-open', !!(data.wlayout0 && data.wlayout0.display === 'block'));
                        document.documentElement.classList.toggle(
                          'cm-w1-open', !!(data.wlayout1 && data.wlayout1.display === 'block'));
                        this.windowService.setSize(window.innerWidth, window.innerHeight);
                      }
                    },
                    (error) => console.log(error)
                  );
                // Sends Window Parameters
              }

  public tbCollapsed = false;

  // collapses/expands the edit toolbar (persisted in localStorage)
  public toggleToolbar() {
    this.tbCollapsed = !this.tbCollapsed;
    document.documentElement.classList.toggle('cm-tb-collapsed', this.tbCollapsed);
    try {
      localStorage.setItem('cognimap-tb-collapsed', this.tbCollapsed ? '1' : '0');
    } catch (err) { /* storage unavailable */ }
    this.updateSafeTop();
  }

  private safeTopObserved = false;
  private safeTopPending = false;
  private safeTopLast = 0;

  // measures the bottom edge of the visible toolbars and publishes it as
  // a CSS variable so widget panels can dock below without overlapping
  public updateSafeTop() {
    if (!this.safeTopPending) {
      this.safeTopPending = true;
      setTimeout(() => {
        this.safeTopPending = false;
        this.measureSafeTop();
      }, 100);
    }
    // the toolbars grow/shrink as panels populate — track their size.
    // The observer already delivers the new sizes, so no extra layout is
    // forced; the actual measurement is throttled through updateSafeTop.
    if (!this.safeTopObserved && (window as any).ResizeObserver) {
      const ro = new (window as any).ResizeObserver(() => {
        if (!this.safeTopPending) {
          this.safeTopPending = true;
          setTimeout(() => {
            this.safeTopPending = false;
            this.measureSafeTop();
          }, 100);
        }
      });
      for (const id of ['toolbar0', 'toolbar1']) {
        const el = document.getElementById(id);
        if (el) {
          ro.observe(el);
          this.safeTopObserved = true;
        }
      }
    }
  }

  private measureSafeTop() {
    let safe = 12;
    for (const id of ['toolbar0', 'toolbar1']) {
      const el = document.getElementById(id);
      if (el && getComputedStyle(el).display !== 'none') {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0) {
          safe = Math.max(safe, rect.bottom + 10);
        }
      }
    }
    // avoid style invalidation when nothing changed
    if (Math.abs(safe - this.safeTopLast) > 1) {
      this.safeTopLast = safe;
      document.documentElement.style.setProperty('--cm-safe-top', safe + 'px');
    }
  }

  // undoes the last element change or deletion
  public undo() {
    this.elementService.undoCME();
  }

  // toggles between light and dark theme (persisted in localStorage)
  public toggleTheme() {
    const root = document.documentElement;
    const prefersDark = window.matchMedia
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('cognimap-theme', next);
    } catch (err) { /* storage unavailable */ }
  }

  // after viewinit
  public ngAfterViewInit() {
    // restore persisted toolbar collapse state
    try {
      if (localStorage.getItem('cognimap-tb-collapsed') === '1') {
        this.tbCollapsed = true;
        document.documentElement.classList.add('cm-tb-collapsed');
      }
    } catch (err) { /* storage unavailable */ }
    this.windowService.setOffset(window.pageXOffset, window.pageYOffset);
    const priorX = window.pageXOffset;
    const priorY = window.pageYOffset;
    window.scrollTo(this.cmsettings.coor.x, this.cmsettings.coor.y);
    // When the browser restores the scroll position on reload, no scroll
    // event fires and getParameters' movement-threshold logic loads
    // nothing — the map would stay empty until the user scrolls a full
    // window. Load the initial viewport explicitly in that case, but NOT
    // when the scroll jump itself already triggers a load (a duplicate
    // load re-renders every element twice and freezes large maps).
    const size = this.windowService.getSize() || { width: 1600, height: 900 };
    const moved = Math.abs(window.pageXOffset - priorX) > 1
      || Math.abs(window.pageYOffset - priorY) > 1;
    const scrollWillLoad = moved
      && (Math.abs(window.pageXOffset) > size.width
          || Math.abs(window.pageYOffset) > size.height);
    if (!scrollWillLoad) {
      this.elementService.getElements({
        l: window.pageXOffset - 2 * size.width,
        r: window.pageXOffset + 3 * size.width,
        t: window.pageYOffset - 2 * size.height,
        b: window.pageYOffset + 3 * size.height
      });
    }
    this.renderer.listenGlobal('window', 'scroll', (evt) => {
      this.elementService.getElements(this.windowService.getParameters(
        window.pageXOffset, window.pageYOffset));
    });
    this.renderer.listenGlobal('window', 'resize', (evt) => {
      this.windowService.setSize(window.innerWidth, window.innerHeight);
      this.updateSafeTop();
    });
    this.updateSafeTop();
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
