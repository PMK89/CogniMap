import { Component, OnInit, Input } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';
// models and reducers
import { CMSettings } from '../../models/CMSettings';
import { CMSpeChars } from '../../models/CMSpeChars';

@Component({
  selector: 'app-tb-spechars',
  templateUrl: './tb-spechars.component.html',
  styleUrls: ['./tb-spechars.component.scss']
})
export class TbSpecharsComponent implements OnInit {
  @Input() public cmsettings: CMSettings;
  public spechars: CMSpeChars;
  public fontarray: string[] = [
    'greek',
    'arrows',
    'numbers',
    'math'
  ];
  public activeSpechars: string = this.fontarray[0];

  constructor(private electronService: ElectronService,
              private elementService: ElementService,
              private settingsService: SettingsService) {
    this.settingsService.cmsettings
        .subscribe((data) => {
          this.cmsettings = data;
          // console.log(data);
        });
    let data = this.electronService.ipcRenderer.sendSync('loadSpeChars', '1');
    if (data) {
      this.spechars = data;
      console.log(this.spechars);
    }
  }

  public ngOnInit() { }

  // gets the speccharts in 3 rows
  public getSpechars(name0, num) {
    let name = '';
    if (name0 === 'activeSpechars') {
      name = this.activeSpechars;
    } else {
      name = name0;
    }
    if (this.spechars[name]) {
      switch (num) {
        case 0:
          return this.spechars[name].chars0;
        case 1:
          return this.spechars[name].chars1;
        default:
          return this.spechars[name].chars2;
      }
    }
  }

  // changes mode in settings
  public changeMode(selector: string) {
    this.cmsettings.mode = selector;
    console.log(this.cmsettings);
    this.settingsService.updateSettings(this.cmsettings);
  }

  // change text input field
  public changeTextInput(char) {
    // let boxval = this.elementService.inputtext;
    // console.log(boxval);
    this.elementService.inputtext += char;
    if (this.elementService.selCMEo) {
      this.elementService.selCMEo.title = this.elementService.inputtext;
      this.elementService.updateSelCMEo(this.elementService.selCMEo);
    }
    if (this.spechars['lastused']) {
      if (this.spechars['lastused'].chars0.indexOf(char) === -1) {
        if (this.spechars['common'].chars0.indexOf(char) === -1 &&
         this.spechars['common'].chars1.indexOf(char) === -1 &&
         this.spechars['common'].chars2.indexOf(char) === -1) {
           if (this.spechars['lastused'].chars0.length <= 20) {
             this.spechars['lastused'].chars0.unshift(char);
           } else {
             this.spechars['lastused'].chars0.pop();
             this.spechars['lastused'].chars0.unshift(char);
           }
           let lulen = Math.ceil(this.spechars['lastused'].chars0.length / 2);
           this.spechars['lastused'].chars1 = this.spechars['lastused'].chars0.slice(0, lulen);
           this.spechars['lastused'].chars2 = this.spechars['lastused'].chars0.slice(lulen);
        }
      }
    }
  }

  // mark selection
  public selectionStyle(selector) {
    if (this.cmsettings.mode === selector) {
      let style: Object = {'background-color': '#ff0000'};
      // console.log('selectionStyle: ', style);
      return style;
    } else {
      let style: Object = {'background-color': '#ffffff'};
      return style;
    }
  }

}
