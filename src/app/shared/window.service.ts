import { Injectable } from '@angular/core';
import { Boundaries } from '../models/boundaries';

@Injectable()
export class WindowService {

  Win_Width: number;
  Win_Height: number;
  Win_XOffset: number;
  Win_YOffset: number;
  Parameters: Boundaries;
  Boundaries0: Boundaries;
  Boundaries1: Boundaries;

  constructor() {
    this.Boundaries0 = {
      'l': 0,
      'r': 0,
      't': 0,
      'b': 0
    };
  }

  getSize() {
    if ( this.Win_Width && this.Win_Height ) {
      return {width: this.Win_Width, height: this.Win_Height};
    } else {
      console.log('Error loading Win_Width + Win_Height');
    }
  }
  setSize(width, height) {
    this.Win_Width = Math.round(width);
    this.Win_Height = Math.round(height);
    // console.log('Width: ' + this.Win_Width + 'px; Height: ' + this.Win_Heigth + 'px')
  }
  setOffset(XOffset, YOffset) {
    this.Win_XOffset = Math.round(XOffset);
    this.Win_YOffset = Math.round(YOffset);
    this.Boundaries1 = {
      'l': this.Win_XOffset,
      'r': (this.Win_XOffset + this.Win_Width),
      't': this.Win_YOffset,
      'b': (this.Win_YOffset + this.Win_Height)
    };
    // console.log('XOffset: ' + this.Win_XOffset + 'px; YOffset: ' + this.Win_YOffset + 'px')
  }
  getOffset() {
    if ( this.Win_XOffset && this.Win_YOffset ) {
      return this.Win_XOffset, this.Win_YOffset;
    } else {
      console.log('Error loading Win_XYOffset + Win_YOffset');
    }
  }
  getParameters() {
    if ( this.Boundaries1 && this.Win_Width && this.Win_Height ) {
      let Scrolled = false;
      if ((this.Boundaries0.l - this.Boundaries1.l) >= (this.Win_Width / 2)) {
        this.Boundaries0.l = this.Boundaries1.l;
        this.Boundaries0.r = this.Boundaries1.r;
        Scrolled = true;
      } else if ((this.Boundaries0.t - this.Boundaries1.t) >= (this.Win_Height / 2)) {
        this.Boundaries0.t = this.Boundaries1.t;
        this.Boundaries0.b = this.Boundaries1.b;
        Scrolled = true;
      } else if ((this.Boundaries1.r - this.Boundaries0.r) >= (this.Win_Width / 2)) {
        this.Boundaries0.l = this.Boundaries1.l;
        this.Boundaries0.r = this.Boundaries1.r;
        Scrolled = true;
      } else if ((this.Boundaries1.b - this.Boundaries0.b) >= (this.Win_Height / 2)) {
        this.Boundaries0.t = this.Boundaries1.t;
        this.Boundaries0.b = this.Boundaries1.b;
        Scrolled = true;
      };
      if (Scrolled) {
        // console.log(this.Parameters);
        return this.Parameters = {
          'l': Math.round(this.Boundaries1.l - this.Win_Width),
          'r': Math.round(this.Boundaries1.r + this.Win_Width),
          't': Math.round(this.Boundaries1.t - this.Win_Height),
          'b': Math.round(this.Boundaries1.b + this.Win_Height)
        };
      }
    } else {
      console.log('Error loading Boundaries1 + Win_Width + Win_Height');
      return this.Parameters = {
        'l': 4000,
        'r': 6000,
        't': 90000,
        'b': 110000
      };
    }
  }
  scrollXY(x: number, y: number) {
    window.scrollTo((x - (this.Win_Width / 2)), (y - (this.Win_Height / 2)));
    console.log(window.pageXOffset, window.pageYOffset, x, y);
  }
}
