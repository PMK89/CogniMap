import { Injectable } from '@angular/core';

@Injectable()
export class ObjectShapesService {

  public Shapes: Object = {
    'doublearrow': `<svg width="500" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path id="svg_1" d="m8.33437,100.00029l140.12614,-92.00029l0,45.99987l203.0795,0l0,-45.99987l140.12561,92.00029l-
      140.12561,91.99971l0,-45.99986l-203.0795,0l0,45.99986l-140.12614,-91.99971z" stroke-linecap="null" stroke-linejoin="null"
      stroke-dasharray="null" stroke-width="7" stroke="#666666" fill="#999999"/>
     </g>
    </svg>`,
    'diamond': `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path id="svg_1" d="m7.00001,99.99993l93.00003,-92.99993l92.99995,92.99993l-92.99995,93.00007l-93.00003,-93.00007z"
      stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="7" stroke="#666666" fill="#b2b2b2"/>
     </g>
    </svg>`,
    'pentagon': `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path id="svg_1" d="m7.5,79.20325l92.49997,-67.2986l92.50003,67.2986l-35.33179,108.8921l-114.3364,0l-35.33182,-108.8921z"
       stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="7" stroke="#666666" fill="#b2b2b2"/>
     </g>
    </svg>`,
    'hexagon': `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path fill="#b2b2b2" stroke="#666666" stroke-width="7" stroke-dasharray="null" stroke-linejoin="null" stroke-linecap="null"
       d="m9,100.00017l38.99991,-78.00018l104.00005,0l39.00005,78.00018l-39.00005,77.99985l-104.00005,0l-38.99991,-77.99985z" id="svg_1"/>
     </g>
    </svg>`,
    'speechbubble': `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path id="svg_1" d="m8.4625,7.94771l30.36609,0l0,0l45.54941,0l106.28183,0l0,70.8547l0,0l0,30.36606l0,20.24413l-
      106.28183,0l-75.62068,59.5351l30.07127,-59.5351l-30.36609,0l0,-20.24413l0,-30.36606l0,0l0,-70.8547z" stroke-linecap="null"
      stroke-linejoin="null" stroke-dasharray="null" stroke-width="7" stroke="#666666" fill="#b2b2b2"/>
     </g>
    </svg>`,
    'thoughtbubble': `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path id="svg_1" d="m9.54904,181.90439c0,-1.15788 1.39742,-2.09563 3.12247,-2.09563c1.72506,0 3.12247,0.93774 3.12247,2.09563c0,
      1.15781 -1.39742,2.09561 -3.12247,2.09561c-1.72506,0 -3.12247,-0.93781 -3.12247,-2.09561zm6.401,-15.05676c0,-2.89458 3.49338,
      -5.23907 7.80611,-5.23907c4.31273,0 7.80601,2.3445 7.80601,5.23907c0,2.89445 -3.49327,5.23897 -7.80601,5.23897c-4.31273,
      0 -7.80611,-2.34451 -7.80611,-5.23897zm14.83153,-22.82822c0,-8.00269 12.15684,-14.48477 27.16517,-14.48477c15.00829,
      0 27.1651,6.48209 27.1651,14.48477c0,8.00267 -12.15681,14.48477 -27.1651,14.48477c-15.00833,0 -27.16517,
      -6.4821 -27.16517,-14.48477zm-23.31407,-65.57089c0,-34.50198 41.64035,-62.44852 93.04813,-62.44852c51.4081,0 93.04847,
      27.94653 93.04847,62.44852c0,34.50197 -41.64037,62.44852 -93.04847,62.44852c-51.40778,0 -93.04813,-27.94655 -93.04813,
      -62.44852z" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="7" stroke="#666666" fill="#b2b2b2"/>
     </g>
    </svg>`,
    'thoughtbubble1': `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
     <g id="layer1">
      <title>Layer 1</title>
      <path id="svg_1" d="m14.29011,19c-3.78246,0 -6.82761,3.0451 -6.82761,6.82753l0,91.2413c0,3.78247 3.04515,6.82762 6.82761,
      6.82762l30.51082,0c-1.26099,1.44329 -1.95917,3.00964 -1.95917,4.65521c0,7.02982 12.63847,12.72421 28.24138,
      12.72421c15.60297,0 28.24146,-5.6944 28.24146,-12.72421c0,-1.64557 -0.6982,-3.21192 -1.95918,-4.65521l88.23492,0c3.78246,
      0 6.82762,-3.04515 6.82762,-6.82762l0,-91.2413c0,-3.78243 -3.04517,-6.82753 -6.82762,-6.82753l-171.31023,0zm33.51732,
      123.51712c-8.57311,0 -15.51739,3.33337 -15.51739,7.44838c0,4.11497 6.94428,7.44838 15.51739,7.44838c8.57302,0 15.51711,
      -3.3334 15.51711,-7.44838c0,-4.11501 -6.94409,-7.44838 -15.51711,-7.44838zm-15.51739,18.62083c-4.80094,0 -8.68956,
      2.49971 -8.68956,5.58604c0,3.0863 3.88862,5.58626 8.68956,5.58626c4.80097,0 8.68958,-2.49995 8.68958,-5.58626c0,
      -3.08633 -3.88861,-5.58604 -8.68958,-5.58604zm-14.89657,13.65509c-3.08633,0 -5.58609,1.38892 -5.58609,3.10341c0,
      1.71465 2.49976,3.10355 5.58609,3.10355c3.0865,0 5.58622,-1.3889 5.58622,-3.10355c0,-1.71449 -2.49972,-3.10341 -5.58622,
      -3.10341z" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="7" stroke="#666666" fill="#b2b2b2"/>
     </g>
    </svg>`,
  };

}
