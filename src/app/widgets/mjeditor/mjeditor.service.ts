import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
declare var Snap: any;

// electron specific
// declare var electron: any;
// const ipc = electron.ipcRenderer;

// services
import { SettingsService } from '../../shared/settings.service';
import { ElementService } from '../../shared/element.service';

// models and reducers
import { CMSettings } from '../../models/CMSettings';

@Injectable()
export class MjEditorService {
  public cmsettings: CMSettings;
  public selectionStart = 0;
  public selectionEnd = 0;
  public inputtext = '';
  public svgStrg = '';
  public svgWidth = 100;
  public inputtextarray = [];
  public inputtextarraypos: number;
  public svgoutput;

  constructor(private settingsService: SettingsService,
              private elementService: ElementService,
              private electronService: ElectronService) {

              }

  // moves element to entered coordinates
  public makeLatex(oField, tex) {
    if (typeof oField.selectionStart === 'number') {
       this.selectionStart = oField.selectionStart;
       this.selectionEnd = oField.selectionEnd;
    }
    this.placeSvg(tex);
  }

  // handles button input
  public buttonInput(cell, inputtext) {
    if (inputtext) {
      this.inputtext = inputtext;
    }
    if (cell.string) {
      if ((!cell.substring && cell.substring !== 0) || this.selectionStart === this.selectionEnd) {
        this.inputtext = this.inputtext.substr(0, this.selectionStart) + cell.string + this.inputtext.substr(this.selectionStart);
      } else {
        this.inputtext = this.inputtext.substr(0, this.selectionStart) + cell.string.substr(0, cell.pos)
        + this.inputtext.substr(this.selectionStart, (this.selectionEnd - this.selectionStart))
        + cell.string.substr(cell.pos) + this.inputtext.substr(this.selectionEnd);
      }
      this.placeSvg(this.inputtext);
      return this.inputtext;
    }
  }

  // inserts a color tag
  public makeColor(color) {
    if (color) {
      let colorpos = this.inputtext.slice((this.selectionStart - 20), this.selectionStart).indexOf('color{#');
      if (colorpos !== -1) {
        this.inputtext = this.inputtext.slice(0, ((this.selectionStart - 20) + colorpos + 7)) +
        color + this.inputtext.slice((this.selectionStart - 20) + colorpos + 14);
      } else {
        if (this.selectionStart === this.selectionEnd) {
          this.inputtext = this.inputtext.substr(0, this.selectionStart) + '\\color{' + color +
          '}{' + this.inputtext.substr(this.selectionStart) + '}';
        } else {
          this.inputtext = this.inputtext.substr(0, this.selectionStart) + '\\color{' + color + '}{'
          + this.inputtext.substr(this.selectionStart, (this.selectionEnd - this.selectionStart)) + '}' +
          this.inputtext.substr(this.selectionEnd);
        }
      }
      this.placeSvg(this.inputtext);
      return this.inputtext;
    }
  }

  // makes a matrix from user inputtext
  public makeMatrix(matrix, matrixX, matrixY) {
    if (typeof matrixX !== 'number') {
      matrixX = parseInt(matrixX, 10);
    }
    if (typeof matrixY !== 'number') {
      matrixY = parseInt(matrixY, 10);
    }
    if (matrix.string) {
      this.inputtext = this.inputtext.substr(0, this.selectionStart) + matrix.string.substr(0, matrix.pos)
      + this.makeRowCol(matrixX, matrixY) + matrix.string.substr(matrix.pos) + this.inputtext.substr(this.selectionStart);
      this.placeSvg(this.inputtext);
      return this.inputtext;
    }
  }

  // makes the rows and column from given user data
  public makeRowCol(matrixX: number, matrixY: number) {
    if (matrixX && matrixY) {
      let matrixString = '';
      for (let i = 0; i < matrixY; i++) {
        for (let j = 0; j < matrixX; j++) {
          if (j === 0) {
            matrixString += '  ';
          } else {
            matrixString += '&  ';
          }
        }
        if (i !== (matrixY - 1)) {
          matrixString += ' \\\\';
        }
      }
      return matrixString;
    }
  }

  // generates svg for buttons
  public makeButtonSvg() {
    if (this.inputtext) {
      let latexarray = this.inputtext.split(' ');
      if (latexarray) {
        if (latexarray.length > 0) {
          let totalstring = '';
          for (let key in latexarray) {
            if (latexarray[key]) {
              // console.log(latexarray[key]);
              if (latexarray[key].startsWith('\\')) {
                let buttonstring = '{\n\tname: \'' + latexarray[key].slice(1) + '\',\n\tsvg: ' +
                JSON.stringify(this.electronService.ipcRenderer.sendSync('makeMjSVG', latexarray[key]).svg) +
                ',\n\tstring: \'\\' + latexarray[key] + '\',\n\tsubstring: \'false\',\n\tpos: 0\n},\n';
                totalstring += buttonstring;
              } else {
                let buttonstring = '{\n\tname: \'' + latexarray[key] + '\',\n\tsvg: ' +
                JSON.stringify(this.electronService.ipcRenderer.sendSync('makeMjSVG', latexarray[key]).svg) +
                ',\n\tstring: \'' + latexarray[key] + '\',\n\tsubstring: \'false\',\n\tpos: 0\n},\n';
                totalstring += buttonstring;
              }
            }
          }
          console.log(totalstring);
        }
      }
    }
  }

  // save Latex or make new object
  public saveLateX(element, key) {
    if (element) {
      if (element.cmobject) {
        if (key < 0) {
          let newlatex = {
            info: this.inputtext,
            cat: 'LateX',
            content: this.svgStrg,
            coor: {
              x: 0,
              y: 0
            },
            width: this.svgWidth,
            height: 100
          };
          element.cmobject.content.push(newlatex);
          this.elementService.updateSelCMEo(element);
        } else {
          if (element.cmobject.content) {
            if (element.cmobject.content[key]) {
              element.cmobject.content[key].info = this.inputtext;
              element.cmobject.content[key].content = this.svgStrg;
              console.log(element.cmobject.content[key]);
              this.elementService.updateSelCMEo(element);
            }
          }
        }
      }
    }
  }

  // place svg with snap
  public placeSvg(tex, old?) {
    if (tex || tex === '') {
      this.inputtext = tex;
      if (!old) {
        this.saveInputTxt(tex);
      }
      this.svgoutput = this.electronService.ipcRenderer.sendSync('makeMjSVG', tex);
      this.svgWidth = this.svgoutput.width;
      if (this.svgoutput.svg) {
        this.svgStrg = JSON.stringify(this.svgoutput.svg);
        // console.log(this.svgStrg);
        let s = Snap('#mjeditorsvg');
        s.clear();
        let mjo = Snap.parse(this.svgoutput.svg);
        s.add(mjo);
      }
    }
  }

  // saves last 100 changes in an array
  public saveInputTxt(inputtext) {
    if (this.inputtextarray.length === 0) {
      this.inputtextarray.push(inputtext);
    } else if (this.inputtextarray[this.inputtextarray.length - 1] !== inputtext) {
      // console.log(inputtext, this.inputtextarray.length);
      if (this.inputtextarray.length < 100) {
        this.inputtextarray.push(inputtext);
      } else {
        this.inputtextarray.shift();
        this.inputtextarray.push(inputtext);
      }
    }
  }

  // goes back in saved input
  public goBack() {
    if (this.inputtextarraypos) {
      if (this.inputtextarraypos > 0) {
        this.inputtextarraypos--;
      }
    } else {
      if (this.inputtextarraypos !== 0) {
        this.inputtextarraypos = this.inputtextarray.length - 1;
      }
    }
    this.placeSvg(this.inputtextarray[this.inputtextarraypos], true);
    return this.inputtextarray[this.inputtextarraypos];
  }

  // goes back in saved input
  public goForward() {
    if (this.inputtextarraypos || this.inputtextarraypos === 0) {
      if (this.inputtextarraypos < this.inputtextarray.length - 1) {
        this.inputtextarraypos++;
      }
      this.placeSvg(this.inputtextarray[this.inputtextarraypos], true);
      return this.inputtextarray[this.inputtextarraypos];
    } else {
      this.placeSvg(this.inputtext, true);
      return this.inputtext;
    }
  }

}
