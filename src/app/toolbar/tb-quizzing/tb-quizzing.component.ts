import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';
import { ElectronService } from 'ngx-electron';
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

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private electronService: ElectronService,
              private navigatorService: NavigatorService,
              private quizService: QuizService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.colors = store.select('colors');
                this.electronService.ipcRenderer.on('loadedQuizes', (event, arg) => {
                  if (arg) {
                    console.info(arg);
                    if (arg['quizes']) {
                      this.overduearray = arg['quizes'];
                    } else {
                      this.overduearray = [];
                    }
                    if (arg['timelist']) {
                      this.timelist = arg['timelist'];
                    }
                    if (arg['catlist'] && this.catlist.length === 0) {
                      this.catlist = arg['catlist'];
                      // console.info(this.catlist);
                      this.fillcatlist();
                    }
                  }
                });
                this.settingsService.cmsettings
                      .subscribe((data) => {
                        this.cmsettings = data;
                        if (this.cmsettings.mode === 'quizing') {
                          this.mode = 'quizing';
                          console.log(this.nooverdue);
                          if (this.nooverdue) {
                            this.getOverdue();
                          }
                        } else {
                          if (this.mode === 'quizing') {
                            this.unQuiz();
                            this.catlist = [];
                          }
                          this.mode = '';
                        }
                        // console.log(data);
                      }).unsubscribe();
              }

  public ngOnInit() {
  }

  public ngOnDestroy() {
    this.electronService.ipcRenderer.removeAllListeners('loadedQuizes');
    this.unQuiz();
    console.log('quiz toolbar destroyed');
  }

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
        params = [this.allcat, this.quizcat0mod, this.quizcat1mod];
        this.fillcatlist(this.quizcat0mod, this.quizcat1mod);
        break;
      case '3':
        params = [this.allcat, this.quizcat0mod, this.quizcat1mod, this.quizcat2mod];
        break;
      default:
        break;
    }
    if (params.length > 1) {
      this.unQuiz();
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
      console.info('getOverdue', this.nooverdue);
      this.nooverdue = false;
      if (this.cmsettings['cmtbquizedit']['interval']) {
        this.electronService.ipcRenderer.send('loadQuizes', parseInt(this.cmsettings.cmtbquizedit.interval, 10));
      } else {
        this.electronService.ipcRenderer.send('loadQuizes', 42);
      }
    }
  }

  // moves view to entered coordinates
  public goTo(x: string, y: string) {
    this.navigatorService.goTo(x, y);
  }

  // removes quizes
  public unQuiz() {
    console.log('unQuiz');
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
    console.log(this.cmsettings);
    this.settingsService.updateSettings(this.cmsettings);
  }

}
