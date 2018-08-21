import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { MathJaxService } from './mathjax.service';
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
  public colorarray = ['#770000', '#ff0000', '#ff9900', '#daff00', '#99ff33', '#006600'];
  public valuearray = ['0', '1', '2', '3', '4', '5'];

  constructor(private cmosvgService: CmosvgService,
              private settingsService: SettingsService,
              private electronService: ElectronService,
              private elementService: ElementService,
              private mathjaxService: MathJaxService,
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
    let id0 = parseInt(tpquizval.slice(4, tpquizval.indexOf('_')), 10);
    this.elementService.cmelements.subscribe((data) => {
        for (let key in data) {
          if (data[key]) {
            if (data[key].id === id0) {
              let quizcmer = data[key];
              if (quizcmer.types[0] === 'q1') {
                let quizcme = this.elementService.CMEtoCMEol(quizcmer);
                let pos = parseInt(tpquizval.slice(tpquizval.indexOf('_') + 1), 10);
                if (quizcme.cmobject.content[pos]) {
                  if (quizcme.cmobject.meta[0]['type'] === 'LaTeXquiz') {
                    // open latex editor with quiz
                    this.elementService.setSelectedCME(id0);
                    this.cmsettings.widget0 = 'equation';
                    this.cmsettings.wlayout0.display = 'block';
                    this.settingsService.updateSettings(this.cmsettings);
                  } else {
                    this.showAnswer(quizcme, tpquizval);
                    if (quizcme.cmobject.content[pos].correct) {
                      this.electronService.ipcRenderer.send('answerQuiz', {id: id0, scale: 5});
                    } else {
                      this.electronService.ipcRenderer.send('answerQuiz', {id: id0, scale: 1});
                    }
                  }
                } else if (tpquizval.slice(tpquizval.indexOf('_') + 1) === 'ans') {
                  this.removeQuiz(id0);
                  this.addDifScale(quizcme);
                } else if (tpquizval.slice(tpquizval.indexOf('_') + 1) === 'x') {
                  this.removeQuiz(id0);
                } else if (tpquizval.slice(tpquizval.indexOf('_') + 1).indexOf('dif') !== -1) {
                  let val = parseInt(tpquizval.slice(tpquizval.indexOf('_') + 4), 10);
                  if (val || val === 0) {
                    this.electronService.ipcRenderer.send('answerQuiz', {id: id0, scale: val});
                    this.removeQuiz(id0);
                  }
                }
              }
              id0 = 0;
            }
          }
        }
      }).unsubscribe();
  }

  // removes irrelevant chars from latexystrg to compare them
  public cleanLateX(latexstr: string) {
    let latexcompare = latexstr.replace(/ /g, '').replace(/{}/g, '').replace(/\[\]/g, '').replace(/\n/g, '');
    return latexcompare;
  }

  // compares LateX strings for matching charakters
  public compareStrings(str0: string, str1: string) {
    let latexans = this.cleanLateX(str0);
    let latexright = this.cleanLateX(str1);
    // console.log(latexans, latexright);
    let errors = 0;
    let latexansl = latexans.length;
    let latexrightl = latexright.length;
    let n = Math.max(latexansl, latexrightl);
    for (let i = 0; i < n; i++) {
      if (i < latexansl && i < latexrightl) {
        // console.log(latexans.charAt(i), latexright.charAt(i));
        if (latexans.charAt(i) !== latexright.charAt(i)) {
          errors += 1;
        }
      }
    }
    return errors;
  }

  // check if answer in quiz is correct and change the field accordingly
  public checkLaTeXAnswer(quizcme: CMEo, tpquizval: string, latexstr: string) {
    this.cmsvg = Snap('#cmsvg');
    let svggroup = this.cmsvg.select('#c' + quizcme.id.toString()  + '-0');
    let errors = this.compareStrings(tpquizval, latexstr);
    let rating = Math.max(0, (5 - errors));
    this.electronService.ipcRenderer.send('answerQuiz', {id: quizcme.id, scale: rating});
    this.showAnswer(quizcme, tpquizval);
    if (svggroup) {
      let svggroupchildren0 = svggroup.children();
      if (svggroupchildren0) {
        let svggroupchildren1 = svggroupchildren0[0].children();
        if (svggroupchildren1) {
          if (svggroupchildren1[0]) {
            let parent = svggroupchildren1[0].parent();
            let latexsnap = this.mathjaxService.getMjSVG(latexstr);
            svggroupchildren1[0].remove();
            parent.add(Snap.parse(latexsnap));
          }
        }
      }
    }
    console.log(tpquizval);
  }

  // marks the quiz elements to show correct answer
  public showAnswer(quizcme: CMEo, idstring: string) {
    this.cmsvg = Snap('#cmsvg');
    for (let key in quizcme.cmobject.content) {
      if (quizcme.cmobject.content[key]) {
        let content = quizcme.cmobject.content[key];
        let quizrect = this.cmsvg.select('#cont' + quizcme.id.toString()
         + '_' + key.toString());
        if (quizrect) {
          let color;
          if (content.correct) {
            color = '#13be00';
          } else {
            color = '#be0000';
          }
          quizrect.attr({
            opacity: 0.3,
            fill: color
          });
        }
      }
    }
    let svgrect = this.cmsvg.select('#cms' + quizcme.id.toString());
    if (svgrect) {
      let svgbbox = svgrect.getBBox();
      let Xx = svgbbox.x2 - 17;
      let Xy = svgbbox.y + 15;
      let anstxt = this.cmsvg.text(Xx, Xy, 'X');
      anstxt.attr({
        fontSize: quizcme.cmobject.style.title.size + 'px',
        fill: quizcme.cmobject.style.title.color,
        fontFamily: quizcme.cmobject.style.title.font,
        opacity: quizcme.cmobject.style.object.trans,
        id: 'xbtn' + quizcme.id.toString(),
        title: quizcme.id
      });
      let ansbbox = anstxt.getBBox();
      let ansrect = this.cmsvg.rect(ansbbox.x, ansbbox.y, ansbbox.w, ansbbox.h);
      ansrect.attr({
        id: 'cont' + quizcme.id.toString() + '_x',
        title: quizcme.id,
        strokeWidth: 2,
        fill: '#ffffff',
        opacity: 0
      });
      let svggrp = this.cmsvg.select('#g' + quizcme.id.toString());
      if (svggrp) {
        svggrp.add(anstxt);
        svggrp.add(ansrect);
      }
    }
  }

  // removes element after the question was answered
  public addDifScale(quizcme: CMEo) {
    this.cmsvg = Snap('#cmsvg');
    let dsgrp = this.cmsvg.g();
    dsgrp.attr({id: 'g' + quizcme.id.toString()});
    let title = this.cmsvg.text(quizcme.x0 + 3, quizcme.y0 + 3, quizcme.title);
    title.attr({
      fontSize: quizcme.cmobject.style.title.size + 'px',
      fill: quizcme.cmobject.style.title.color,
      fontFamily: quizcme.cmobject.style.title.font,
      opacity: 0.6,
      textDecoration: quizcme.cmobject.style.title.deco,
      id: 'title' + quizcme.id.toString(),
      title: quizcme.id
    });
    let difscaletgrp = this.cmsvg.g();
    let difscalergrp = this.cmsvg.g();
    let titlebbox = title.getBBox();
    let totwidth = 0;
    let ypos = quizcme.y0 + titlebbox.h + 6;
    for (let key in this.valuearray) {
      if (this.valuearray[key] && this.colorarray[key]) {
        let anstxt = this.cmsvg.text(quizcme.x0 + totwidth + 5, ypos + 3, this.valuearray[key]);
        anstxt.attr({
          fontSize: quizcme.cmobject.style.title.size + 'px',
          fill: '#000000',
          fontFamily: quizcme.cmobject.style.title.font,
          opacity: 0.6,
          id: 'diftxt' + quizcme.id.toString() + '-' + key.toString(),
          title: quizcme.id
        });
        let ansbbox = anstxt.getBBox();
        let ansrect = this.cmsvg.rect(quizcme.x0 + 3 + totwidth, ansbbox.y - 3, ansbbox.w + 6, ansbbox.h + 6);
        ansrect.attr({
          id: 'cont' + quizcme.id.toString() + '_dif' + key.toString(),
          title: quizcme.id,
          fill: this.colorarray[key],
          opacity: 0
        });
        ansbbox = ansrect.getBBox();
        ansrect.mousedown( (e) => {
          if (document.getElementById('TPquiz') !== undefined) {
            if (e.target) {
              if (e.target.id) {
                document.getElementById('TPquiz').title = e.target.id;
              }
            }
          }
        });
        let txtbg = ansrect.clone();
        txtbg.attr({
          id: 'difbg' + quizcme.id.toString() + '-' + key.toString(),
          opacity: 0.6
        });
        difscaletgrp.add(txtbg);
        difscaletgrp.add(anstxt);
        difscalergrp.add(ansrect);
        totwidth += ansbbox.w;
      }
    }
    let difscalebbox = difscalergrp.getBBox();
    let bgcolor;
    let bgrect = this.cmsvg.rect(quizcme.x0, titlebbox.y - 3, ((Math.max(difscalebbox.x2, titlebbox.x2) - quizcme.x0) + 3),
     ((difscalebbox.y2 - (titlebbox.y - 3)) + 3));
    if (quizcme.cmobject.style.object.color0 === 'none') {
      bgcolor = '#ffffff';
    } else {
      bgcolor = quizcme.cmobject.style.object.color0;
    }
    bgrect.attr({
      title: quizcme.id,
      strokeWidth: 0,
      opacity: 0.6,
      fill: bgcolor
    });
    dsgrp.add(bgrect);
    dsgrp.add(title);
    dsgrp.add(difscaletgrp);
    dsgrp.add(difscalergrp);
  }

  // removes element from view after the question was answered
  public removeQuiz(id: number) {
    this.cmsvg = Snap('#cmsvg');
    let svggrp = this.cmsvg.select('#g' + id.toString());
    if (svggrp) {
      svggrp.remove();
    }
  }
}
