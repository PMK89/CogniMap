import { Injectable } from '@angular/core';
import { ElementService } from './element.service';
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

  constructor(private elementService: ElementService) {
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
    this.Parameters = {
      'l': this.Win_XOffset - 0.5 * this.Win_Width,
      'r': (this.Win_XOffset + 1.5 * this.Win_Width),
      't': this.Win_YOffset - 0.5 * this.Win_Height,
      'b': (this.Win_YOffset + 1.5 * this.Win_Height)
    };
    // console.log('XOffset: ' + this.Win_XOffset + 'px; YOffset: ' + this.Win_YOffset + 'px') Math.abs(ydif) > this.Win_Height
  }
  getOffset() {
    if ( this.Win_XOffset && this.Win_YOffset ) {
      return this.Win_XOffset, this.Win_YOffset;
    } else {
      console.log('Error loading Win_XYOffset + Win_YOffset');
    }
  }
  getParameters(x: number, y: number) {
    if ( this.Boundaries1 && this.Win_Width && this.Win_Height ) {
      let Scrolled = false;
      let xdif = x - this.Boundaries0.l;
      let ydif = y - this.Boundaries0.t;
      if (Math.abs(xdif) > this.Win_Width && xdif < 0 ) {
        this.Boundaries0.l = x;
        this.Parameters.l = x - 2 * this.Win_Width;
        this.Parameters.r = x + this.Win_Width;
        Scrolled = true;
        // console.log('- ', xdif);
      } else if (Math.abs(xdif) > this.Win_Width && xdif > 0 ) {
        this.Boundaries0.l = x;
        this.Parameters.l = x - this.Win_Width;
        this.Parameters.r = x + 3 * this.Win_Width;
        Scrolled = true;
        // console.log('+ ', xdif);
      }
      if (Math.abs(ydif) > this.Win_Height && ydif < 0 ) {
        this.Boundaries0.t = y;
        this.Parameters.t = y - 2 * this.Win_Height;
        this.Parameters.b = y + this.Win_Height;
        Scrolled = true;
        // console.log('- ', ydif);
      } else if (Math.abs(ydif) > this.Win_Height && ydif > 0 ) {
        this.Boundaries0.t = y;
        this.Parameters.t = y - this.Win_Height;
        this.Parameters.b = y + 3 * this.Win_Height;
        Scrolled = true;
        // console.log('+ ', ydif);
      }
      if (Scrolled) {
        // console.log(this.Parameters);
        return this.Parameters;
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
    this.setOffset(window.pageXOffset, window.pageYOffset);
    this.elementService.getElements(this.Parameters);
    console.log(window.pageXOffset, window.pageYOffset, x, y);
  }
}
