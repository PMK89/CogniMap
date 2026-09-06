import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';
import { BackendService } from '../../shared/backend.service';
import { NavigatorService } from '../../widgets/navigator/navigator.service';
import { QuizService } from '../../shared/quiz.service';
// import { SButtonComponent } from '../../shared/s-button/s-button.component';

// models and reducers
import { CMSettings } from '../../models/CMSettings';
import { CMStore } from '../../models/CMStore';
import { CMButton } from '../../models/CMButton';
import { CMColorbar } from '../../models/CMColorbar';

@Component({
  selector: 'app-tb-quizzing',
  templateUrl: './tb-quizzing.component.html',
  styleUrls: ['./tb-quizzing.component.scss']
})
export class TbQuizzingComponent implements OnInit, OnDestroy {
  public cmsettings: CMSettings;
  public buttons: Observable<CMButton[]>;
  public colors: Observable<CMColorbar[]>;
  public overduearray = [];
  public timelist = [];
  public catlist = [];
  public allcat = false;
  public quizcat0 = ['none'];
  public quizcat0mod: string = this.quizcat0[0];
  public quizcat1 = ['none'];
  public quizcat1mod: string = this.quizcat1[0];
  public quizcat2 = ['none'];
  public quizcat2mod: string = this.quizcat2[0];
  public nooverdue = true;
  public maxQ = '42';
  public mode = '';
  private settingsSubscription: Subscription;
  private quizListener: any;
  private revealStyle: HTMLStyleElement;
  public currentIndex = 0;
  public revealed = false;
  public reviewed = 0;
  public canUndo = false;
  public busy = false;
  public error = '';
  public resumed = false;
  private resumeNext = true;
  public grades = ['0 · Blank', '1 · Wrong', '2 · Hard', '3 · Partial', '4 · Good', '5 · Easy'];
  public get current(): any { return this.overduearray[this.currentIndex]; }


  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private electronService: BackendService,
              private navigatorService: NavigatorService,
              private quizService: QuizService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.colors = store.select('colors');
                this.quizListener = (event, arg) => {
                  if (arg) {
                    if (arg.progress) { this.reviewed = arg.progress.reviewed; this.resumed = arg.progress.resumed; }
                    if (arg['quizes']) {
                      this.overduearray = arg['quizes'];
                      if (this.overduearray.length > 0) {
                      }
                    } else {
                      this.overduearray = [];
                    }
                    if (arg['timelist']) {
                      this.timelist = arg['timelist'];
                    }
                    if (arg['catlist']) {
                      if (this.catlist.length === 0) {
                        this.catlist = arg['catlist'];
                        this.fillcatlist();
                      }
                    }
                  }
                  this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.overduearray.length - 1));
                  this.hideAnswer();
                };
                this.electronService.ipcRenderer.on('loadedQuizes', this.quizListener);
                this.settingsSubscription = this.settingsService.cmsettings
                      .subscribe((data) => {
                        this.cmsettings = data;
                        if (this.cmsettings.mode === 'quizing') {
                          this.mode = 'quizing';
                          if (this.nooverdue ||
                            this.overduearray.length === 0) {
                            this.getOverdue();
                          }
                        } else {
                          if (this.mode === 'quizing') {
                            this.unQuiz();
                            this.catlist = [];
                          }
                          this.mode = '';
                        }
                      });
              }

  public ngOnInit() {
  }

  public ngOnDestroy() {
    this.electronService.ipcRenderer.removeListener('loadedQuizes', this.quizListener);
    this.hideAnswer();
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
    this.unQuiz();
  }

  @HostListener('document:keydown', ['$event'])
  public reviewKeys(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (!target || /INPUT|TEXTAREA|SELECT|BUTTON/.test(target.tagName) || target.isContentEditable || document.getElementById('cm-workspace-panel')) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === ' ' && this.current) { event.preventDefault(); this.reveal(); }
    else if (/^[0-5]$/.test(event.key) && this.revealed) { event.preventDefault(); this.grade(Number(event.key)); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); this.next(1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); this.next(-1); }
  }
  public hideAnswer() {
    if (this.revealStyle && this.revealStyle.parentNode) this.revealStyle.parentNode.removeChild(this.revealStyle);
    this.revealStyle = null; this.revealed = false;
  }
  public focusCurrent() {
    if (!this.current) return;
    this.goTo(String(this.current.coor.x), String(this.current.coor.y));
    const x = this.current.coor.x, y = this.current.coor.y;
    this.elementService.getElements({ l: x - 1600, r: x + 2400, t: y - 900, b: y + 1800 });
  }
  public next(offset: number) {
    if (!this.overduearray.length || this.busy) return;
    this.hideAnswer();
    this.currentIndex = (this.currentIndex + offset + this.overduearray.length) % this.overduearray.length;
    this.focusCurrent();
  }
  public reveal() {
    if (!this.current || this.busy || this.revealed) return;
    this.focusCurrent();
    // Only hide the authored cover, never the covered knowledge node. CSS
    // survives asynchronous SVG re-rendering and never changes saved geometry.
    this.revealStyle = document.createElement('style');
    this.revealStyle.textContent = '#cmsvg #g' + this.current.id + ' { visibility: hidden !important; }';
    document.head.appendChild(this.revealStyle);
    this.revealed = true;
  }
  private async reviewRequest(route: string, body: any) {
    const response = await fetch('/api/quiz/' + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error.message);
    if (result.unchanged) throw new Error('Review session changed. Restart the session to recover.');
    this.electronService.ipcRenderer.emit('loadedQuizes', result);
  }
  public async grade(scale: number) {
    if (!this.current || !this.revealed || this.busy) return;
    this.busy = true; this.error = '';
    try {
      await this.reviewRequest('answer', { id: this.current.id, scale });
      this.canUndo = true; this.focusCurrent();
    } catch (err) { this.error = err.message; }
    finally { this.busy = false; }
  }
  public async undoRating() {
    if (!this.canUndo || this.busy) return;
    this.busy = true;
    try { await this.reviewRequest('undo', {}); this.canUndo = false; this.focusCurrent(); }
    catch (err) { this.error = err.message; }
    finally { this.busy = false; }
  }
  public restart() { this.resumeNext = false; this.hideAnswer(); this.nooverdue = true; this.canUndo = false; this.getOverdue(); }

  // finds element by title
  public findTitle(title: string) {
    if (title !== '') {
      this.overduearray = this.elementService.getDBCMEbyTitle(title);
    }
  }

  // fill category lists
  public fillcatlist(cat0?: string, cat1?: string) {
    if (this.catlist.length > 0) {
      this.quizcat0 = [];
      this.quizcat1 = ['none'];
      this.quizcat2 = ['none'];
      this.catlist.forEach((cat) => {
        if (cat) {
          if (cat.length >= 4) {
            if (this.quizcat0.indexOf(cat[0]) === -1) {
              this.quizcat0.push(cat[0]);
            }
          } else if (this.allcat) {
            if (this.quizcat0.indexOf(cat[0]) === -1) {
              this.quizcat0.push(cat[0]);
            }
          }
          if (cat0) {
            if (cat.length >= 4) {
              if (cat[0] === cat0 && this.quizcat1.indexOf(cat[1]) === -1) {
                this.quizcat1.push(cat[1]);
              }
            } else if (this.allcat) {
              if (cat[0] === cat0 && this.quizcat1.indexOf(cat[1]) === -1) {
                this.quizcat1.push(cat[1]);
              }
            }
          }
          if (cat0 && cat1) {
            if (cat.length >= 4) {
              if (cat[0] === cat0 && cat[1] === cat1 && this.quizcat2.indexOf(cat[2]) === -1) {
                this.quizcat2.push(cat[2]);
              }
            } else if (this.allcat) {
              if (cat[0] === cat0 && cat[1] === cat1 && this.quizcat2.indexOf(cat[2]) === -1) {
                this.quizcat2.push(cat[2]);
              }
            }
          }
        }
      });
      if (this.quizcat0mod === 'none') {
        this.quizcat0mod = this.quizcat0[0];
      }
      if (this.quizcat1[0] && this.quizcat1mod === 'none') {
        this.quizcat1mod = this.quizcat1[0];
      }
      if (this.quizcat2[0] && this.quizcat2mod === 'none') {
        this.quizcat2mod = this.quizcat2[0];
      }
    }
  }

  // changes fontstyle
  public chooseCat(arg) {
    let params = [];
    switch (arg) {
      case '1':
        params = [this.allcat, this.quizcat0mod];
        this.fillcatlist(this.quizcat0mod);
        break;
      case '2':
        if (this.quizcat1mod === 'none') {
          params = [this.allcat, this.quizcat0mod];
        } else {
          params = [this.allcat, this.quizcat0mod, this.quizcat1mod];
          this.fillcatlist(this.quizcat0mod, this.quizcat1mod);
        }
        break;
      case '3':
        if (this.quizcat2mod === 'none') {
          params = [this.allcat, this.quizcat0mod, this.quizcat1mod];
        } else {
          params = [this.allcat, this.quizcat0mod, this.quizcat1mod, this.quizcat2mod];
        }
        break;
      default:
        break;
    }
    if (params.length > 1) {
      this.hideAnswer();
      this.electronService.ipcRenderer.send('loadQuizesbyCat', params);
    }
  }

  // changes allcat
  public changeallcat(val?) {
    if (val) {
      this.allcat = true;
      this.fillcatlist();
    } else {
      this.allcat = false;
      this.fillcatlist();
    }
  }

  // finds quiz elements that are overdue
  public getOverdue() {
    if (this.nooverdue) {
      this.nooverdue = false;
      if (this.cmsettings['cmtbquizedit']['interval']) {
        this.electronService.ipcRenderer.send('loadQuizes', { limit: parseInt(this.cmsettings.cmtbquizedit.interval, 10), resume: this.resumeNext });
      } else {
        this.electronService.ipcRenderer.send('loadQuizes', { limit: 42, resume: this.resumeNext });
      }
    }
  }

  // moves view to entered coordinates
  public goTo(x: string, y: string) {
    this.navigatorService.goTo(x, y);
  }

  // removes quizes
  public unQuiz() {
    if (this.overduearray.length > 0) {
      for (let key in this.overduearray) {
        if (this.overduearray[key]) {
          this.quizService.removeQuiz(this.overduearray[key].id);
        }
      }
    }
    this.electronService.ipcRenderer.send('unQuiz', 1);
    this.nooverdue = true;
  }

  // changes mode in settings
  public changeMode(selector: string) {
    if (selector === 'quizing') {
      this.getOverdue();
    }
    this.cmsettings.mode = selector;
    this.settingsService.updateSettings(this.cmsettings);
  }

}
