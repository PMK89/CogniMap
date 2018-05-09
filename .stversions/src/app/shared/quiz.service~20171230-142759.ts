import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
declare var Snap: any;

// services
import { SettingsService } from './settings.service';
import { ElementService } from './element.service';
import { CmosvgService } from './shapes/cmosvg.service';
import { CmlsvgService } from './shapes/cmlsvg.service';

// models and reducers
import { CMSettings } from '../models/CMSettings';
import { CMEo } from '../models/CMEo';
// import { CMEl } from '../models/CMEl';
// import { SBBox } from '../models/SBBox';

@Injectable()
export class QuizService {
  public cmsvg: any;
  public cmsettings: CMSettings;

  constructor(private cmosvgService: CmosvgService,
              private settingsService: SettingsService,
              private elementService: ElementService,
              private cmlsvgService: CmlsvgService) {
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      if (data !== undefined) {
                        this.cmsettings = data;
                        // console.log(data);
                      }
                    });
              }
  // check if answer in quiz is correct and change the field accordingly
  public checkAnswer(tpquizval: string) {
    let id = parseInt(tpquizval.slice(4, tpquizval.indexOf('_')), 10);
    this.elementService.cmelements.subscribe((data) => {
        for (let key in data) {
          if (data[key]) {
            if (data[key].id === id) {
              let quizcmer = data[key];
              if (quizcmer.types[0] === 'q') {
                let quizcme = this.elementService.CMEtoCMEol(quizcmer);
                let pos = parseInt(tpquizval.slice(tpquizval.indexOf('_') + 1), 10);
                if (quizcme.cmobject.content[pos]) {
                  this.showAnswer(quizcme, tpquizval);
                  if (quizcme.cmobject.content[pos].correct) {
                    alert('Your answer was correct.');
                  } else {
                    alert('Your answer was incorrect!');
                  }
                } else if (tpquizval.slice(tpquizval.indexOf('_') + 1) === 'ans') {
                  console.log('answer test');
                }
              }
              id = 0;
            }
          }
        }
      }).unsubscribe();
  }

  // marks the quiz elements to show correct answer
  public showAnswer(quizcme: CMEo, idstring: string) {
    this.cmsvg = Snap('#cmsvg');
    for (let key in quizcme.cmobject.content) {
      if (quizcme.cmobject.content[key]) {
        let content = quizcme.cmobject.content[key];
        let svgrect = this.cmsvg.select('#cont' + quizcme.id.toString()
         + '_' + key.toString());
        if (svgrect) {
          let color;
          if (content.correct) {
            color = '#13be00';
          } else {
            color = '#be0000';
          }
          svgrect.attr({
            opacity: 0.4,
            fill: color
          });
        }
      }
    }
  }
}
