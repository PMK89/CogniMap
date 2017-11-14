import { Injectable } from '@angular/core';
import { ElementService } from './element.service';
import { SettingsService } from './settings.service';
import { Boundaries } from '../models/boundaries';
import { CMSettings } from '../models/CMSettings';

@Injectable()
export class WindowService {

  public WinWidth: number;
  public WinHeight: number;
  public WinXOffset: number;
  public WinYOffset: number;
  public Parameters: Boundaries;
  public Boundaries0: Boundaries;
  public cmsettings: CMSettings;

  constructor(private elementService: ElementService,
              private settingsService: SettingsService) {
                this.settingsService.cmsettings
                    .subscribe((data) => {
                      this.cmsettings = data;
                      // console.log('settings ', data);
                    });
                this.Boundaries0 = {
                  l: 0,
                  r: 0,
                  t: 0,
                  b: 0
                };
  }

  public getSize() {
    if ( this.WinWidth && this.WinHeight ) {
      return {width: this.WinWidth, height: this.WinHeight};
    } else {
      console.log('Error loading WinWidth + WinHeight');
    }
  }
  public setSize(width, height) {
    this.WinWidth = width;
    this.WinHeight = height;
    // console.log('Width: ' + this.WinWidth + 'px; Height: ' + this.Win_Heigth + 'px')
  }

  public setOffset(XOffset, YOffset) {
    this.WinXOffset = XOffset;
    this.WinYOffset = YOffset;
    this.Boundaries0 = {
      l: this.WinXOffset,
      r: (this.WinXOffset + this.WinWidth),
      t: this.WinYOffset,
      b: (this.WinYOffset + this.WinHeight)
    };
    this.Parameters = {
      l: this.WinXOffset - 0.5 * this.WinWidth,
      r: (this.WinXOffset + 1.5 * this.WinWidth),
      t: this.WinYOffset - 0.5 * this.WinHeight,
      b: (this.WinYOffset + 1.5 * this.WinHeight)
    };
  }

  public getOffset() {
    if ( this.WinXOffset && this.WinYOffset ) {
      return this.WinXOffset, this.WinYOffset;
    } else {
      console.log('Error loading Win_XYOffset + WinYOffset');
    }
  }

  public getParameters(x: number, y: number) {
    if ( this.Boundaries0 && this.WinWidth && this.WinHeight ) {
      this.WinXOffset = x;
      this.WinYOffset = y;
      let Scrolled = false;
      let xdif = x - this.Boundaries0.l;
      let ydif = y - this.Boundaries0.t;
      if (Math.abs(xdif) > this.WinWidth && xdif < 0 ) {
        // this.Boundaries0.r = x + this.WinWidth;
        this.Parameters.l = x - (2 * this.WinWidth);
        this.Parameters.r = x + this.WinWidth;
        this.Parameters.t = y - (2 * this.WinHeight);
        this.Parameters.b = y + (2 * this.WinHeight);
        Scrolled = true;
        // console.log('- ', xdif);
      } else if (Math.abs(xdif) > this.WinWidth && xdif > 0 ) {
        // this.Boundaries0.r = x + this.WinWidth;
        this.Parameters.l = x - this.WinWidth;
        this.Parameters.r = x + (3 * this.WinWidth);
        this.Parameters.t = y - (2 * this.WinHeight);
        this.Parameters.b = y + (2 * this.WinHeight);
        Scrolled = true;
        // console.log('+ ', xdif);
      }
      if (Math.abs(ydif) > this.WinHeight && ydif < 0 ) {
        // this.Boundaries0.b = y + this.WinHeight;
        this.Parameters.t = y - (3 * this.WinHeight);
        this.Parameters.b = y + this.WinHeight;
        this.Parameters.l = x - (2 * this.WinWidth);
        this.Parameters.r = x + (2 * this.WinWidth);
        Scrolled = true;
        // console.log('- ', ydif);
      } else if (Math.abs(ydif) > this.WinHeight && ydif > 0 ) {
        // this.Boundaries0.b = y + this.WinHeight;
        this.Parameters.t = y - this.WinHeight;
        this.Parameters.b = y + (3 * this.WinHeight);
        this.Parameters.l = x - (2 * this.WinWidth);
        this.Parameters.r = x + (2 * this.WinWidth);
        Scrolled = true;
        // console.log('+ ', ydif);
      }
      if (Scrolled) {
        // console.log('x: ', x, 'y: ', y, 'Parameters: ', this.Parameters);
        this.Boundaries0.l = x;
        this.Boundaries0.t = y;
        this.cmsettings.coor.x = x;
        this.cmsettings.coor.y = y;
        this.settingsService.updateSettings(this.cmsettings);
        return this.Parameters;
      }
    } else {
      console.log('Error loading Boundaries1 + WinWidth + WinHeight');
      return this.Parameters = {
        l: 4000,
        r: 6000,
        t: 90000,
        b: 110000
      };
    }
  }
  public scrollXY(x: number, y: number) {
    let xMiddle = (x - (this.WinWidth / 2));
    let yMiddle = (y - (this.WinHeight / 2));
    window.scrollTo(xMiddle, yMiddle);
    this.setOffset(window.pageXOffset, window.pageYOffset);
    this.elementService.getElements(this.Parameters);
    this.cmsettings.coor = {
      x: xMiddle,
      y: yMiddle
    }
    this.settingsService.updateSettings(this.cmsettings);
    console.log(window.pageXOffset, window.pageYOffset, x, y);
  }
}
