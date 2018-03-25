import { Injectable } from '@angular/core';

@Injectable()
export class LineShapesService {

  public ArrowHeads: Object = {
    fat: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path id="svg_1" d="m103.93563,100.98254l-95.40053,-95.50008l62.82886,0l95.40089,95.50008l-95.40089,
      95.49994l-62.82886,0l95.40053,-95.49994z" stroke-linecap="null" stroke-linejoin="null"
      stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="#FF0000"/>
     </g>
    </svg>`,
    slim: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path id="svg_1" d="m96.20162,98.94733l-51.53222,-92.50486l92.65666,92.50486l-92.65666,
      92.50497l51.53222,-92.50497z" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null"
       stroke-width="5" stroke="#000000" fill="#FF0000"/>
     </g>
    </svg>`,
    triangle: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path transform="rotate(90, 105.383, 100.288)" id="svg_1" d="m11.8825,182.10019l93.49998,
      -163.62456l93.50003,163.62456l-187.00001,0z" stroke-width="5" stroke="#000000" fill="#FF0000"/>
     </g>
    </svg>`,
  };

}
