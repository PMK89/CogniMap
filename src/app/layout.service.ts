import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class LayoutService {

  public toolbar0Style = {
    'position': 'fixed',
    'left': 0,
    'top': 0,
    'width': 0,
    'height': 0,
    'opacity': 0,
    'background-color': '#ffffff',
    'display': 'none'
  };

  public toolbar1Style = {
    'position': 'fixed',
    'left': 0,
    'top': 0,
    'width': 0,
    'height': 0,
    'opacity': 0,
    'background-color': '#ffffff',
    'display': 'none'
  };

  public cmapStyle = {
    'position': 'absolute',
    'padding': 0,
    'left': 0,
    'top': 0,
    'width': '500000px',
    'height': '500000px',
    'opacity': 1,
    'background-color': '#ffffff',
    'display': 'block'
  };

  public menueStyle = {
    'position': 'absolute',
    'padding': 0,
    'left': 0,
    'top': 0,
    'width': 0,
    'height': 0,
    'opacity': 0,
    'background-color': '#ffffff',
    'display': 'none'
  };

  public widgets0Style = {
    'position': 'fixed',
    'border-style': 'solid',
    'border-width': '1px',
    'border-color': '#808080',
    'border-radius': '5px',
    'overflow': 'hidden',
    'padding': 0,
    'left': 0,
    'top': 0,
    'width': 0,
    'height': 0,
    'opacity': 0,
    'background-color': '#ffffff',
    'display': 'none'
  };

  public widgets1Style = {
    'position': 'fixed',
    'border-style': 'solid',
    'border-width': '1px',
    'border-color': '#808080',
    'border-radius': '5px',
    'overflow': 'hidden',
    'padding': 0,
    'left': 0,
    'top': 0,
    'width': 0,
    'height': 0,
    'opacity': 0,
    'background-color': '#ffffff',
    'display': 'none'
  };

  public startsettings: Object = {
    'cmap': {
      'display': 'block',
      'height': 500000,
      'left': 0,
      'opacity': 1,
      'position': 'absolute',
      'top': 0,
      'width': 500000,
      'z-index': 0
    },
    'cmtbfont': {
      buttons: 'tbfont',
      color: 'tbfont',
      font: [
        '"Times New Roman", Times, serif',
        'Arial, Helvetica, sans-serif',
        '"Comic Sans MS", cursive, sans-serif',
        '"Courier New", Courier, monospace',
        '"Monotype Corsiva", "Apple Chancery", "ITC Zapf Chancery", "URW Chancery L", cursive'
      ],
      size: [
        '++--',
        '1',
        'cmobject',
        'style',
        'title',
        'size'
      ]
    },
    'cmtbline': {
      'buttons': 'tbline',
      'color0': 'tbline0',
      'color1': 'tbline1',
      'size0': [
        '++--',
        '1',
        'cmline',
        'size0'
      ],
      'size1': [
        '++--',
        '1',
        'cmline',
        'size1'
      ],
      'trans': [
        '++--',
        '10',
        'cmline',
        'trans'
      ],
      'zPos': [
        '++--',
        '1',
        'prio'
      ]
    },
    'cmtbobject': {
      'buttons': 'tbobject',
      'color0': 'tbobject0',
      'color1': 'tbobject1',
      'trans': [
        '++--',
        '10',
        'cmobject',
        'trans'
      ],
      'zPos': [
        '++--',
        '1',
        'prio'
      ]
    },
    'coor': {
      x: 5000,
      y: 100000
    },
    'debug': true,
    'dev': false,
    'dirty': true,
    'dragging': false,
    'id': 1,
    'menue': {
      'display': 'block',
      'height': 400,
      'left': 0,
      'opacity': 0.8,
      'position': 'absolute',
      'top': 0,
      'width': 600,
      'z-index': 490
    },
    'mode': 'view',
    'style': {
      'bgcolor': '#ffffff',
      'boxclass': 'boxdefault',
      'btnbgcolor0': '#ffffff',
      'btnbgcolor1': '#f1f1f1',
      'btnbordercolor': '#00004d',
      'btnclass': 'btndefault',
      'btnclickcolor': '#0099cc',
      'btncontentcolor': '#000066',
      'btndeactcolor': '#bfbfbf',
      'font': '"Lucida Grande", Helvetica, Arial, Sans-Serif',
      'fontcolor': '#000000',
      'fontsize': 12,
      'linecolor': '#0f0f0f',
      'name': 'default',
      'shadowcolor': '#4f4f4f'
    },
    'tblayout0': {
      'display': 'block',
      'height': 20,
      'left': 0,
      'opacity': 0.8,
      'position': 'fixed',
      'top': 0,
      'width': 150,
      'z-index': 510
    },
    'tblayout1': {
      'display': 'none',
      'height': 80,
      'left': 0,
      'opacity': 0.8,
      'position': 'fixed',
      'top': 0,
      'width': 1134,
      'z-index': 515
    },
    'widget0': 'none',
    'widget1': 'none',
    'wlayout0': {
      'display': 'none',
      'height': 405,
      'left': 0,
      'opacity': 0.8,
      'position': 'fixed',
      'top': 80,
      'width': 600,
      'z-index': 510
    },
    'wlayout1': {
      'display': 'none',
      'height': 405,
      'left': 0,
      'opacity': 0.8,
      'position': 'fixed',
      'top': 485,
      'width': 600,
      'z-index': 510
    }
  };

  constructor(private http: Http) { }

  // reads data from JSON-File
  public getLayout() {
    return this.http.get('./assets/config/settings.json')
        .map((response: Response) => response.json());
  }

}
