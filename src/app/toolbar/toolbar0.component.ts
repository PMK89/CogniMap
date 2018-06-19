import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';

// services
import { SettingsService } from '../shared/settings.service';
import { ElementService } from '../shared/element.service';
import { QuizService } from '../shared/quiz.service';
import { WindowService } from '../shared/window.service';
import { NavigatorService } from '../widgets/navigator/navigator.service';

// models and reducers
import { CMStore } from '../models/CMStore';
import { CMSettings } from '../models/CMSettings';
import { CMButton } from '../models/CMButton';

@Component({
  selector: 'app-toolbar0',
  templateUrl: './toolbar0.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class Toolbar0Component implements OnInit {
  public cmsettings: CMSettings;
  public buttons: Observable<CMButton[]>;
  public overduearray = [];
  public nooverdue = true;
  public mode = '';

  constructor(private settingsService: SettingsService,
              private windowService: WindowService,
              private elementService: ElementService,
              private electronService: ElectronService,
              private navigatorService: NavigatorService,
              private quizService: QuizService,
              private store: Store<CMStore>) {
                this.buttons = store.select('buttons');
                this.electronService.ipcRenderer.on('loadedQuizes', (event, arg) => {
                  if (arg) {
                    console.info(arg);
                    this.overduearray = arg;
                  }
                });
                this.settingsService.cmsettings
                      .subscribe((data) => {
                        this.cmsettings = data;
                        if (this.cmsettings.mode === 'quizing') {
                          this.mode = 'quizing';
                          if (this.nooverdue) {
                            this.getOverdue();
                            this.nooverdue = false;
                          }
                        } else {
                          if (this.mode === 'quizing') {
                            if (this.overduearray.length > 0) {
                              for (let key in this.overduearray) {
                                this.quizService.removeQuiz(this.overduearray[key].id);
                              }
                            }
                            this.electronService.ipcRenderer.send('unQuiz', 1);
                            this.nooverdue = true;
                          }
                          this.mode = '';
                        }
                        // console.log(data);
                      });
              }

  public ngOnInit() {
  }

  // finds element by title
  public findTitle(title: string) {
    if (title !== '') {
      this.overduearray = this.elementService.getDBCMEbyTitle(title);
    }
  }

  // finds quiz elements that are overdue
  public getOverdue() {
    if (this.cmsettings['cmtbquizedit']['interval']) {
      this.electronService.ipcRenderer.send('loadQuizes', parseInt(this.cmsettings.cmtbquizedit.interval, 10));
    } else {
      this.electronService.ipcRenderer.send('loadQuizes', 42);
    }

  }

  // moves view to entered coordinates
  public goTo(x: string, y: string) {
    this.navigatorService.goTo(x, y);
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
