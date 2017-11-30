import { Injectable } from '@angular/core';

@Injectable()
export class MjEditorLatexService {
  // small greek letters
  public greekSmall = [
    [
      {
      	name: 'alpha',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.488ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 640.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\alpha</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3B1\" d=\"M34 156Q34 270 120 356T309 442Q379 442 421 402T478 304Q484 275 485 237V208Q534 282 560 374Q564 388 566 390T582 393Q603 393 603 385Q603 376 594 346T558 261T497 161L486 147L487 123Q489 67 495 47T514 26Q528 28 540 37T557 60Q559 67 562 68T577 70Q597 70 597 62Q597 56 591 43Q579 19 556 5T512 -10H505Q438 -10 414 62L411 69L400 61Q390 53 370 41T325 18T267 -2T203 -11Q124 -11 79 39T34 156ZM208 26Q257 26 306 47T379 90L403 112Q401 255 396 290Q382 405 304 405Q235 405 183 332Q156 292 139 224T121 120Q121 71 146 49T208 26Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3B1\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\alpha',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'beta',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.332ex\" height=\"2.509ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -791.3 573.5 1080.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\beta</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3B2\" d=\"M29 -194Q23 -188 23 -186Q23 -183 102 134T186 465Q208 533 243 584T309 658Q365 705 429 705H431Q493 705 533 667T573 570Q573 465 469 396L482 383Q533 332 533 252Q533 139 448 65T257 -10Q227 -10 203 -2T165 17T143 40T131 59T126 65L62 -188Q60 -194 42 -194H29ZM353 431Q392 431 427 419L432 422Q436 426 439 429T449 439T461 453T472 471T484 495T493 524T501 560Q503 569 503 593Q503 611 502 616Q487 667 426 667Q384 667 347 643T286 582T247 514T224 455Q219 439 186 308T152 168Q151 163 151 147Q151 99 173 68Q204 26 260 26Q302 26 349 51T425 137Q441 171 449 214T457 279Q457 337 422 372Q380 358 347 358H337Q258 358 258 389Q258 396 261 403Q275 431 353 431Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3B2\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\beta',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'gamma',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.262ex\" height=\"2.176ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -576.1 543.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\gamma</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3B3\" d=\"M31 249Q11 249 11 258Q11 275 26 304T66 365T129 418T206 441Q233 441 239 440Q287 429 318 386T371 255Q385 195 385 170Q385 166 386 166L398 193Q418 244 443 300T486 391T508 430Q510 431 524 431H537Q543 425 543 422Q543 418 522 378T463 251T391 71Q385 55 378 6T357 -100Q341 -165 330 -190T303 -216Q286 -216 286 -188Q286 -138 340 32L346 51L347 69Q348 79 348 100Q348 257 291 317Q251 355 196 355Q148 355 108 329T51 260Q49 251 47 251Q45 249 31 249Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3B3\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\gamma',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'delta',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.049ex\" height=\"2.343ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -863.1 451.5 1008.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\delta</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3B4\" d=\"M195 609Q195 656 227 686T302 717Q319 716 351 709T407 697T433 690Q451 682 451 662Q451 644 438 628T403 612Q382 612 348 641T288 671T249 657T235 628Q235 584 334 463Q401 379 401 292Q401 169 340 80T205 -10H198Q127 -10 83 36T36 153Q36 286 151 382Q191 413 252 434Q252 435 245 449T230 481T214 521T201 566T195 609ZM112 130Q112 83 136 55T204 27Q233 27 256 51T291 111T309 178T316 232Q316 267 309 298T295 344T269 400L259 396Q215 381 183 342T137 256T118 179T112 130Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3B4\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\delta',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'epsilon',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"0.944ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 406.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\epsilon</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3F5\" d=\"M227 -11Q149 -11 95 41T40 174Q40 262 87 322Q121 367 173 396T287 430Q289 431 329 431H367Q382 426 382 411Q382 385 341 385H325H312Q191 385 154 277L150 265H327Q340 256 340 246Q340 228 320 219H138V217Q128 187 128 143Q128 77 160 52T231 26Q258 26 284 36T326 57T343 68Q350 68 354 58T358 39Q358 36 357 35Q354 31 337 21T289 0T227 -11Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3F5\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\epsilon',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'zeta',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.095ex\" height=\"2.509ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -791.3 471.5 1080.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\zeta</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3B6\" d=\"M296 643Q298 704 324 704Q342 704 342 687Q342 682 339 664T336 633Q336 623 337 618T338 611Q339 612 341 612Q343 614 354 616T374 618L384 619H394Q471 619 471 586Q467 548 386 546H372Q338 546 320 564L311 558Q235 506 175 398T114 190Q114 171 116 155T125 127T137 104T153 86T171 72T192 61T213 53T235 46T256 39L322 16Q389 -10 389 -80Q389 -119 364 -154T300 -202Q292 -204 274 -204Q247 -204 225 -196Q210 -192 193 -182T172 -167Q167 -159 173 -148Q180 -139 191 -139Q195 -139 221 -153T283 -168Q298 -166 310 -152T322 -117Q322 -91 302 -75T250 -51T183 -29T116 4T65 62T44 160Q44 287 121 410T293 590L302 595Q296 613 296 643Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3B6\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\zeta',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'eta',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.169ex\" height=\"2.176ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -576.1 503.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\eta</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3B7\" d=\"M21 287Q22 290 23 295T28 317T38 348T53 381T73 411T99 433T132 442Q156 442 175 435T205 417T221 395T229 376L231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336V326Q503 302 439 53Q381 -182 377 -189Q364 -216 332 -216Q319 -216 310 -208T299 -186Q299 -177 358 57L420 307Q423 322 423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 114 189T154 366Q154 405 128 405Q107 405 92 377T68 316T57 280Q55 278 41 278H27Q21 284 21 287Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3B7\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\eta',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'theta',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.09ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 469.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\theta</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3B8\" d=\"M35 200Q35 302 74 415T180 610T319 704Q320 704 327 704T339 705Q393 701 423 656Q462 596 462 495Q462 380 417 261T302 66T168 -10H161Q125 -10 99 10T60 63T41 130T35 200ZM383 566Q383 668 330 668Q294 668 260 623T204 521T170 421T157 371Q206 370 254 370L351 371Q352 372 359 404T375 484T383 566ZM113 132Q113 26 166 26Q181 26 198 36T239 74T287 161T335 307L340 324H145Q145 321 136 286T120 208T113 132Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3B8\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\theta',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'iota',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"0.823ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 354.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\iota</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3B9\" d=\"M139 -10Q111 -10 92 0T64 25T52 52T48 74Q48 89 55 109T85 199T135 375L137 384Q139 394 140 397T145 409T151 422T160 431T173 439T190 442Q202 442 213 435T225 410Q225 404 214 358T181 238T137 107Q126 74 126 54Q126 43 126 39T130 31T142 27H147Q206 27 255 78Q272 98 281 114T290 138T295 149T313 153Q321 153 324 153T329 152T332 149T332 143Q332 106 276 48T145 -10H139Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3B9\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\iota',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'kappa',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.339ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 576.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\kappa</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3BA\" d=\"M83 -11Q70 -11 62 -4T51 8T49 17Q49 30 96 217T147 414Q160 442 193 442Q205 441 213 435T223 422T225 412Q225 401 208 337L192 270Q193 269 208 277T235 292Q252 304 306 349T396 412T467 431Q489 431 500 420T512 391Q512 366 494 347T449 327Q430 327 418 338T405 368Q405 370 407 380L397 375Q368 360 315 315L253 266L240 257H245Q262 257 300 251T366 230Q422 203 422 150Q422 140 417 114T411 67Q411 26 437 26Q484 26 513 137Q516 149 519 151T535 153Q554 153 554 144Q554 121 527 64T457 -7Q447 -10 431 -10Q386 -10 360 17T333 90Q333 108 336 122T339 146Q339 170 320 186T271 209T222 218T185 221H180L155 122Q129 22 126 16Q113 -11 83 -11Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3BA\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\kappa',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'lambda',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.355ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 583.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\lambda</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3BB\" d=\"M166 673Q166 685 183 694H202Q292 691 316 644Q322 629 373 486T474 207T524 67Q531 47 537 34T546 15T551 6T555 2T556 -2T550 -11H482Q457 3 450 18T399 152L354 277L340 262Q327 246 293 207T236 141Q211 112 174 69Q123 9 111 -1T83 -12Q47 -12 47 20Q47 37 61 52T199 187Q229 216 266 252T321 306L338 322Q338 323 288 462T234 612Q214 657 183 657Q166 657 166 673Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3BB\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\lambda',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'mu',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.402ex\" height=\"2.176ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -576.1 603.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\mu</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3BC\" d=\"M58 -216Q44 -216 34 -208T23 -186Q23 -176 96 116T173 414Q186 442 219 442Q231 441 239 435T249 423T251 413Q251 401 220 279T187 142Q185 131 185 107V99Q185 26 252 26Q261 26 270 27T287 31T302 38T315 45T327 55T338 65T348 77T356 88T365 100L372 110L408 253Q444 395 448 404Q461 431 491 431Q504 431 512 424T523 412T525 402L449 84Q448 79 448 68Q448 43 455 35T476 26Q485 27 496 35Q517 55 537 131Q543 151 547 152Q549 153 557 153H561Q580 153 580 144Q580 138 575 117T555 63T523 13Q510 0 491 -8Q483 -10 467 -10Q446 -10 429 -4T402 11T385 29T376 44T374 51L368 45Q362 39 350 30T324 12T288 -4T246 -11Q199 -11 153 12L129 -85Q108 -167 104 -180T92 -202Q76 -216 58 -216Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3BC\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\mu',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'nu',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.232ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 530.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\nu</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3BD\" d=\"M74 431Q75 431 146 436T219 442Q231 442 231 434Q231 428 185 241L137 51H140L150 55Q161 59 177 67T214 86T261 119T312 165Q410 264 445 394Q458 442 496 442Q509 442 519 434T530 411Q530 390 516 352T469 262T388 162T267 70T106 5Q81 -2 71 -2Q66 -2 59 -1T51 1Q45 5 45 11Q45 13 88 188L132 364Q133 377 125 380T86 385H65Q59 391 59 393T61 412Q65 431 74 431Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3BD\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\nu',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'xi',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.03ex\" height=\"2.509ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -791.3 443.5 1080.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\xi</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3BE\" d=\"M268 632Q268 704 296 704Q314 704 314 687Q314 682 311 664T308 635T309 620V616H315Q342 619 360 619Q443 619 443 586Q439 548 358 546H344Q326 546 317 549T290 566Q257 550 226 505T195 405Q195 381 201 364T211 342T218 337Q266 347 298 347Q375 347 375 314Q374 297 359 288T327 277T280 275Q234 275 208 283L195 286Q149 260 119 214T88 130Q88 116 90 108Q101 79 129 63T229 20Q238 17 243 15Q337 -21 354 -33Q383 -53 383 -94Q383 -137 351 -171T273 -205Q240 -205 202 -190T158 -167Q156 -163 156 -159Q156 -151 161 -146T176 -140Q182 -140 189 -143Q232 -168 274 -168Q286 -168 292 -165Q313 -151 313 -129Q313 -112 301 -104T232 -75Q214 -68 204 -64Q198 -62 171 -52T136 -38T107 -24T78 -8T56 12T36 37T26 66T21 103Q21 149 55 206T145 301L154 307L148 313Q141 319 136 323T124 338T111 358T103 382T99 413Q99 471 143 524T259 602L271 607Q268 618 268 632Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3BE\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\xi',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'o',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.128ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 485.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">o</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-6F\" d=\"M201 -11Q126 -11 80 38T34 156Q34 221 64 279T146 380Q222 441 301 441Q333 441 341 440Q354 437 367 433T402 417T438 387T464 338T476 268Q476 161 390 75T201 -11ZM121 120Q121 70 147 48T206 26Q250 26 289 58T351 142Q360 163 374 216T388 308Q388 352 370 375Q346 405 306 405Q243 405 195 347Q158 303 140 230T121 120Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-6F\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'o',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'pi',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.332ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 573.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\pi</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3C0\" d=\"M132 -11Q98 -11 98 22V33L111 61Q186 219 220 334L228 358H196Q158 358 142 355T103 336Q92 329 81 318T62 297T53 285Q51 284 38 284Q19 284 19 294Q19 300 38 329T93 391T164 429Q171 431 389 431Q549 431 553 430Q573 423 573 402Q573 371 541 360Q535 358 472 358H408L405 341Q393 269 393 222Q393 170 402 129T421 65T431 37Q431 20 417 5T381 -10Q370 -10 363 -7T347 17T331 77Q330 86 330 121Q330 170 339 226T357 318T367 358H269L268 354Q268 351 249 275T206 114T175 17Q164 -11 132 -11Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3C0\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\pi',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'rho',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.202ex\" height=\"2.176ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -576.1 517.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\rho</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3C1\" d=\"M58 -216Q25 -216 23 -186Q23 -176 73 26T127 234Q143 289 182 341Q252 427 341 441Q343 441 349 441T359 442Q432 442 471 394T510 276Q510 219 486 165T425 74T345 13T266 -10H255H248Q197 -10 165 35L160 41L133 -71Q108 -168 104 -181T92 -202Q76 -216 58 -216ZM424 322Q424 359 407 382T357 405Q322 405 287 376T231 300Q217 269 193 170L176 102Q193 26 260 26Q298 26 334 62Q367 92 389 158T418 266T424 322Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3C1\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\rho',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'sigma',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.33ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 572.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\sigma</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3C3\" d=\"M184 -11Q116 -11 74 34T31 147Q31 247 104 333T274 430Q275 431 414 431H552Q553 430 555 429T559 427T562 425T565 422T567 420T569 416T570 412T571 407T572 401Q572 357 507 357Q500 357 490 357T476 358H416L421 348Q439 310 439 263Q439 153 359 71T184 -11ZM361 278Q361 358 276 358Q152 358 115 184Q114 180 114 178Q106 141 106 117Q106 67 131 47T188 26Q242 26 287 73Q316 103 334 153T356 233T361 278Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3C3\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\sigma',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'tau',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.202ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 517.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\tau</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3C4\" d=\"M39 284Q18 284 18 294Q18 301 45 338T99 398Q134 425 164 429Q170 431 332 431Q492 431 497 429Q517 424 517 402Q517 388 508 376T485 360Q479 358 389 358T299 356Q298 355 283 274T251 109T233 20Q228 5 215 -4T186 -13Q153 -13 153 20V30L203 192Q214 228 227 272T248 336L254 357Q254 358 208 358Q206 358 197 358T183 359Q105 359 61 295Q56 287 53 286T39 284Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3C4\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\tau',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'upsilon',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.255ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 540.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\upsilon</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3C5\" d=\"M413 384Q413 406 432 424T473 443Q492 443 507 425T523 367Q523 334 508 270T468 153Q424 63 373 27T282 -10H268Q220 -10 186 2T135 36T111 78T104 121Q104 170 138 262T173 379Q173 380 173 381Q173 390 173 393T169 400T158 404H154Q131 404 112 385T82 344T65 302T57 280Q55 278 41 278H27Q21 284 21 287Q21 299 34 333T82 404T161 441Q200 441 225 419T250 355Q248 336 247 334Q247 331 232 291T201 199T185 118Q185 68 211 47T275 26Q317 26 355 57T416 132T452 216T465 277Q465 301 457 318T439 343T421 361T413 384Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3C5\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\upsilon',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'phi',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.385ex\" height=\"2.509ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -791.3 596.5 1080.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\phi</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3D5\" d=\"M409 688Q413 694 421 694H429H442Q448 688 448 686Q448 679 418 563Q411 535 404 504T392 458L388 442Q388 441 397 441T429 435T477 418Q521 397 550 357T579 260T548 151T471 65T374 11T279 -10H275L251 -105Q245 -128 238 -160Q230 -192 227 -198T215 -205H209Q189 -205 189 -198Q189 -193 211 -103L234 -11Q234 -10 226 -10Q221 -10 206 -8T161 6T107 36T62 89T43 171Q43 231 76 284T157 370T254 422T342 441Q347 441 348 445L378 567Q409 686 409 688ZM122 150Q122 116 134 91T167 53T203 35T237 27H244L337 404Q333 404 326 403T297 395T255 379T211 350T170 304Q152 276 137 237Q122 191 122 150ZM500 282Q500 320 484 347T444 385T405 400T381 404H378L332 217L284 29Q284 27 285 27Q293 27 317 33T357 47Q400 66 431 100T475 170T494 234T500 282Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3D5\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\phi',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'chi',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.455ex\" height=\"2.009ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -576.1 626.5 865.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\chi</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3C7\" d=\"M576 -125Q576 -147 547 -175T487 -204H476Q394 -204 363 -157Q334 -114 293 26L284 59Q283 58 248 19T170 -66T92 -151T53 -191Q49 -194 43 -194Q36 -194 31 -189T25 -177T38 -154T151 -30L272 102L265 131Q189 405 135 405Q104 405 87 358Q86 351 68 351Q48 351 48 361Q48 369 56 386T89 423T148 442Q224 442 258 400Q276 375 297 320T330 222L341 180Q344 180 455 303T573 429Q579 431 582 431Q600 431 600 414Q600 407 587 392T477 270Q356 138 353 134L362 102Q392 -10 428 -89T490 -168Q504 -168 517 -156T536 -126Q539 -116 543 -115T557 -114T571 -115Q576 -118 576 -125Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3C7\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\chi',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'psi',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.513ex\" height=\"2.509ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -791.3 651.5 1080.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\psi</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3C8\" d=\"M161 441Q202 441 226 417T250 358Q250 338 218 252T187 127Q190 85 214 61Q235 43 257 37Q275 29 288 29H289L371 360Q455 691 456 692Q459 694 472 694Q492 694 492 687Q492 678 411 356Q329 28 329 27T335 26Q421 26 498 114T576 278Q576 302 568 319T550 343T532 361T524 384Q524 405 541 424T583 443Q602 443 618 425T634 366Q634 337 623 288T605 220Q573 125 492 57T329 -11H319L296 -104Q272 -198 272 -199Q270 -205 252 -205H239Q233 -199 233 -197Q233 -192 256 -102T279 -9Q272 -8 265 -8Q106 14 106 139Q106 174 139 264T173 379Q173 380 173 381Q173 390 173 393T169 400T158 404H154Q131 404 112 385T82 344T65 302T57 280Q55 278 41 278H27Q21 284 21 287Q21 299 34 333T82 404T161 441Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3C8\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\psi',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'omega',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.446ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 622.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\omega</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3C9\" d=\"M495 384Q495 406 514 424T555 443Q574 443 589 425T604 364Q604 334 592 278T555 155T483 38T377 -11Q297 -11 267 66Q266 68 260 61Q201 -11 125 -11Q15 -11 15 139Q15 230 56 325T123 434Q135 441 147 436Q160 429 160 418Q160 406 140 379T94 306T62 208Q61 202 61 187Q61 124 85 100T143 76Q201 76 245 129L253 137V156Q258 297 317 297Q348 297 348 261Q348 243 338 213T318 158L308 135Q309 133 310 129T318 115T334 97T358 83T393 76Q456 76 501 148T546 274Q546 305 533 325T508 357T495 384Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3C9\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\omega',
      	substring: false,
      	pos: 0
      }
    ]
  ]
  // big greek letters
  public greekBig = [
    [
      {
      	name: 'A',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.743ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 750.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">A</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-41\" d=\"M208 74Q208 50 254 46Q272 46 272 35Q272 34 270 22Q267 8 264 4T251 0Q249 0 239 0T205 1T141 2Q70 2 50 0H42Q35 7 35 11Q37 38 48 46H62Q132 49 164 96Q170 102 345 401T523 704Q530 716 547 716H555H572Q578 707 578 706L606 383Q634 60 636 57Q641 46 701 46Q726 46 726 36Q726 34 723 22Q720 7 718 4T704 0Q701 0 690 0T651 1T578 2Q484 2 455 0H443Q437 6 437 9T439 27Q443 40 445 43L449 46H469Q523 49 533 63L521 213H283L249 155Q208 86 208 74ZM516 260Q516 271 504 416T490 562L463 519Q447 492 400 412L310 260L413 259Q516 259 516 260Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-41\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'A',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'B',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.764ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 759.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">B</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-42\" d=\"M231 637Q204 637 199 638T194 649Q194 676 205 682Q206 683 335 683Q594 683 608 681Q671 671 713 636T756 544Q756 480 698 429T565 360L555 357Q619 348 660 311T702 219Q702 146 630 78T453 1Q446 0 242 0Q42 0 39 2Q35 5 35 10Q35 17 37 24Q42 43 47 45Q51 46 62 46H68Q95 46 128 49Q142 52 147 61Q150 65 219 339T288 628Q288 635 231 637ZM649 544Q649 574 634 600T585 634Q578 636 493 637Q473 637 451 637T416 636H403Q388 635 384 626Q382 622 352 506Q352 503 351 500L320 374H401Q482 374 494 376Q554 386 601 434T649 544ZM595 229Q595 273 572 302T512 336Q506 337 429 337Q311 337 310 336Q310 334 293 263T258 122L240 52Q240 48 252 48T333 46Q422 46 429 47Q491 54 543 105T595 229Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-42\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'B',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Gamma',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.453ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 625.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Gamma</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-393\" d=\"M128 619Q121 626 117 628T101 631T58 634H25V680H554V676Q556 670 568 560T582 444V440H542V444Q542 445 538 478T523 545T492 598Q454 634 349 634H334Q264 634 249 633T233 621Q232 618 232 339L233 61Q240 54 245 52T270 48T333 46H360V0H348Q324 3 182 3Q51 3 36 0H25V46H58Q100 47 109 49T128 61V619Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-393\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Gamma',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Delta',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.936ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 833.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Delta</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-394\" d=\"M51 0Q46 4 46 7Q46 9 215 357T388 709Q391 716 416 716Q439 716 444 709Q447 705 616 357T786 7Q786 4 781 0H51ZM507 344L384 596L137 92L383 91H630Q630 93 507 344Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-394\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Delta',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'E',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.776ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 764.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">E</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-45\" d=\"M492 213Q472 213 472 226Q472 230 477 250T482 285Q482 316 461 323T364 330H312Q311 328 277 192T243 52Q243 48 254 48T334 46Q428 46 458 48T518 61Q567 77 599 117T670 248Q680 270 683 272Q690 274 698 274Q718 274 718 261Q613 7 608 2Q605 0 322 0H133Q31 0 31 11Q31 13 34 25Q38 41 42 43T65 46Q92 46 125 49Q139 52 144 61Q146 66 215 342T285 622Q285 629 281 629Q273 632 228 634H197Q191 640 191 642T193 659Q197 676 203 680H757Q764 676 764 669Q764 664 751 557T737 447Q735 440 717 440H705Q698 445 698 453L701 476Q704 500 704 528Q704 558 697 578T678 609T643 625T596 632T532 634H485Q397 633 392 631Q388 629 386 622Q385 619 355 499T324 377Q347 376 372 376H398Q464 376 489 391T534 472Q538 488 540 490T557 493Q562 493 565 493T570 492T572 491T574 487T577 483L544 351Q511 218 508 216Q505 213 492 213Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-45\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'E',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Z',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.68ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 723.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">Z</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-5A\" d=\"M58 8Q58 23 64 35Q64 36 329 334T596 635L586 637Q575 637 512 637H500H476Q442 637 420 635T365 624T311 598T266 548T228 469Q227 466 226 463T224 458T223 453T222 450L221 448Q218 443 202 443Q185 443 182 453L214 561Q228 606 241 651Q249 679 253 681Q256 683 487 683H718Q723 678 723 675Q723 673 717 649Q189 54 188 52L185 49H274Q369 50 377 51Q452 60 500 100T579 247Q587 272 590 277T603 282H607Q628 282 628 271Q547 5 541 2Q538 0 300 0H124Q58 0 58 8Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-5A\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'Z',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'H',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.064ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 888.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">H</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-48\" d=\"M228 637Q194 637 192 641Q191 643 191 649Q191 673 202 682Q204 683 219 683Q260 681 355 681Q389 681 418 681T463 682T483 682Q499 682 499 672Q499 670 497 658Q492 641 487 638H485Q483 638 480 638T473 638T464 637T455 637Q416 636 405 634T387 623Q384 619 355 500Q348 474 340 442T328 395L324 380Q324 378 469 378H614L615 381Q615 384 646 504Q674 619 674 627T617 637Q594 637 587 639T580 648Q580 650 582 660Q586 677 588 679T604 682Q609 682 646 681T740 680Q802 680 835 681T871 682Q888 682 888 672Q888 645 876 638H874Q872 638 869 638T862 638T853 637T844 637Q805 636 794 634T776 623Q773 618 704 340T634 58Q634 51 638 51Q646 48 692 46H723Q729 38 729 37T726 19Q722 6 716 0H701Q664 2 567 2Q533 2 504 2T458 2T437 1Q420 1 420 10Q420 15 423 24Q428 43 433 45Q437 46 448 46H454Q481 46 514 49Q520 50 522 50T528 55T534 64T540 82T547 110T558 153Q565 181 569 198Q602 330 602 331T457 332H312L279 197Q245 63 245 58Q245 51 253 49T303 46H334Q340 38 340 37T337 19Q333 6 327 0H312Q275 2 178 2Q144 2 115 2T69 2T48 1Q31 1 31 10Q31 12 34 24Q39 43 44 45Q48 46 59 46H65Q92 46 125 49Q139 52 144 61Q147 65 216 339T285 628Q285 635 228 637Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-48\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'H',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Theta',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Theta</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-398\" d=\"M56 340Q56 423 86 494T164 610T270 680T388 705Q521 705 621 601T722 341Q722 260 693 191T617 75T510 4T388 -22T267 3T160 74T85 189T56 340ZM610 339Q610 428 590 495T535 598T463 651T384 668Q332 668 289 638T221 566Q168 485 168 339Q168 274 176 235Q189 158 228 105T324 28Q356 16 388 16Q415 16 442 24T501 54T555 111T594 205T610 339ZM223 263V422H263V388H514V422H554V263H514V297H263V263H223Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-398\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Theta',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'I',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.172ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 504.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">I</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-49\" d=\"M43 1Q26 1 26 10Q26 12 29 24Q34 43 39 45Q42 46 54 46H60Q120 46 136 53Q137 53 138 54Q143 56 149 77T198 273Q210 318 216 344Q286 624 286 626Q284 630 284 631Q274 637 213 637H193Q184 643 189 662Q193 677 195 680T209 683H213Q285 681 359 681Q481 681 487 683H497Q504 676 504 672T501 655T494 639Q491 637 471 637Q440 637 407 634Q393 631 388 623Q381 609 337 432Q326 385 315 341Q245 65 245 59Q245 52 255 50T307 46H339Q345 38 345 37T342 19Q338 6 332 0H316Q279 2 179 2Q143 2 113 2T65 2T43 1Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-49\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'I',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'K',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.066ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 889.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">K</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-4B\" d=\"M285 628Q285 635 228 637Q205 637 198 638T191 647Q191 649 193 661Q199 681 203 682Q205 683 214 683H219Q260 681 355 681Q389 681 418 681T463 682T483 682Q500 682 500 674Q500 669 497 660Q496 658 496 654T495 648T493 644T490 641T486 639T479 638T470 637T456 637Q416 636 405 634T387 623L306 305Q307 305 490 449T678 597Q692 611 692 620Q692 635 667 637Q651 637 651 648Q651 650 654 662T659 677Q662 682 676 682Q680 682 711 681T791 680Q814 680 839 681T869 682Q889 682 889 672Q889 650 881 642Q878 637 862 637Q787 632 726 586Q710 576 656 534T556 455L509 418L518 396Q527 374 546 329T581 244Q656 67 661 61Q663 59 666 57Q680 47 717 46H738Q744 38 744 37T741 19Q737 6 731 0H720Q680 3 625 3Q503 3 488 0H478Q472 6 472 9T474 27Q478 40 480 43T491 46H494Q544 46 544 71Q544 75 517 141T485 216L427 354L359 301L291 248L268 155Q245 63 245 58Q245 51 253 49T303 46H334Q340 37 340 35Q340 19 333 5Q328 0 317 0Q314 0 280 1T180 2Q118 2 85 2T49 1Q31 1 31 11Q31 13 34 25Q38 41 42 43T65 46Q92 46 125 49Q139 52 144 61Q147 65 216 339T285 628Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-4B\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'K',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Lambda',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.613ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 694.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Lambda</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-39B\" d=\"M320 708Q326 716 340 716H348H355Q367 716 372 708Q374 706 423 547T523 226T575 62Q581 52 591 50T634 46H661V0H653Q644 3 532 3Q411 3 390 0H379V46H392Q464 46 464 65Q463 70 390 305T316 539L246 316Q177 95 177 84Q177 72 198 59T248 46H253V0H245Q230 3 130 3Q47 3 38 0H32V46H45Q112 51 127 91Q128 92 224 399T320 708Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-39B\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Lambda',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'M',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.442ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 1051.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">M</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-4D\" d=\"M289 629Q289 635 232 637Q208 637 201 638T194 648Q194 649 196 659Q197 662 198 666T199 671T201 676T203 679T207 681T212 683T220 683T232 684Q238 684 262 684T307 683Q386 683 398 683T414 678Q415 674 451 396L487 117L510 154Q534 190 574 254T662 394Q837 673 839 675Q840 676 842 678T846 681L852 683H948Q965 683 988 683T1017 684Q1051 684 1051 673Q1051 668 1048 656T1045 643Q1041 637 1008 637Q968 636 957 634T939 623Q936 618 867 340T797 59Q797 55 798 54T805 50T822 48T855 46H886Q892 37 892 35Q892 19 885 5Q880 0 869 0Q864 0 828 1T736 2Q675 2 644 2T609 1Q592 1 592 11Q592 13 594 25Q598 41 602 43T625 46Q652 46 685 49Q699 52 704 61Q706 65 742 207T813 490T848 631L654 322Q458 10 453 5Q451 4 449 3Q444 0 433 0Q418 0 415 7Q413 11 374 317L335 624L267 354Q200 88 200 79Q206 46 272 46H282Q288 41 289 37T286 19Q282 3 278 1Q274 0 267 0Q265 0 255 0T221 1T157 2Q127 2 95 1T58 0Q43 0 39 2T35 11Q35 13 38 25T43 40Q45 46 65 46Q135 46 154 86Q158 92 223 354T289 629Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-4D\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'M',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'N',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.064ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 888.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">N</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-4E\" d=\"M234 637Q231 637 226 637Q201 637 196 638T191 649Q191 676 202 682Q204 683 299 683Q376 683 387 683T401 677Q612 181 616 168L670 381Q723 592 723 606Q723 633 659 637Q635 637 635 648Q635 650 637 660Q641 676 643 679T653 683Q656 683 684 682T767 680Q817 680 843 681T873 682Q888 682 888 672Q888 650 880 642Q878 637 858 637Q787 633 769 597L620 7Q618 0 599 0Q585 0 582 2Q579 5 453 305L326 604L261 344Q196 88 196 79Q201 46 268 46H278Q284 41 284 38T282 19Q278 6 272 0H259Q228 2 151 2Q123 2 100 2T63 2T46 1Q31 1 31 10Q31 14 34 26T39 40Q41 46 62 46Q130 49 150 85Q154 91 221 362L289 634Q287 635 234 637Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-4E\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'N',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Xi',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.55ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 667.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Xi</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-39E\" d=\"M47 509L55 676Q55 677 333 677T611 676L619 509Q619 508 599 508T579 510Q579 529 575 557T564 589Q550 594 333 594T102 589Q95 586 91 558T87 510Q87 508 67 508T47 509ZM139 260V445H179V394H487V445H527V260H487V311H179V260H139ZM50 0L42 180H62Q82 180 82 178Q82 133 89 105Q92 93 95 90T108 86Q137 83 333 83Q530 83 558 86Q568 87 571 90T577 105Q584 133 584 178Q584 180 604 180H624L616 0H50Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-39E\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Xi',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'O',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.773ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 763.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">O</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-4F\" d=\"M740 435Q740 320 676 213T511 42T304 -22Q207 -22 138 35T51 201Q50 209 50 244Q50 346 98 438T227 601Q351 704 476 704Q514 704 524 703Q621 689 680 617T740 435ZM637 476Q637 565 591 615T476 665Q396 665 322 605Q242 542 200 428T157 216Q157 126 200 73T314 19Q404 19 485 98T608 313Q637 408 637 476Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-4F\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'O',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Pi',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.743ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 750.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Pi</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-3A0\" d=\"M128 619Q121 626 117 628T101 631T58 634H25V680H724V634H691Q651 633 640 631T622 619V61Q628 51 639 49T691 46H724V0H713Q692 3 569 3Q434 3 425 0H414V46H447Q489 47 498 49T517 61V634H232V348L233 61Q239 51 250 49T302 46H335V0H324Q303 3 180 3Q45 3 36 0H25V46H58Q100 47 109 49T128 61V619Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-3A0\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Pi',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'P',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.745ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 751.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">P</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-50\" d=\"M287 628Q287 635 230 637Q206 637 199 638T192 648Q192 649 194 659Q200 679 203 681T397 683Q587 682 600 680Q664 669 707 631T751 530Q751 453 685 389Q616 321 507 303Q500 302 402 301H307L277 182Q247 66 247 59Q247 55 248 54T255 50T272 48T305 46H336Q342 37 342 35Q342 19 335 5Q330 0 319 0Q316 0 282 1T182 2Q120 2 87 2T51 1Q33 1 33 11Q33 13 36 25Q40 41 44 43T67 46Q94 46 127 49Q141 52 146 61Q149 65 218 339T287 628ZM645 554Q645 567 643 575T634 597T609 619T560 635Q553 636 480 637Q463 637 445 637T416 636T404 636Q391 635 386 627Q384 621 367 550T332 412T314 344Q314 342 395 342H407H430Q542 342 590 392Q617 419 631 471T645 554Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-50\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'P',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Sigma',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.678ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 722.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Sigma</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-3A3\" d=\"M666 247Q664 244 652 126T638 4V0H351Q131 0 95 0T57 5V6Q54 12 57 17L73 36Q89 54 121 90T182 159L305 299L56 644L55 658Q55 677 60 681Q63 683 351 683H638V679Q640 674 652 564T666 447V443H626V447Q618 505 604 543T559 605Q529 626 478 631T333 637H294H189L293 494Q314 465 345 422Q400 346 400 340Q400 338 399 337L154 57Q407 57 428 58Q476 60 508 68T551 83T575 103Q595 125 608 162T624 225L626 251H666V247Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-3A3\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Sigma',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'T',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.636ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 704.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">T</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-54\" d=\"M40 437Q21 437 21 445Q21 450 37 501T71 602L88 651Q93 669 101 677H569H659Q691 677 697 676T704 667Q704 661 687 553T668 444Q668 437 649 437Q640 437 637 437T631 442L629 445Q629 451 635 490T641 551Q641 586 628 604T573 629Q568 630 515 631Q469 631 457 630T439 622Q438 621 368 343T298 60Q298 48 386 46Q418 46 427 45T436 36Q436 31 433 22Q429 4 424 1L422 0Q419 0 415 0Q410 0 363 1T228 2Q99 2 64 0H49Q43 6 43 9T45 27Q49 40 55 46H83H94Q174 46 189 55Q190 56 191 56Q196 59 201 76T241 233Q258 301 269 344Q339 619 339 625Q339 630 310 630H279Q212 630 191 624Q146 614 121 583T67 467Q60 445 57 441T43 437H40Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-54\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'T',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Upsilon',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Upsilon</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-3A5\" d=\"M55 551Q55 604 91 654T194 705Q240 705 277 681T334 624T367 556T385 498L389 474L392 488Q394 501 400 521T414 566T438 615T473 659T521 692T584 705Q620 705 648 689T691 647T714 597T722 551Q722 540 719 538T699 536Q680 536 677 541Q677 542 677 544T676 548Q676 576 650 596T588 616H582Q538 616 505 582Q466 543 454 477T441 318Q441 301 441 269T442 222V61Q448 55 452 53T478 48T542 46H569V0H557Q533 3 389 3T221 0H209V46H236Q256 46 270 46T295 47T311 48T322 51T328 54T332 57T337 61V209Q337 383 333 415Q313 616 189 616Q154 616 128 597T101 548Q101 540 97 538T78 536Q63 536 59 538T55 551Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-3A5\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Upsilon',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'X',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.98ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 852.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">X</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-58\" d=\"M42 0H40Q26 0 26 11Q26 15 29 27Q33 41 36 43T55 46Q141 49 190 98Q200 108 306 224T411 342Q302 620 297 625Q288 636 234 637H206Q200 643 200 645T202 664Q206 677 212 683H226Q260 681 347 681Q380 681 408 681T453 682T473 682Q490 682 490 671Q490 670 488 658Q484 643 481 640T465 637Q434 634 411 620L488 426L541 485Q646 598 646 610Q646 628 622 635Q617 635 609 637Q594 637 594 648Q594 650 596 664Q600 677 606 683H618Q619 683 643 683T697 681T738 680Q828 680 837 683H845Q852 676 852 672Q850 647 840 637H824Q790 636 763 628T722 611T698 593L687 584Q687 585 592 480L505 384Q505 383 536 304T601 142T638 56Q648 47 699 46Q734 46 734 37Q734 35 732 23Q728 7 725 4T711 1Q708 1 678 1T589 2Q528 2 496 2T461 1Q444 1 444 10Q444 11 446 25Q448 35 450 39T455 44T464 46T480 47T506 54Q523 62 523 64Q522 64 476 181L429 299Q241 95 236 84Q232 76 232 72Q232 53 261 47Q262 47 267 47T273 46Q276 46 277 46T280 45T283 42T284 35Q284 26 282 19Q279 6 276 4T261 1Q258 1 243 1T201 2T142 2Q64 2 42 0Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-58\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: 'X',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Psi',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Psi</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-3A8\" d=\"M340 622Q338 623 335 625T331 629T325 631T314 634T298 635T274 636T239 637H212V683H224Q248 680 389 680T554 683H566V637H539Q479 637 464 635T439 622L438 407Q438 192 439 192Q443 193 449 195T474 207T507 232T536 276T557 344Q560 365 562 417T573 493Q587 536 620 544Q627 546 671 546H715L722 540V515Q714 509 708 509Q680 505 671 476T658 392T644 307Q599 177 451 153L438 151V106L439 61Q446 54 451 52T476 48T539 46H566V0H554Q530 3 389 3T224 0H212V46H239Q259 46 273 46T298 47T314 48T325 51T331 54T335 57T340 61V151Q126 178 117 406Q115 503 69 509Q55 509 55 526Q55 541 59 543T86 546H107H120Q150 546 161 543T184 528Q198 514 204 493Q212 472 213 420T226 316T272 230Q287 216 303 207T330 194L339 192Q340 192 340 407V622Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-3A8\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Psi',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Omega',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.678ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 722.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Omega</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-3A9\" d=\"M55 454Q55 503 75 546T127 617T197 665T272 695T337 704H352Q396 704 404 703Q527 687 596 615T666 454Q666 392 635 330T559 200T499 83V80H543Q589 81 600 83T617 93Q622 102 629 135T636 172L637 177H677V175L660 89Q645 3 644 2V0H552H488Q461 0 456 3T451 20Q451 89 499 235T548 455Q548 512 530 555T483 622T424 656T361 668Q332 668 303 658T243 626T193 560T174 456Q174 380 222 233T270 20Q270 7 263 0H77V2Q76 3 61 89L44 175V177H84L85 172Q85 171 88 155T96 119T104 93Q109 86 120 84T178 80H222V83Q206 132 162 199T87 329T55 454Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-3A9\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Omega',
      	substring: false,
      	pos: 0
      }
    ]
  ]
  // var greek letters
  public greekVar = [
    [
      {
      	name: 'varepsilon',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.083ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 466.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\varepsilon</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3B5\" d=\"M190 -22Q124 -22 76 11T27 107Q27 174 97 232L107 239L99 248Q76 273 76 304Q76 364 144 408T290 452H302Q360 452 405 421Q428 405 428 392Q428 381 417 369T391 356Q382 356 371 365T338 383T283 392Q217 392 167 368T116 308Q116 289 133 272Q142 263 145 262T157 264Q188 278 238 278H243Q308 278 308 247Q308 206 223 206Q177 206 142 219L132 212Q68 169 68 112Q68 39 201 39Q253 39 286 49T328 72T345 94T362 105Q376 103 376 88Q376 79 365 62T334 26T275 -8T190 -22Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3B5\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
      	string: '\\varepsilon',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'vartheta',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.374ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 591.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\vartheta</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3D1\" d=\"M537 500Q537 474 533 439T524 383L521 362Q558 355 561 351Q563 349 563 345Q563 321 552 318Q542 318 521 323L510 326Q496 261 459 187T362 51T241 -11Q100 -11 100 105Q100 139 127 242T154 366Q154 405 128 405Q107 405 92 377T68 316T57 280Q55 278 41 278H27Q21 284 21 287Q21 291 27 313T47 368T79 418Q103 442 134 442Q169 442 201 419T233 344Q232 330 206 228T180 98Q180 26 247 26Q292 26 332 90T404 260L427 349Q422 349 398 359T339 392T289 440Q265 476 265 520Q265 590 312 647T417 705Q463 705 491 670T528 592T537 500ZM464 564Q464 668 413 668Q373 668 339 622T304 522Q304 494 317 470T349 431T388 406T421 391T435 387H436L443 415Q450 443 457 485T464 564Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3D1\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
      	string: '\\vartheta',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'varrho',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.202ex\" height=\"2.009ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -576.1 517.5 865.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\varrho</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3F1\" d=\"M205 -174Q136 -174 102 -153T67 -76Q67 -25 91 85T127 234Q143 289 182 341Q252 427 341 441Q343 441 349 441T359 442Q432 442 471 394T510 276Q510 169 431 80T253 -10Q226 -10 204 -2T169 19T146 44T132 64L128 73Q128 72 124 53T116 5T112 -44Q112 -68 117 -78T150 -95T236 -102Q327 -102 356 -111T386 -154Q386 -166 384 -178Q381 -190 378 -192T361 -194H348Q342 -188 342 -179Q342 -169 315 -169Q294 -169 264 -171T205 -174ZM424 322Q424 359 407 382T357 405Q322 405 287 376T231 300Q221 276 204 217Q188 152 188 116Q188 68 210 47T259 26Q297 26 334 62Q367 92 389 158T418 266T424 322Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3F1\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
      	string: '\\varrho',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'varphi',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.52ex\" height=\"2.176ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -576.1 654.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\varphi</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-3C6\" d=\"M92 210Q92 176 106 149T142 108T185 85T220 72L235 70L237 71L250 112Q268 170 283 211T322 299T370 375T429 423T502 442Q547 442 582 410T618 302Q618 224 575 152T457 35T299 -10Q273 -10 273 -12L266 -48Q260 -83 252 -125T241 -179Q236 -203 215 -212Q204 -218 190 -218Q159 -215 159 -185Q159 -175 214 -2L209 0Q204 2 195 5T173 14T147 28T120 46T94 71T71 103T56 142T50 190Q50 238 76 311T149 431H162Q183 431 183 423Q183 417 175 409Q134 361 114 300T92 210ZM574 278Q574 320 550 344T486 369Q437 369 394 329T323 218Q309 184 295 109L286 64Q304 62 306 62Q423 62 498 131T574 278Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-3C6\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
      	string: '\\varphi',
      	substring: false,
      	pos: 0
      }
    ]
  ]
  // column 1
  public column1 = [
    [
      {
        name: 'fraction',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.066ex\" height=\"4.843ex\" style=\"vertical-align: -2.005ex;\" viewBox=\"0 -1221.9 889.5 2085\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\frac{a}{b}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n<g transform=\"translate(120,0)\">\n<rect stroke=\"none\" width=\"649\" height=\"60\" x=\"0\" y=\"220\"></rect>\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"60\" y=\"676\"></use>\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"110\" y=\"-715\"></use>\n</g>\n</g>\n</svg>',
        string: '\\frac{  }{  }',
        substring: true,
        pos: 6
      },
      {
        name: 'exponent',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.167ex\" height=\"2.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -1006.6 933.2 1152.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">a^{b}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-62\" x=\"748\" y=\"583\"></use>\n</g>\n</svg>',
        string: '^{  }',
        substring: true,
        pos: 3
      },
      {
        name: 'index',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.167ex\" height=\"2.009ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -576.1 933.2 865.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">a_{b}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-62\" x=\"748\" y=\"-213\"></use>\n</g>\n</svg>',
        string: '_{  }',
        substring: true,
        pos: 3
      },
      {
        name: 'root',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"3.166ex\" height=\"3.176ex\" style=\"vertical-align: -1.005ex;\" viewBox=\"0 -934.9 1363 1367.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\sqrt[b]{a}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-221A\" d=\"M95 178Q89 178 81 186T72 200T103 230T169 280T207 309Q209 311 212 311H213Q219 311 227 294T281 177Q300 134 312 108L397 -77Q398 -77 501 136T707 565T814 786Q820 800 834 800Q841 800 846 794T853 782V776L620 293L385 -193Q381 -200 366 -200Q357 -200 354 -197Q352 -195 256 15L160 225L144 214Q129 202 113 190T95 178Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use transform=\"scale(0.574)\" xlink:href=\"#E1-MJMATHI-62\" x=\"521\" y=\"586\"></use>\n <use xlink:href=\"#E1-MJMAIN-221A\" x=\"0\" y=\"-109\"></use>\n<rect stroke=\"none\" width=\"529\" height=\"60\" x=\"833\" y=\"632\"></rect>\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"833\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\sqrt[]{}',
        substring: true,
        pos: 8
      }
    ],
    [
      {
      	name: 'vec{a}',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.23ex\" height=\"2.343ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -863.1 529.5 1008.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\vec{a}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-20D7\" d=\"M-123 694Q-123 702 -118 708T-103 714Q-93 714 -88 706T-80 687T-67 660T-40 633Q-29 626 -29 615Q-29 606 -36 600T-53 590T-83 571T-121 531Q-135 516 -143 516T-157 522T-163 536T-152 559T-129 584T-116 595H-287L-458 596Q-459 597 -461 599T-466 602T-469 607T-471 615Q-471 622 -458 635H-99Q-123 673 -123 694Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-20D7\" x=\"499\" y=\"34\"></use>\n</g>\n</svg>',
      	string: '\\vec{}',
      	substring: true,
      	pos: 5
      },
      {
      	name: 'hat{a}',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.23ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 529.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\hat{a}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-5E\" d=\"M112 560L249 694L257 686Q387 562 387 560L361 531Q359 532 303 581L250 627L195 580Q182 569 169 557T148 538L140 532Q138 530 125 546L112 560Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-5E\" x=\"14\" y=\"19\"></use>\n</g>\n</svg>',
      	string: '\\hat{}',
      	substring: true,
      	pos: 5
      },
      {
      	name: 'bar{a}',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.23ex\" height=\"2.009ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -719.6 529.5 865.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\bar{a}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-AF\" d=\"M69 544V590H430V544H69Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-AF\" x=\"14\" y=\"6\"></use>\n</g>\n</svg>',
      	string: '\\bar{a}',
      	substring: true,
      	pos: 5
      },
      {
      	name: 'tilde{a}',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.23ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 529.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\tilde{a}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-7E\" d=\"M179 251Q164 251 151 245T131 234T111 215L97 227L83 238Q83 239 95 253T121 283T142 304Q165 318 187 318T253 300T320 282Q335 282 348 288T368 299T388 318L402 306L416 295Q375 236 344 222Q330 215 313 215Q292 215 248 233T179 251Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-7E\" x=\"14\" y=\"335\"></use>\n</g>\n</svg>',
      	string: '\\tilde{a}',
      	substring: true,
      	pos: 7
      }
    ],
    [
      {
      	name: 'dot{a}',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.23ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 529.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\dot{a}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2D9\" d=\"M190 609Q190 637 208 653T252 669Q275 667 292 652T309 609Q309 579 292 564T250 549Q225 549 208 564T190 609Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-2D9\" x=\"14\" y=\"1\"></use>\n</g>\n</svg>',
      	string: '\\dot{a}',
      	substring: true,
      	pos: 5
      },
      {
      	name: 'ddot{a}',
      	svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.23ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 529.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\ddot{a}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-A8\" d=\"M95 612Q95 633 112 651T153 669T193 652T210 612Q210 588 194 571T152 554L127 560Q95 577 95 612ZM289 611Q289 634 304 649T335 668Q336 668 340 668T346 669Q369 669 386 652T404 612T387 572T346 554Q323 554 306 570T289 611Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-A8\" x=\"14\" y=\"-4\"></use>\n</g>\n</svg>',
      	string: '\\ddot{a}',
      	substring: true,
      	pos: 6
      },
      {
      	name: 'bra',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"0.905ex\" height=\"2.843ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -863.1 389.5 1223.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\langle</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-27E8\" d=\"M333 -232Q332 -239 327 -244T313 -250Q303 -250 296 -240Q293 -233 202 6T110 250T201 494T296 740Q299 745 306 749L309 750Q312 750 313 750Q331 750 333 732Q333 727 243 489Q152 252 152 250T243 11Q333 -227 333 -232Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-27E8\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\langle',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'ket',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"0.905ex\" height=\"2.843ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -863.1 389.5 1223.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\rangle</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-27E9\" d=\"M55 732Q56 739 61 744T75 750Q85 750 92 740Q95 733 186 494T278 250T187 6T92 -240Q85 -250 75 -250Q67 -250 62 -245T55 -232Q55 -227 145 11Q236 248 236 250T145 489Q55 727 55 732Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-27E9\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\rangle',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
        name: 'parentasisround',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"3.039ex\" height=\"2.843ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -863.1 1308.5 1223.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\left( a \\right)</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-28\" d=\"M94 250Q94 319 104 381T127 488T164 576T202 643T244 695T277 729T302 750H315H319Q333 750 333 741Q333 738 316 720T275 667T226 581T184 443T167 250T184 58T225 -81T274 -167T316 -220T333 -241Q333 -250 318 -250H315H302L274 -226Q180 -141 137 -14T94 250Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-29\" d=\"M60 749L64 750Q69 750 74 750H86L114 726Q208 641 251 514T294 250Q294 182 284 119T261 12T224 -76T186 -143T145 -194T113 -227T90 -246Q87 -249 86 -250H74Q66 -250 63 -250T58 -247T55 -238Q56 -237 66 -225Q221 -64 221 250T66 725Q56 737 55 738Q55 746 60 749Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-28\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"389\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-29\" x=\"919\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\left(  \\right)',
        substring: true,
        pos: 6
      },
      {
        name: 'parentasisline',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.523ex\" height=\"2.843ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -863.1 1086.5 1223.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\left\\lvert a \\right\\rvert</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-7C\" d=\"M139 -249H137Q125 -249 119 -235V251L120 737Q130 750 139 750Q152 750 159 735V-235Q151 -249 141 -249H139Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-7C\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"278\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-7C\" x=\"808\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\left\\lvert  \\right\\rvert',
        substring: true,
        pos: 11
      },
      {
        name: 'parentasiscurved',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"3.555ex\" height=\"2.843ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -863.1 1530.5 1223.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\left\\{ a \\right\\}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-7B\" d=\"M434 -231Q434 -244 428 -250H410Q281 -250 230 -184Q225 -177 222 -172T217 -161T213 -148T211 -133T210 -111T209 -84T209 -47T209 0Q209 21 209 53Q208 142 204 153Q203 154 203 155Q189 191 153 211T82 231Q71 231 68 234T65 250T68 266T82 269Q116 269 152 289T203 345Q208 356 208 377T209 529V579Q209 634 215 656T244 698Q270 724 324 740Q361 748 377 749Q379 749 390 749T408 750H428Q434 744 434 732Q434 719 431 716Q429 713 415 713Q362 710 332 689T296 647Q291 634 291 499V417Q291 370 288 353T271 314Q240 271 184 255L170 250L184 245Q202 239 220 230T262 196T290 137Q291 131 291 1Q291 -134 296 -147Q306 -174 339 -192T415 -213Q429 -213 431 -216Q434 -219 434 -231Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-7D\" d=\"M65 731Q65 745 68 747T88 750Q171 750 216 725T279 670Q288 649 289 635T291 501Q292 362 293 357Q306 312 345 291T417 269Q428 269 431 266T434 250T431 234T417 231Q380 231 345 210T298 157Q293 143 292 121T291 -28V-79Q291 -134 285 -156T256 -198Q202 -250 89 -250Q71 -250 68 -247T65 -230Q65 -224 65 -223T66 -218T69 -214T77 -213Q91 -213 108 -210T146 -200T183 -177T207 -139Q208 -134 209 3L210 139Q223 196 280 230Q315 247 330 250Q305 257 280 270Q225 304 212 352L210 362L209 498Q208 635 207 640Q195 680 154 696T77 713Q68 713 67 716T65 731Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-7B\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"500\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-7D\" x=\"1030\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\left\\{  \\right\\}',
        substring: true,
        pos: 7
      },
      {
        name: 'parentasisedge',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.523ex\" height=\"2.843ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -863.1 1086.5 1223.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\left[ a \\right]</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-5B\" d=\"M118 -250V750H255V710H158V-210H255V-250H118Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-5D\" d=\"M22 710V750H159V-250H22V-210H119V710H22Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-5B\" x=\"0\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"278\" y=\"0\"></use>\n <use xlink:href=\"#E1-MJMAIN-5D\" x=\"808\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\left[  \\right]',
        substring: true,
        pos: 6
      }
    ]
  ];
  // column 2
  public column2 = [
    [
      {
      	name: 'leftarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 1000.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\leftarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2190\" d=\"M944 261T944 250T929 230H165Q167 228 182 216T211 189T244 152T277 96T303 25Q308 7 308 0Q308 -11 288 -11Q281 -11 278 -11T272 -7T267 2T263 21Q245 94 195 151T73 236Q58 242 55 247Q55 254 59 257T73 264Q121 283 158 314T215 375T247 434T264 480L267 497Q269 503 270 505T275 509T288 511Q308 511 308 500Q308 493 303 475Q293 438 278 406T246 352T215 315T185 287T165 270H929Q944 261 944 250Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2190\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\leftarrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'rightarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 1000.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\rightarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2192\" d=\"M56 237T56 250T70 270H835Q719 357 692 493Q692 494 692 496T691 499Q691 511 708 511H711Q720 511 723 510T729 506T732 497T735 481T743 456Q765 389 816 336T935 261Q944 258 944 250Q944 244 939 241T915 231T877 212Q836 186 806 152T761 85T740 35T732 4Q730 -6 727 -8T711 -11Q691 -11 691 0Q691 7 696 25Q728 151 835 230H70Q56 237 56 250Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2192\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\rightarrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'uparrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.162ex\" height=\"2.509ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -791.3 500.5 1080.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\uparrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2191\" d=\"M27 414Q17 414 17 433Q17 437 17 439T17 444T19 447T20 450T22 452T26 453T30 454T36 456Q80 467 120 494T180 549Q227 607 238 678Q240 694 251 694Q259 694 261 684Q261 677 265 659T284 608T320 549Q340 525 363 507T405 479T440 463T467 455T479 451Q483 447 483 433Q483 413 472 413Q467 413 458 416Q342 448 277 545L270 555V-179Q262 -193 252 -193H250H248Q236 -193 230 -179V555L223 545Q192 499 146 467T70 424T27 414Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2191\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\uparrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'downarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.162ex\" height=\"2.509ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -791.3 500.5 1080.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\downarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2193\" d=\"M473 86Q483 86 483 67Q483 63 483 61T483 56T481 53T480 50T478 48T474 47T470 46T464 44Q428 35 391 14T316 -55T264 -168Q264 -170 263 -173T262 -180T261 -184Q259 -194 251 -194Q242 -194 238 -176T221 -121T180 -49Q169 -34 155 -21T125 2T95 20T67 33T44 42T27 47L21 49Q17 53 17 67Q17 87 28 87Q33 87 42 84Q158 52 223 -45L230 -55V312Q230 391 230 482T229 591Q229 662 231 676T243 693Q244 694 251 694Q264 692 270 679V-55L277 -45Q307 1 353 33T430 76T473 86Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2193\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\downarrow',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'Leftarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 1000.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Leftarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-21D0\" d=\"M944 153Q944 140 929 133H318L328 123Q379 69 414 0Q419 -13 419 -17Q419 -24 399 -24Q388 -24 385 -23T377 -12Q332 77 253 144T72 237Q62 240 59 242T56 250T59 257T70 262T89 268T119 278T160 296Q303 366 377 512Q382 522 385 523T401 525Q419 524 419 515Q419 510 414 500Q379 431 328 377L318 367H929Q944 359 944 347Q944 336 930 328L602 327H274L264 319Q225 289 147 250Q148 249 165 241T210 217T264 181L274 173H930Q931 172 933 171T936 169T938 167T941 164T942 162T943 158T944 153Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-21D0\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Leftarrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Rightarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 1000.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Rightarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-21D2\" d=\"M580 514Q580 525 596 525Q601 525 604 525T609 525T613 524T615 523T617 520T619 517T622 512Q659 438 720 381T831 300T927 263Q944 258 944 250T935 239T898 228T840 204Q696 134 622 -12Q618 -21 615 -22T600 -24Q580 -24 580 -17Q580 -13 585 0Q620 69 671 123L681 133H70Q56 140 56 153Q56 168 72 173H725L735 181Q774 211 852 250Q851 251 834 259T789 283T735 319L725 327H72Q56 332 56 347Q56 360 70 367H681L671 377Q638 412 609 458T580 514Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-21D2\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Rightarrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Uparrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.42ex\" height=\"2.509ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -791.3 611.5 1080.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Uparrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-21D1\" d=\"M228 -179Q227 -180 226 -182T223 -186T221 -189T218 -192T214 -193T208 -194Q196 -194 189 -181L188 125V430L176 419Q122 369 59 338Q46 330 40 330Q38 330 31 337V350Q31 362 33 365T46 374Q60 381 77 390T128 426T190 484T247 567T292 677Q295 688 298 692Q302 694 305 694Q313 694 318 677Q334 619 363 568T420 485T481 427T532 391T564 374Q575 368 577 365T579 350V337Q572 330 570 330Q564 330 551 338Q487 370 435 419L423 430L422 125V-181Q409 -194 401 -194Q397 -194 394 -193T388 -189T385 -184T382 -180V-177V475L373 487Q331 541 305 602Q304 601 300 591T290 571T278 548T260 519T238 488L229 476L228 148V-179Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-21D1\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Uparrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Downarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.42ex\" height=\"2.509ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -791.3 611.5 1080.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Downarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-21D3\" d=\"M401 694Q412 694 422 681V375L423 70L435 81Q487 130 551 162Q564 170 570 170Q572 170 579 163V150Q579 138 577 135T564 126Q541 114 518 99T453 48T374 -46T318 -177Q313 -194 305 -194T293 -178T272 -119T225 -31Q158 70 46 126Q35 132 33 135T31 150V163Q38 170 40 170Q46 170 59 162Q122 131 176 81L188 70V375L189 681Q199 694 208 694Q219 694 228 680V352L229 25L238 12Q279 -42 305 -102Q344 -23 373 13L382 25V678Q387 692 401 694Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-21D3\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Downarrow',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'nearrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"2.676ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -863.1 1000.5 1152.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\nearrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2197\" d=\"M582 697Q582 701 591 710T605 720Q607 720 630 706T697 677T795 662Q830 662 863 670T914 686T934 694Q942 694 944 685Q944 680 936 663T921 615T913 545Q913 490 927 446T956 379T970 355Q970 351 961 342T947 332Q940 332 929 349Q874 436 874 541Q874 590 878 598L832 553Q787 508 673 395T482 204Q87 -191 83 -193Q77 -195 75 -195Q67 -195 61 -189T55 -174Q55 -170 56 -168Q58 -164 453 232Q707 487 777 557T847 628Q824 623 787 623Q689 623 599 679Q582 690 582 697Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2197\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\nearrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'searrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"2.676ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -791.3 1000.5 1152.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\searrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2198\" d=\"M55 675Q55 683 60 689T75 695Q77 695 83 693Q87 691 482 296Q532 246 605 174T717 62T799 -20T859 -80T878 -97Q874 -93 874 -41Q874 64 929 151Q940 168 947 168Q951 168 960 159T970 145Q970 143 956 121T928 54T913 -45Q913 -83 920 -114T936 -163T944 -185Q942 -194 934 -194Q932 -194 914 -186T864 -170T795 -162Q743 -162 698 -176T630 -205T605 -220Q601 -220 592 -211T582 -197Q582 -187 611 -170T691 -138T787 -123Q824 -123 847 -128Q848 -128 778 -57T453 268Q58 664 56 668Q55 670 55 675Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2198\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\searrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'nwarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"2.676ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -863.1 1000.5 1152.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\nwarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2196\" d=\"M204 662Q257 662 301 676T369 705T394 720Q398 720 407 711T417 697Q417 688 389 671T310 639T212 623Q176 623 153 628Q151 628 221 557T546 232Q942 -164 943 -168Q944 -170 944 -174Q944 -182 938 -188T924 -195Q922 -195 916 -193Q912 -191 517 204Q440 281 326 394T166 553L121 598Q126 589 126 541Q126 438 70 349Q59 332 52 332Q48 332 39 341T29 355Q29 358 38 372T57 407T77 464T86 545Q86 583 78 614T63 663T55 683Q55 693 65 693Q73 693 82 688Q136 662 204 662Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2196\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\nwarrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'swarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"2.676ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -791.3 1000.5 1152.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\swarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2199\" d=\"M126 -41Q126 -92 121 -97Q121 -98 139 -80T200 -20T281 61T394 173T517 296Q909 690 916 693Q922 695 924 695Q932 695 938 689T944 674Q944 670 943 668Q942 664 546 268Q292 13 222 -57T153 -128Q176 -123 212 -123Q310 -123 400 -179Q417 -190 417 -197Q417 -201 408 -210T394 -220Q392 -220 369 -206T302 -177T204 -162Q131 -162 67 -194Q63 -195 59 -192T55 -183Q55 -180 62 -163T78 -115T86 -45Q86 10 72 54T44 120T29 145Q29 149 38 158T52 168Q59 168 70 151Q126 62 126 -41Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2199\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\swarrow',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'updownarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.162ex\" height=\"2.843ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -863.1 500.5 1223.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\updownarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2195\" d=\"M27 492Q17 492 17 511Q17 515 17 517T17 522T19 525T20 528T22 530T26 531T30 532T36 534Q80 545 120 572T180 627Q210 664 223 701T238 755T250 772T261 762Q261 757 264 741T282 691T319 628Q352 589 390 566T454 536L479 529Q483 525 483 511Q483 491 472 491Q467 491 458 494Q342 526 277 623L270 633V-133L277 -123Q307 -77 353 -45T430 -2T473 8Q483 8 483 -11Q483 -15 483 -17T483 -22T481 -25T480 -28T478 -30T474 -31T470 -32T464 -34Q407 -49 364 -84T300 -157T270 -223T261 -262Q259 -272 250 -272Q242 -272 239 -255T223 -201T180 -127Q169 -112 155 -99T125 -76T95 -58T67 -45T44 -36T27 -31L21 -29Q17 -25 17 -11Q17 9 28 9Q33 9 42 6Q158 -26 223 -123L230 -133V633L223 623Q192 577 146 545T70 502T27 492Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2195\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\updownarrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Updownarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.42ex\" height=\"2.843ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -863.1 611.5 1223.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Updownarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-21D5\" d=\"M290 755Q298 772 305 772T318 757T343 706T393 633Q431 588 473 558T545 515T579 497V484Q579 464 570 464Q564 464 550 470Q485 497 423 550L422 400V100L423 -50Q485 3 550 30Q565 36 570 36Q579 36 579 16V3Q575 -1 549 -12T480 -53T393 -132Q361 -172 342 -208T318 -258T305 -272T293 -258T268 -208T217 -132Q170 -80 128 -51T61 -12T31 3V16Q31 36 40 36Q46 36 61 30Q86 19 109 6T146 -18T173 -38T188 -50V550Q186 549 173 539T147 519T110 495T61 470Q46 464 40 464Q31 464 31 484V497Q34 500 63 513T135 557T217 633Q267 692 290 755ZM374 598Q363 610 351 625T332 651T316 676T305 695L294 676Q282 657 267 636T236 598L228 589V-89L236 -98Q247 -110 259 -125T278 -151T294 -176T305 -195L316 -176Q328 -157 343 -136T374 -98L382 -89V589L374 598Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-21D5\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Updownarrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'leftrightarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 1000.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\leftrightarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2194\" d=\"M263 479Q267 501 271 506T288 511Q308 511 308 500Q308 493 303 475Q293 438 278 406T246 352T215 315T185 287T165 270H835Q729 349 696 475Q691 493 691 500Q691 511 711 511Q720 511 723 510T729 506T732 497T735 481T743 456Q765 389 816 336T935 261Q944 258 944 250Q944 244 939 241T915 231T877 212Q836 186 806 152T761 85T740 35T732 4Q730 -6 727 -8T711 -11Q691 -11 691 0Q691 7 696 25Q728 151 835 230H165Q167 228 182 216T211 189T244 152T277 96T303 25Q308 7 308 0Q308 -11 288 -11Q281 -11 278 -11T272 -7T267 2T263 21Q245 94 195 151T73 236Q58 242 55 247Q55 254 59 257T73 264Q144 292 194 349T263 479Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2194\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\leftrightarrow',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'Leftrightarrow',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 1000.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Leftrightarrow</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-21D4\" d=\"M308 524Q318 526 323 526Q340 526 340 514Q340 507 336 499Q326 476 314 454T292 417T274 391T260 374L255 368Q255 367 500 367Q744 367 744 368L739 374Q734 379 726 390T707 416T685 453T663 499Q658 511 658 515Q658 525 680 525Q687 524 690 523T695 519T701 507Q766 359 902 287Q921 276 939 269T961 259T966 250Q966 246 965 244T960 240T949 236T930 228T902 213Q763 137 701 -7Q697 -16 695 -19T690 -23T680 -25Q658 -25 658 -15Q658 -11 663 1Q673 24 685 46T707 83T725 109T739 126L744 132Q744 133 500 133Q255 133 255 132L260 126Q265 121 273 110T292 84T314 47T336 1Q341 -11 341 -15Q341 -25 319 -25Q312 -24 309 -23T304 -19T298 -7Q233 141 97 213Q83 221 70 227T51 235T41 239T35 243T34 250T35 256T40 261T51 265T70 273T97 287Q235 363 299 509Q305 522 308 524ZM792 319L783 327H216Q183 294 120 256L110 250L120 244Q173 212 207 181L216 173H783L792 181Q826 212 879 244L889 250L879 256Q826 288 792 319Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-21D4\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Leftrightarrow',
      	substring: false,
      	pos: 0
      }
    ]
  ];
  // column 3
  public column3 = [
    [
      {
      	name: 'propto',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 778.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\propto</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-221D\" d=\"M56 124T56 216T107 375T238 442Q260 442 280 438T319 425T352 407T382 385T406 361T427 336T442 315T455 297T462 285L469 297Q555 442 679 442Q687 442 722 437V398H718Q710 400 694 400Q657 400 623 383T567 343T527 294T503 253T495 235Q495 231 520 192T554 143Q625 44 696 44Q717 44 719 46H722V-5Q695 -11 678 -11Q552 -11 457 141Q455 145 454 146L447 134Q362 -11 235 -11Q157 -11 107 56ZM93 213Q93 143 126 87T220 31Q258 31 292 48T349 88T389 137T413 178T421 196Q421 200 396 239T362 288Q322 345 288 366T213 387Q163 387 128 337T93 213Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-221D\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\propto',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'doteq',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.009ex\" style=\"vertical-align: 0.307ex; margin-bottom: -0.478ex;\" viewBox=\"0 -791.3 778.5 865.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\doteq</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2250\" d=\"M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153ZM329 610Q329 634 346 652T389 670Q413 670 431 654T450 611Q450 586 433 568T390 550T347 567T329 610Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2250\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\doteq',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'equiv',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"1.509ex\" style=\"vertical-align: 0.081ex; margin-bottom: -0.253ex;\" viewBox=\"0 -576.1 778.5 649.8\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\equiv</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2261\" d=\"M56 444Q56 457 70 464H707Q722 456 722 444Q722 430 706 424H72Q56 429 56 444ZM56 237T56 250T70 270H707Q722 262 722 250T707 230H70Q56 237 56 250ZM56 56Q56 71 72 76H706Q722 70 722 56Q722 44 707 36H70Q56 43 56 56Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2261\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\equiv',
      	substring: false,
      	pos: 0
      },
      {
        name: '=|=',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.676ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -791.3 778.5 1152.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\neq</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2260\" d=\"M166 -215T159 -215T147 -212T141 -204T139 -197Q139 -190 144 -183L306 133H70Q56 140 56 153Q56 168 72 173H327L406 327H72Q56 332 56 347Q56 360 70 367H426Q597 702 602 707Q605 716 618 716Q625 716 630 712T636 703T638 696Q638 692 471 367H707Q722 359 722 347Q722 336 708 328L451 327L371 173H708Q722 163 722 153Q722 140 707 133H351Q175 -210 170 -212Q166 -215 159 -215Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2260\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\neq',
        substring: false,
        pos: 3
      }
    ],
    [
      {
      	name: 'cdot',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"0.647ex\" height=\"1.176ex\" style=\"vertical-align: 0.439ex; margin-bottom: -0.61ex;\" viewBox=\"0 -432.6 278.5 506.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\cdot</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-22C5\" d=\"M78 250Q78 274 95 292T138 310Q162 310 180 294T199 251Q199 226 182 208T139 190T96 207T78 250Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-22C5\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\cdot',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'times',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"1.509ex\" style=\"vertical-align: 0.019ex; margin-bottom: -0.19ex;\" viewBox=\"0 -576.1 778.5 649.8\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\times</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-D7\" d=\"M630 29Q630 9 609 9Q604 9 587 25T493 118L389 222L284 117Q178 13 175 11Q171 9 168 9Q160 9 154 15T147 29Q147 36 161 51T255 146L359 250L255 354Q174 435 161 449T147 471Q147 480 153 485T168 490Q173 490 175 489Q178 487 284 383L389 278L493 382Q570 459 587 475T609 491Q630 491 630 471Q630 464 620 453T522 355L418 250L522 145Q606 61 618 48T630 29Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-D7\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\times',
      	substring: false,
      	pos: 0
      },
      {
        name: '+-',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\pm</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-B1\" d=\"M56 320T56 333T70 353H369V502Q369 651 371 655Q376 666 388 666Q402 666 405 654T409 596V500V353H707Q722 345 722 333Q722 320 707 313H409V40H707Q722 32 722 20T707 0H70Q56 7 56 20T70 40H369V313H70Q56 320 56 333Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-B1\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\pm',
        substring: false,
        pos: 3
      },
      {
      	name: '-+',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.009ex\" style=\"vertical-align: -0.671ex;\" viewBox=\"0 -576.1 778.5 865.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\mp</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2213\" d=\"M56 467T56 480T70 500H707Q722 492 722 480T707 460H409V187H707Q722 179 722 167Q722 154 707 147H409V0V-93Q409 -144 406 -155T389 -166Q376 -166 372 -155T368 -105Q368 -96 368 -62T369 -2V147H70Q56 154 56 167T70 187H369V460H70Q56 467 56 480Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2213\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\mp',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'exists',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.293ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 556.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\exists</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2203\" d=\"M56 661T56 674T70 694H487Q497 686 500 679V15Q497 10 487 1L279 0H70Q56 7 56 20T70 40H460V327H84Q70 334 70 347T84 367H460V654H70Q56 661 56 674Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2203\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\exists',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'simeq',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"1.509ex\" style=\"vertical-align: 0.081ex; margin-bottom: -0.253ex;\" viewBox=\"0 -576.1 778.5 649.8\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\simeq</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2243\" d=\"M55 283Q55 356 103 409T217 463Q262 463 297 447T395 382Q431 355 446 344T493 320T554 307H558Q613 307 652 344T694 433Q694 464 708 464T722 432Q722 356 673 304T564 251H554Q510 251 465 275T387 329T310 382T223 407H219Q164 407 122 367Q91 333 85 295T76 253T69 250Q55 250 55 283ZM56 56Q56 71 72 76H706Q722 70 722 56Q722 44 707 36H70Q56 43 56 56Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2243\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\simeq',
      	substring: false,
      	pos: 0
      },
      {
        name: 'approx',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"1.509ex\" style=\"vertical-align: 0.125ex; margin-bottom: -0.297ex;\" viewBox=\"0 -576.1 778.5 649.8\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\approx</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2248\" d=\"M55 319Q55 360 72 393T114 444T163 472T205 482Q207 482 213 482T223 483Q262 483 296 468T393 413L443 381Q502 346 553 346Q609 346 649 375T694 454Q694 465 698 474T708 483Q722 483 722 452Q722 386 675 338T555 289Q514 289 468 310T388 357T308 404T224 426Q164 426 125 393T83 318Q81 289 69 289Q55 289 55 319ZM55 85Q55 126 72 159T114 210T163 238T205 248Q207 248 213 248T223 249Q262 249 296 234T393 179L443 147Q502 112 553 112Q609 112 649 141T694 220Q694 249 708 249T722 217Q722 153 675 104T555 55Q514 55 468 76T388 123T308 170T224 192Q164 192 125 159T83 84Q80 55 69 55Q55 55 55 85Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2248\" x=\"0\" y=\"0\">',
        string: '\\approx',
        substring: false,
        pos: 3
      },
      {
        name: '~',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"1.343ex\" style=\"vertical-align: 0.307ex; margin-bottom: -0.478ex;\" viewBox=\"0 -504.3 778.5 578.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\sim</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-223C\" d=\"M55 166Q55 241 101 304T222 367Q260 367 296 349T362 304T421 252T484 208T554 189Q616 189 655 236T694 338Q694 350 698 358T708 367Q722 367 722 334Q722 260 677 197T562 134H554Q517 134 481 152T414 196T355 248T292 293T223 311Q179 311 145 286Q109 257 96 218T80 156T69 133Q55 133 55 166Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-223C\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\sim',
        substring: false,
        pos: 3
      }
    ],
    [
      {
        name: '<=',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.505ex;\" viewBox=\"0 -719.6 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\leq</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2264\" d=\"M674 636Q682 636 688 630T694 615T687 601Q686 600 417 472L151 346L399 228Q687 92 691 87Q694 81 694 76Q694 58 676 56H670L382 192Q92 329 90 331Q83 336 83 348Q84 359 96 365Q104 369 382 500T665 634Q669 636 674 636ZM84 -118Q84 -108 99 -98H678Q694 -104 694 -118Q694 -130 679 -138H98Q84 -131 84 -118Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2264\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\leq',
        substring: false,
        pos: 3
      },
      {
        name: '>=',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.505ex;\" viewBox=\"0 -719.6 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\geq</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2265\" d=\"M83 616Q83 624 89 630T99 636Q107 636 253 568T543 431T687 361Q694 356 694 346T687 331Q685 329 395 192L107 56H101Q83 58 83 76Q83 77 83 79Q82 86 98 95Q117 105 248 167Q326 204 378 228L626 346L360 472Q291 505 200 548Q112 589 98 597T83 616ZM84 -118Q84 -108 99 -98H678Q694 -104 694 -118Q694 -130 679 -138H98Q84 -131 84 -118Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2265\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\geq',
        substring: false,
        pos: 3
      },
      {
      	name: 'gg',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 1000.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\gg</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-226B\" d=\"M55 539T55 547T60 561T74 567Q81 567 207 498Q297 449 365 412Q633 265 636 261Q639 255 639 250Q639 241 626 232Q614 224 365 88Q83 -65 79 -66Q76 -67 73 -67Q65 -67 60 -61T55 -47Q55 -39 61 -33Q62 -33 95 -15T193 39T320 109L321 110H322L323 111H324L325 112L326 113H327L329 114H330L331 115H332L333 116L334 117H335L336 118H337L338 119H339L340 120L341 121H342L343 122H344L345 123H346L347 124L348 125H349L351 126H352L353 127H354L355 128L356 129H357L358 130H359L360 131H361L362 132L363 133H364L365 134H366L367 135H368L369 136H370L371 137L372 138H373L374 139H375L376 140L378 141L576 251Q63 530 62 533Q55 539 55 547ZM360 539T360 547T365 561T379 567Q386 567 512 498Q602 449 670 412Q938 265 941 261Q944 255 944 250Q944 241 931 232Q919 224 670 88Q388 -65 384 -66Q381 -67 378 -67Q370 -67 365 -61T360 -47Q360 -39 366 -33Q367 -33 400 -15T498 39T625 109L626 110H627L628 111H629L630 112L631 113H632L634 114H635L636 115H637L638 116L639 117H640L641 118H642L643 119H644L645 120L646 121H647L648 122H649L650 123H651L652 124L653 125H654L656 126H657L658 127H659L660 128L661 129H662L663 130H664L665 131H666L667 132L668 133H669L670 134H671L672 135H673L674 136H675L676 137L677 138H678L679 139H680L681 140L683 141L881 251Q368 530 367 533Q360 539 360 547Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-226B\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\gg',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'll',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 1000.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\ll</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-226A\" d=\"M639 -48Q639 -54 634 -60T619 -67H618Q612 -67 536 -26Q430 33 329 88Q61 235 59 239Q56 243 56 250T59 261Q62 266 336 415T615 567L619 568Q622 567 625 567Q639 562 639 548Q639 540 633 534Q632 532 374 391L117 250L374 109Q632 -32 633 -34Q639 -40 639 -48ZM944 -48Q944 -54 939 -60T924 -67H923Q917 -67 841 -26Q735 33 634 88Q366 235 364 239Q361 243 361 250T364 261Q367 266 641 415T920 567L924 568Q927 567 930 567Q944 562 944 548Q944 540 938 534Q937 532 679 391L422 250L679 109Q937 -32 938 -34Q944 -40 944 -48Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-226A\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\ll',
      	substring: false,
      	pos: 0
      }
    ]
  ];
  // column 4
  public column4 = [
    [
      {
      	name: 'hbar',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.306ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 562.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\hbar</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-210F\" d=\"M182 599Q182 611 174 615T133 619Q118 619 114 621T109 630Q109 636 114 656T122 681Q125 685 202 688Q272 695 286 695Q304 695 304 684Q304 682 295 644T282 597Q282 592 360 592H399Q430 592 445 587T460 563Q460 552 451 541L442 535H266L251 468Q247 453 243 436T236 409T233 399Q233 395 244 404Q295 441 357 441Q405 441 445 417T485 333Q485 284 449 178T412 58T426 44Q447 44 466 68Q485 87 500 130L509 152H531H543Q562 152 562 144Q562 128 546 93T494 23T415 -13Q385 -13 359 3T322 44Q318 52 318 77Q318 99 352 196T386 337Q386 386 346 386Q318 386 286 370Q267 361 245 338T211 292Q207 287 193 235T162 113T138 21Q128 7 122 4Q105 -12 83 -12Q66 -12 54 -2T42 26L166 530Q166 534 161 534T129 535Q127 535 122 535T112 534Q74 534 74 562Q74 570 77 576T84 585T96 589T109 591T124 592T138 592L182 595V599Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-210F\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\hbar',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'nabla',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.936ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 833.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\nabla</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2207\" d=\"M46 676Q46 679 51 683H781Q786 679 786 676Q786 674 617 326T444 -26Q439 -33 416 -33T388 -26Q385 -22 216 326T46 676ZM697 596Q697 597 445 597T193 596Q195 591 319 336T445 80L697 596Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2207\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\nabla',
      	substring: false,
      	pos: 0
      },
            {
      	name: 'Box',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\Box</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJAMS-25A1\" d=\"M71 0Q59 4 55 16V346L56 676Q64 686 70 689H709Q719 681 722 674V15Q719 10 709 1L390 0H71ZM682 40V649H95V40H682Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJAMS-25A1\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\Box',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'parallel',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.162ex\" height=\"2.843ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -863.1 500.5 1223.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\parallel</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2225\" d=\"M133 736Q138 750 153 750Q164 750 170 739Q172 735 172 250T170 -239Q164 -250 152 -250Q144 -250 138 -244L137 -243Q133 -241 133 -179T132 250Q132 731 133 736ZM329 739Q334 750 346 750Q353 750 361 744L362 743Q366 741 366 679T367 250T367 -178T362 -243L361 -244Q355 -250 347 -250Q335 -250 329 -239Q327 -235 327 250T329 739Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2225\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\parallel',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
        name: 'infinity',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.324ex\" height=\"1.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -576.1 1000.5 721.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\infty</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-221E\" d=\"M55 217Q55 305 111 373T254 442Q342 442 419 381Q457 350 493 303L507 284L514 294Q618 442 747 442Q833 442 888 374T944 214Q944 128 889 59T743 -11Q657 -11 580 50Q542 81 506 128L492 147L485 137Q381 -11 252 -11Q166 -11 111 57T55 217ZM907 217Q907 285 869 341T761 397Q740 397 720 392T682 378T648 359T619 335T594 310T574 285T559 263T548 246L543 238L574 198Q605 158 622 138T664 94T714 61T765 51Q827 51 867 100T907 217ZM92 214Q92 145 131 89T239 33Q357 33 456 193L425 233Q364 312 334 337Q285 380 233 380Q171 380 132 331T92 214Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-221E\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>',
        string: '\\infty',
        substring: false,
        pos: 0
      },
      {
      	name: 'in',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.55ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 667.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\in</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2208\" d=\"M84 250Q84 372 166 450T360 539Q361 539 377 539T419 540T469 540H568Q583 532 583 520Q583 511 570 501L466 500Q355 499 329 494Q280 482 242 458T183 409T147 354T129 306T124 272V270H568Q583 262 583 250T568 230H124V228Q124 207 134 177T167 112T231 48T328 7Q355 1 466 0H570Q583 -10 583 -20Q583 -32 568 -40H471Q464 -40 446 -40T417 -41Q262 -41 172 45Q84 127 84 250Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2208\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\in',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'ni',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.55ex\" height=\"1.843ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -647.8 667.5 793.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\ni</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-220B\" d=\"M83 520Q83 532 98 540H195Q202 540 220 540T249 541Q404 541 494 455Q582 374 582 250Q582 165 539 99T434 0T304 -39Q297 -40 195 -40H98Q83 -32 83 -20Q83 -10 96 0H200Q311 1 337 6Q369 14 401 28Q422 39 445 55Q484 85 508 127T537 191T542 228V230H98Q84 237 84 250T98 270H542V272Q542 280 539 295T527 336T497 391T445 445Q422 461 401 472Q386 479 374 483T347 491T325 495T298 498T273 499T239 500T200 500L96 501Q83 511 83 520Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-220B\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\ni',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'dagger',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.032ex\" height=\"2.676ex\" style=\"vertical-align: -0.838ex;\" viewBox=\"0 -791.3 444.5 1152.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\dagger</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2020\" d=\"M182 675Q195 705 222 705Q234 705 243 700T253 691T263 675L262 655Q262 620 252 549T240 454V449Q250 451 288 461T346 472T377 461T389 431Q389 417 379 404T346 390Q327 390 288 401T243 412H240V405Q245 367 250 339T258 301T261 274T263 225Q263 124 255 -41T239 -213Q236 -216 222 -216H217Q206 -216 204 -212T200 -186Q199 -175 199 -168Q181 38 181 225Q181 265 182 280T191 327T204 405V412H201Q196 412 157 401T98 390Q76 390 66 403T55 431T65 458T98 472Q116 472 155 462T205 449Q204 452 204 460T201 490T193 547Q182 619 182 655V675Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2020\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\dagger',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'partial',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.318ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 567.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\partial</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2202\" d=\"M202 508Q179 508 169 520T158 547Q158 557 164 577T185 624T230 675T301 710L333 715H345Q378 715 384 714Q447 703 489 661T549 568T566 457Q566 362 519 240T402 53Q321 -22 223 -22Q123 -22 73 56Q42 102 42 148V159Q42 276 129 370T322 465Q383 465 414 434T455 367L458 378Q478 461 478 515Q478 603 437 639T344 676Q266 676 223 612Q264 606 264 572Q264 547 246 528T202 508ZM430 306Q430 372 401 400T333 428Q270 428 222 382Q197 354 183 323T150 221Q132 149 132 116Q132 21 232 21Q244 21 250 22Q327 35 374 112Q389 137 409 196T430 306Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2202\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\partial',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'perp',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\perp</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-22A5\" d=\"M369 652Q369 653 370 655T372 658T375 662T379 665T384 667T391 668Q402 666 409 653V40H708Q723 32 723 20T708 0H71Q70 0 67 2T59 9T55 20T59 31T66 38T71 40H369V652Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-22A5\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\perp',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'forall',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.293ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 556.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\forall</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2200\" d=\"M0 673Q0 684 7 689T20 694Q32 694 38 680T82 567L126 451H430L473 566Q483 593 494 622T512 668T519 685Q524 694 538 694Q556 692 556 674Q556 670 426 329T293 -15Q288 -22 278 -22T263 -15Q260 -11 131 328T0 673ZM414 410Q414 411 278 411T142 410L278 55L414 410Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2200\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\forall',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'circ',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.162ex\" height=\"1.509ex\" style=\"vertical-align: 0.125ex; margin-bottom: -0.297ex;\" viewBox=\"0 -576.1 500.5 649.8\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\circ</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2218\" d=\"M55 251Q55 328 112 386T249 444T386 388T444 249Q444 171 388 113T250 55Q170 55 113 112T55 251ZM245 403Q188 403 142 361T96 250Q96 183 141 140T250 96Q284 96 313 109T354 135T375 160Q403 197 403 250Q403 313 360 358T245 403Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2218\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\circ',
      	substring: false,
      	pos: 0
      }
    ],
    [
      {
      	name: 'unicode{x212B}',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"0.944ex\" height=\"3.009ex\" style=\"vertical-align: -0.465ex; margin-bottom: -0.373ex;\" viewBox=\"0 -934.9 406.6 1295.7\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\unicode{x212B}</title>\n<defs aria-hidden=\"true\"></defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n<text font-family=\"monospace\" stroke=\"none\" transform=\"scale(47.83933333333333) matrix(1 0 0 -1 0 0)\">Å</text>\n</g>\n</svg>",
      	string: '\\unicode{x212B}',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'odot',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.505ex;\" viewBox=\"0 -719.6 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\odot</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2299\" d=\"M56 250Q56 394 156 488T384 583Q530 583 626 485T722 250Q722 110 625 14T390 -83Q249 -83 153 14T56 250ZM682 250Q682 322 649 387T546 497T381 542Q272 542 184 459T95 250Q95 132 178 45T389 -42Q515 -42 598 45T682 250ZM311 250Q311 285 332 304T375 328Q376 328 382 328T392 329Q424 326 445 305T466 250Q466 217 445 195T389 172Q354 172 333 195T311 250Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2299\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\odot',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'oplus',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.505ex;\" viewBox=\"0 -719.6 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\oplus</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2295\" d=\"M56 250Q56 394 156 488T384 583Q530 583 626 485T722 250Q722 110 625 14T390 -83Q249 -83 153 14T56 250ZM364 542Q308 539 251 509T148 418T96 278V270H369V542H364ZM681 278Q675 338 650 386T592 462T522 509T458 535T412 542H409V270H681V278ZM96 222Q104 150 139 95T219 12T302 -29T366 -42H369V230H96V222ZM681 222V230H409V-42H412Q429 -42 456 -36T521 -10T590 37T649 113T681 222Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2295\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\oplus',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'otimes',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.808ex\" height=\"2.176ex\" style=\"vertical-align: -0.505ex;\" viewBox=\"0 -719.6 778.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\otimes</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-2297\" d=\"M56 250Q56 394 156 488T384 583Q530 583 626 485T722 250Q722 110 625 14T390 -83Q249 -83 153 14T56 250ZM582 471Q531 510 496 523Q446 542 381 542Q324 542 272 519T196 471L389 278L485 375L582 471ZM167 442Q95 362 95 250Q95 137 167 58L359 250L167 442ZM610 58Q682 138 682 250Q682 363 610 442L418 250L610 58ZM196 29Q209 16 230 2T295 -27T388 -42Q409 -42 429 -40T465 -33T496 -23T522 -11T544 1T561 13T574 22T582 29L388 222L196 29Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-2297\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\otimes',
      	substring: false,
      	pos: 0
      }
    ]
  ];
  // misc and matrix elements
  public misc = [
    [
      {
      	name: 'cdots',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.723ex\" height=\"1.176ex\" style=\"vertical-align: 0.439ex; margin-bottom: -0.61ex;\" viewBox=\"0 -432.6 1172.5 506.3\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\cdots</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-22EF\" d=\"M78 250Q78 274 95 292T138 310Q162 310 180 294T199 251Q199 226 182 208T139 190T96 207T78 250ZM525 250Q525 274 542 292T585 310Q609 310 627 294T646 251Q646 226 629 208T586 190T543 207T525 250ZM972 250Q972 274 989 292T1032 310Q1056 310 1074 294T1093 251Q1093 226 1076 208T1033 190T990 207T972 250Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-22EF\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\cdots',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'vdots',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"0.647ex\" height=\"3.676ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -1437.2 278.5 1582.7\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\vdots</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-22EE\" d=\"M78 30Q78 54 95 72T138 90Q162 90 180 74T199 31Q199 6 182 -12T139 -30T96 -13T78 30ZM78 440Q78 464 95 482T138 500Q162 500 180 484T199 441Q199 416 182 398T139 380T96 397T78 440ZM78 840Q78 864 95 882T138 900Q162 900 180 884T199 841Q199 816 182 798T139 780T96 797T78 840Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-22EE\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\vdots',
      	substring: false,
      	pos: 0
      },
      {
      	name: 'ddots',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"2.979ex\" height=\"4.009ex\" style=\"vertical-align: 0.23ex; margin-bottom: -0.401ex;\" viewBox=\"0 -1652.5 1282.5 1726.2\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\ddots</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-22F1\" d=\"M133 760Q133 784 150 802T193 820Q217 820 235 804T254 761Q254 736 237 718T194 700T151 717T133 760ZM580 460Q580 484 597 502T640 520Q664 520 682 504T701 461Q701 436 684 418T641 400T598 417T580 460ZM1027 160Q1027 184 1044 202T1087 220Q1111 220 1129 204T1148 161Q1148 136 1131 118T1088 100T1045 117T1027 160Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJMAIN-22F1\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\ddots',
      	substring: false,
      	pos: 0
      },
    ],
    [
      {
      	name: 'mathbb{A}',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.678ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 722.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\mathbb{A}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJAMS-41\" d=\"M130 -1H63Q34 -1 26 2T17 17Q17 24 22 29T35 35Q49 35 64 44T88 66Q101 93 210 383Q331 693 335 697T346 701T357 697Q358 696 493 399Q621 104 633 83Q656 35 686 35Q693 35 698 30T703 17Q703 5 693 2T643 -1H541Q388 -1 386 1Q378 6 378 16Q378 24 383 29T397 35Q412 35 434 45T456 65Q456 93 428 170L419 197H197L195 179Q184 134 184 97Q184 82 186 71T190 55T198 45T205 39T214 36L219 35Q241 31 241 17Q241 5 233 2T196 -1H130ZM493 68Q493 51 481 35H619Q604 56 515 256Q486 321 468 361L348 637Q347 637 330 592T313 543Q313 538 358 436T448 219T493 68ZM404 235Q404 239 355 355T295 488L275 430Q241 348 208 232H306Q404 232 404 235ZM155 48Q151 55 148 88V117L135 86Q118 47 117 46L110 37L135 35H159Q157 41 155 48Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJAMS-41\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\mathbb{  }',
      	substring: true,
      	pos: 8
      },
      {
      	name: 'mathfrak{A}',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.669ex\" height=\"2.176ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -791.3 718.5 936.9\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\mathfrak{A}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJFRAK-41\" d=\"M22 505Q22 563 94 624T271 685H280Q416 685 443 560Q447 535 447 504Q444 414 405 330L399 319L229 155Q233 154 241 153T253 150T265 145T281 135T301 119T328 93L357 64L402 92Q438 116 473 137L500 154V339Q500 528 495 593V601L559 649Q621 696 624 696L638 686L629 677Q599 650 593 638Q582 614 581 504Q580 490 580 443Q580 314 584 238Q584 235 584 224T584 210T585 199T586 187T588 176T591 164T595 152T601 137T609 121Q630 77 640 77Q661 77 703 101Q704 95 706 90L707 86V84L636 29Q618 15 601 2T574 -19T564 -25L500 121Q499 121 399 48L299 -26Q298 -26 291 -15T272 11T245 42T209 69T165 80Q120 80 58 43L48 37L40 42L32 48L122 117Q196 173 241 211Q319 280 343 327T368 447Q368 535 317 582Q264 633 199 633Q155 633 122 605T86 542Q86 518 133 467T181 387Q181 348 140 309Q113 281 73 260L64 255L50 265L59 273Q112 307 112 345Q112 363 90 387T45 441T22 505Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJFRAK-41\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\mathfrak{  }',
      	substring: true,
      	pos: 10
      },
      {
      	name: 'mathcal{A}',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"1.903ex\" height=\"2.343ex\" style=\"vertical-align: -0.338ex;\" viewBox=\"0 -863.1 819.5 1008.6\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\mathcal{A}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJCAL-41\" d=\"M576 668Q576 688 606 708T660 728Q676 728 675 712V571Q675 409 688 252Q696 122 720 57Q722 53 723 50T728 46T732 43T737 41T743 39L754 45Q788 61 803 61Q819 61 819 47Q818 43 814 35Q799 15 755 -7T675 -30Q659 -30 648 -25T630 -8T621 11T614 34Q603 77 599 106T594 146T591 160V163H460L329 164L316 145Q241 35 196 -7T119 -50T59 -24T30 43Q30 75 46 100T74 125Q81 125 83 120T88 104T96 84Q118 57 151 57Q189 57 277 182Q432 400 542 625L559 659H567Q574 659 575 660T576 668ZM584 249Q579 333 577 386T575 473T574 520V581L563 560Q497 426 412 290L372 228L370 224H371L383 228L393 232H586L584 249Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJCAL-41\" x=\"0\" y=\"0\"></use>\n</g>\n</svg>",
      	string: '\\mathcal{  }',
      	substring: true,
      	pos: 9
      }
    ],
    [
      {
      	name: 'Matrix',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"7.642ex\" height=\"6.176ex\" style=\"vertical-align: -2.505ex;\" viewBox=\"0 -1580.7 3290.4 2659.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\begin{matrix}a_1&amp;a_2\\\\b_1&amp;b_2\\end{matrix}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-31\" d=\"M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-32\" d=\"M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n<g transform=\"translate(167,0)\">\n<g transform=\"translate(-11,0)\">\n<g transform=\"translate(0,650)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-31\" x=\"748\" y=\"-213\"></use>\n</g>\n<g transform=\"translate(50,-750)\">\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-31\" x=\"607\" y=\"-213\"></use>\n</g>\n</g>\n<g transform=\"translate(1972,0)\">\n<g transform=\"translate(0,650)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"748\" y=\"-213\"></use>\n</g>\n<g transform=\"translate(50,-750)\">\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"607\" y=\"-213\"></use>\n</g>\n</g>\n</g>\n</g>\n</svg>",
      	string: '\\begin{matrix}  \\end{matrix}',
      	substring: true,
      	pos: 14
      },
      {
      	name: 'b-Matrix',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"10.097ex\" height=\"6.176ex\" style=\"vertical-align: -2.505ex;\" viewBox=\"0 -1580.7 4347.4 2659.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\begin{bmatrix}a_1&amp;a_2\\\\b_1&amp;b_2\\end{bmatrix}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-5B\" d=\"M118 -250V750H255V710H158V-210H255V-250H118Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-31\" d=\"M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-32\" d=\"M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-5D\" d=\"M22 710V750H159V-250H22V-210H119V710H22Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJSZ3-5B\" d=\"M247 -949V1450H516V1388H309V-887H516V-949H247Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJSZ3-5D\" d=\"M11 1388V1450H280V-949H11V-887H218V1388H11Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJSZ3-5B\"></use>\n<g transform=\"translate(695,0)\">\n<g transform=\"translate(-11,0)\">\n<g transform=\"translate(0,650)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-31\" x=\"748\" y=\"-213\"></use>\n</g>\n<g transform=\"translate(50,-750)\">\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-31\" x=\"607\" y=\"-213\"></use>\n</g>\n</g>\n<g transform=\"translate(1972,0)\">\n<g transform=\"translate(0,650)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"748\" y=\"-213\"></use>\n</g>\n<g transform=\"translate(50,-750)\">\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"607\" y=\"-213\"></use>\n</g>\n</g>\n</g>\n <use xlink:href=\"#E1-MJSZ3-5D\" x=\"3818\" y=\"-1\"></use>\n</g>\n</svg>",
      	string: '\\begin{bmatrix}  \\end{bmatrix}',
      	substring: false,
      	pos: 15
      },
      {
      	name: 'B-Matrix',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"11.128ex\" height=\"6.176ex\" style=\"vertical-align: -2.505ex;\" viewBox=\"0 -1580.7 4791.4 2659.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\begin{Bmatrix}a_1&amp;a_2\\\\b_1&amp;b_2\\end{Bmatrix}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-7B\" d=\"M434 -231Q434 -244 428 -250H410Q281 -250 230 -184Q225 -177 222 -172T217 -161T213 -148T211 -133T210 -111T209 -84T209 -47T209 0Q209 21 209 53Q208 142 204 153Q203 154 203 155Q189 191 153 211T82 231Q71 231 68 234T65 250T68 266T82 269Q116 269 152 289T203 345Q208 356 208 377T209 529V579Q209 634 215 656T244 698Q270 724 324 740Q361 748 377 749Q379 749 390 749T408 750H428Q434 744 434 732Q434 719 431 716Q429 713 415 713Q362 710 332 689T296 647Q291 634 291 499V417Q291 370 288 353T271 314Q240 271 184 255L170 250L184 245Q202 239 220 230T262 196T290 137Q291 131 291 1Q291 -134 296 -147Q306 -174 339 -192T415 -213Q429 -213 431 -216Q434 -219 434 -231Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-31\" d=\"M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-32\" d=\"M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-7D\" d=\"M65 731Q65 745 68 747T88 750Q171 750 216 725T279 670Q288 649 289 635T291 501Q292 362 293 357Q306 312 345 291T417 269Q428 269 431 266T434 250T431 234T417 231Q380 231 345 210T298 157Q293 143 292 121T291 -28V-79Q291 -134 285 -156T256 -198Q202 -250 89 -250Q71 -250 68 -247T65 -230Q65 -224 65 -223T66 -218T69 -214T77 -213Q91 -213 108 -210T146 -200T183 -177T207 -139Q208 -134 209 3L210 139Q223 196 280 230Q315 247 330 250Q305 257 280 270Q225 304 212 352L210 362L209 498Q208 635 207 640Q195 680 154 696T77 713Q68 713 67 716T65 731Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJSZ3-7B\" d=\"M618 -943L612 -949H582L568 -943Q472 -903 411 -841T332 -703Q327 -682 327 -653T325 -350Q324 -28 323 -18Q317 24 301 61T264 124T221 171T179 205T147 225T132 234Q130 238 130 250Q130 255 130 258T131 264T132 267T134 269T139 272T144 275Q207 308 256 367Q310 436 323 519Q324 529 325 851Q326 1124 326 1154T332 1205Q369 1358 566 1443L582 1450H612L618 1444V1429Q618 1413 616 1411L608 1406Q599 1402 585 1393T552 1372T515 1343T479 1305T449 1257T429 1200Q425 1180 425 1152T423 851Q422 579 422 549T416 498Q407 459 388 424T346 364T297 318T250 284T214 264T197 254L188 251L205 242Q290 200 345 138T416 3Q421 -18 421 -48T423 -349Q423 -397 423 -472Q424 -677 428 -694Q429 -697 429 -699Q434 -722 443 -743T465 -782T491 -816T519 -845T548 -868T574 -886T595 -899T610 -908L616 -910Q618 -912 618 -928V-943Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJSZ3-7D\" d=\"M131 1414T131 1429T133 1447T148 1450H153H167L182 1444Q276 1404 336 1343T415 1207Q421 1184 421 1154T423 851L424 531L426 517Q434 462 460 415T518 339T571 296T608 274Q615 270 616 267T618 251Q618 241 618 238T615 232T608 227Q542 194 491 132T426 -15L424 -29L423 -350Q422 -622 422 -652T415 -706Q397 -780 337 -841T182 -943L167 -949H153Q137 -949 134 -946T131 -928Q131 -914 132 -911T144 -904Q146 -903 148 -902Q299 -820 323 -680Q324 -663 325 -349T327 -19Q355 145 541 241L561 250L541 260Q356 355 327 520Q326 537 325 850T323 1181Q315 1227 293 1267T244 1332T193 1374T151 1401T132 1413Q131 1414 131 1429Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJSZ3-7B\"></use>\n<g transform=\"translate(917,0)\">\n<g transform=\"translate(-11,0)\">\n<g transform=\"translate(0,650)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-31\" x=\"748\" y=\"-213\"></use>\n</g>\n<g transform=\"translate(50,-750)\">\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-31\" x=\"607\" y=\"-213\"></use>\n</g>\n</g>\n<g transform=\"translate(1972,0)\">\n<g transform=\"translate(0,650)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"748\" y=\"-213\"></use>\n</g>\n<g transform=\"translate(50,-750)\">\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"607\" y=\"-213\"></use>\n</g>\n</g>\n</g>\n <use xlink:href=\"#E1-MJSZ3-7D\" x=\"4040\" y=\"-1\"></use>\n</g>\n</svg>",
      	string: '\\begin{Bmatrix}  \\end{Bmatrix}',
      	substring: true,
      	pos: 15
      },
      {
      	name: 'p-Matrix',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"11.063ex\" height=\"6.176ex\" style=\"vertical-align: -2.505ex;\" viewBox=\"0 -1580.7 4763.4 2659.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\n\\begin{pmatrix}a_1&amp;a_2\\\\b_1&amp;b_2\\end{pmatrix}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-28\" d=\"M94 250Q94 319 104 381T127 488T164 576T202 643T244 695T277 729T302 750H315H319Q333 750 333 741Q333 738 316 720T275 667T226 581T184 443T167 250T184 58T225 -81T274 -167T316 -220T333 -241Q333 -250 318 -250H315H302L274 -226Q180 -141 137 -14T94 250Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-31\" d=\"M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-32\" d=\"M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMAIN-29\" d=\"M60 749L64 750Q69 750 74 750H86L114 726Q208 641 251 514T294 250Q294 182 284 119T261 12T224 -76T186 -143T145 -194T113 -227T90 -246Q87 -249 86 -250H74Q66 -250 63 -250T58 -247T55 -238Q56 -237 66 -225Q221 -64 221 250T66 725Q56 737 55 738Q55 746 60 749Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJSZ3-28\" d=\"M701 -940Q701 -943 695 -949H664Q662 -947 636 -922T591 -879T537 -818T475 -737T412 -636T350 -511T295 -362T250 -186T221 17T209 251Q209 962 573 1361Q596 1386 616 1405T649 1437T664 1450H695Q701 1444 701 1441Q701 1436 681 1415T629 1356T557 1261T476 1118T400 927T340 675T308 359Q306 321 306 250Q306 -139 400 -430T690 -924Q701 -936 701 -940Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJSZ3-29\" d=\"M34 1438Q34 1446 37 1448T50 1450H56H71Q73 1448 99 1423T144 1380T198 1319T260 1238T323 1137T385 1013T440 864T485 688T514 485T526 251Q526 134 519 53Q472 -519 162 -860Q139 -885 119 -904T86 -936T71 -949H56Q43 -949 39 -947T34 -937Q88 -883 140 -813Q428 -430 428 251Q428 453 402 628T338 922T245 1146T145 1309T46 1425Q44 1427 42 1429T39 1433T36 1436L34 1438Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJSZ3-28\"></use>\n<g transform=\"translate(903,0)\">\n<g transform=\"translate(-11,0)\">\n<g transform=\"translate(0,650)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-31\" x=\"748\" y=\"-213\"></use>\n</g>\n<g transform=\"translate(50,-750)\">\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-31\" x=\"607\" y=\"-213\"></use>\n</g>\n</g>\n<g transform=\"translate(1972,0)\">\n<g transform=\"translate(0,650)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"748\" y=\"-213\"></use>\n</g>\n<g transform=\"translate(50,-750)\">\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMAIN-32\" x=\"607\" y=\"-213\"></use>\n</g>\n</g>\n</g>\n <use xlink:href=\"#E1-MJSZ3-29\" x=\"4026\" y=\"-1\"></use>\n</g>\n</svg>",
      	string: '\begin{pmatrix}  \\end{pmatrix}',
      	substring: true,
      	pos: 15
      }
    ],
    [
      {
        name: 'sum',
        svg: '<svg xmlns:xlink="http://www.w3.org/1999/xlink" width="3.742ex" height="7.343ex" style="vertical-align: -3.005ex;" viewBox="0 -1867.7 1611.2 3161.4" role="img" focusable="false" xmlns="http://www.w3.org/2000/svg" aria-labelledby="MathJax-SVG-1-Title">↵<title id="MathJax-SVG-1-Title">\sum_{a}^{b}{}</title>↵<defs aria-hidden="true">↵<path stroke-width="1" id="E1-MJSZ2-2211" d="M60 948Q63 950 665 950H1267L1325 815Q1384 677 1388 669H1348L1341 683Q1320 724 1285 761Q1235 809 1174 838T1033 881T882 898T699 902H574H543H251L259 891Q722 258 724 252Q725 250 724 246Q721 243 460 -56L196 -356Q196 -357 407 -357Q459 -357 548 -357T676 -358Q812 -358 896 -353T1063 -332T1204 -283T1307 -196Q1328 -170 1348 -124H1388Q1388 -125 1381 -145T1356 -210T1325 -294L1267 -449L666 -450Q64 -450 61 -448Q55 -446 55 -439Q55 -437 57 -433L590 177Q590 178 557 222T452 366T322 544L56 909L55 924Q55 945 60 948Z"></path>↵<path stroke-width="1" id="E1-MJMATHI-61" d="M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z"></path>↵<path stroke-width="1" id="E1-MJMATHI-62" d="M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z"></path>↵</defs>↵<g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)" aria-hidden="true">↵ <use xlink:href="#E1-MJSZ2-2211" x="0" y="0"></use>↵ <use transform="scale(0.707)" xlink:href="#E1-MJMATHI-61" x="756" y="-1487"></use>↵ <use transform="scale(0.707)" xlink:href="#E1-MJMATHI-62" x="806" y="1627"></use>↵</g>↵</svg>',
        string: '\\sum_{}^{}{}',
        substring: true,
        pos: 11
      },
      {
        name: 'product',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"3.357ex\" height=\"7.343ex\" style=\"vertical-align: -3.005ex;\" viewBox=\"0 -1867.7 1445.2 3161.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\prod_{a}^{b}{}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJSZ2-220F\" d=\"M220 812Q220 813 218 819T214 829T208 840T199 853T185 866T166 878T140 887T107 893T66 896H56V950H1221V896H1211Q1080 896 1058 812V-311Q1076 -396 1211 -396H1221V-450H725V-396H735Q864 -396 888 -314Q889 -312 889 -311V896H388V292L389 -311Q405 -396 542 -396H552V-450H56V-396H66Q195 -396 219 -314Q220 -312 220 -311V812Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJSZ2-220F\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-61\" x=\"639\" y=\"-1487\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-62\" x=\"689\" y=\"1627\"></use>\n</g>\n</svg>',
        string: '\\prod_{}^{}{}',
        substring: true,
        pos: 12
      },
      {
        name: 'integral',
        svg: '<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"3.789ex\" height=\"6.343ex\" style=\"vertical-align: -2.338ex;\" viewBox=\"0 -1724.2 1631.3 2730.8\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\int_{a}^{b}{}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJSZ2-222B\" d=\"M114 -798Q132 -824 165 -824H167Q195 -824 223 -764T275 -600T320 -391T362 -164Q365 -143 367 -133Q439 292 523 655T645 1127Q651 1145 655 1157T672 1201T699 1257T733 1306T777 1346T828 1360Q884 1360 912 1325T944 1245Q944 1220 932 1205T909 1186T887 1183Q866 1183 849 1198T832 1239Q832 1287 885 1296L882 1300Q879 1303 874 1307T866 1313Q851 1323 833 1323Q819 1323 807 1311T775 1255T736 1139T689 936T633 628Q574 293 510 -5T410 -437T355 -629Q278 -862 165 -862Q125 -862 92 -831T55 -746Q55 -711 74 -698T112 -685Q133 -685 150 -700T167 -741Q167 -789 114 -798Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJSZ2-222B\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-62\" x=\"1500\" y=\"1540\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-61\" x=\"787\" y=\"-1270\"></use>\n</g>\n</svg>',
        string: '\\int_{}^{}{}',
        substring: true,
        pos: 11
      },
      {
      	name: 'ointegral',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"3.789ex\" height=\"6.343ex\" style=\"vertical-align: -2.338ex;\" viewBox=\"0 -1724.2 1631.3 2730.8\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\oint_{a}^{b}{}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJSZ2-222E\" d=\"M114 -798Q132 -824 165 -824H167Q195 -824 223 -764T275 -600T320 -391T362 -164Q365 -143 367 -133Q382 -52 390 2Q314 40 276 99Q230 167 230 249Q230 363 305 436T484 519H494L503 563Q587 939 632 1087T727 1298Q774 1360 828 1360Q884 1360 912 1325T944 1245Q944 1220 932 1205T909 1186T887 1183Q866 1183 849 1198T832 1239Q832 1287 885 1296L882 1300Q879 1303 874 1307T866 1313Q851 1323 833 1323Q766 1323 688 929Q662 811 610 496Q770 416 770 249Q770 147 701 68T516 -21H506L497 -65Q407 -464 357 -623T237 -837Q203 -862 165 -862Q125 -862 92 -831T55 -746Q55 -711 74 -698T112 -685Q133 -685 150 -700T167 -741Q167 -789 114 -798ZM480 478Q460 478 435 470T380 444T327 401T287 335T271 249Q271 124 375 56L397 43L431 223L485 478H480ZM519 20Q545 20 578 33T647 72T706 144T730 249Q730 383 603 455Q603 454 597 421T582 343T569 276Q516 22 515 20H519Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJSZ2-222E\" x=\"0\" y=\"1\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-62\" x=\"1500\" y=\"1540\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-61\" x=\"787\" y=\"-1270\"></use>\n</g>\n</svg>",
      	string: '\\oint_{}^{}{}',
      	substring: true,
      	pos: 12
      },
      {
      	name: 'coproduct',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"3.357ex\" height=\"7.343ex\" style=\"vertical-align: -3.005ex;\" viewBox=\"0 -1867.7 1445.2 3161.4\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\coprod_{a}^{b}{}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJSZ2-2210\" d=\"M220 812Q220 813 218 819T214 829T208 840T199 853T185 866T166 878T140 887T107 893T66 896H56V950H552V896H542Q411 896 389 812L388 208V-396H889V812Q889 813 887 819T883 829T877 840T868 853T854 866T835 878T809 887T776 893T735 896H725V950H1221V896H1211Q1080 896 1058 812V-311Q1076 -396 1211 -396H1221V-450H56V-396H66Q195 -396 219 -314Q220 -312 220 -311V812Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJSZ2-2210\" x=\"0\" y=\"0\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-61\" x=\"639\" y=\"-1487\"></use>\n <use transform=\"scale(0.707)\" xlink:href=\"#E1-MJMATHI-62\" x=\"689\" y=\"1627\"></use>\n</g>\n</svg>",
      	string: '\\coprod_{}^{}{}',
      	substring: true,
      	pos: 14
      },
      {
      	name: 'cases',
      	svg: "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"3.724ex\" height=\"6.176ex\" style=\"vertical-align: -2.505ex;\" viewBox=\"0 -1580.7 1603.5 2659.1\" role=\"img\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" aria-labelledby=\"MathJax-SVG-1-Title\">\n<title id=\"MathJax-SVG-1-Title\">\\begin{cases}a\\\\b\\end{cases}</title>\n<defs aria-hidden=\"true\">\n<path stroke-width=\"1\" id=\"E1-MJMAIN-7B\" d=\"M434 -231Q434 -244 428 -250H410Q281 -250 230 -184Q225 -177 222 -172T217 -161T213 -148T211 -133T210 -111T209 -84T209 -47T209 0Q209 21 209 53Q208 142 204 153Q203 154 203 155Q189 191 153 211T82 231Q71 231 68 234T65 250T68 266T82 269Q116 269 152 289T203 345Q208 356 208 377T209 529V579Q209 634 215 656T244 698Q270 724 324 740Q361 748 377 749Q379 749 390 749T408 750H428Q434 744 434 732Q434 719 431 716Q429 713 415 713Q362 710 332 689T296 647Q291 634 291 499V417Q291 370 288 353T271 314Q240 271 184 255L170 250L184 245Q202 239 220 230T262 196T290 137Q291 131 291 1Q291 -134 296 -147Q306 -174 339 -192T415 -213Q429 -213 431 -216Q434 -219 434 -231Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-61\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJMATHI-62\" d=\"M73 647Q73 657 77 670T89 683Q90 683 161 688T234 694Q246 694 246 685T212 542Q204 508 195 472T180 418L176 399Q176 396 182 402Q231 442 283 442Q345 442 383 396T422 280Q422 169 343 79T173 -11Q123 -11 82 27T40 150V159Q40 180 48 217T97 414Q147 611 147 623T109 637Q104 637 101 637H96Q86 637 83 637T76 640T73 647ZM336 325V331Q336 405 275 405Q258 405 240 397T207 376T181 352T163 330L157 322L136 236Q114 150 114 114Q114 66 138 42Q154 26 178 26Q211 26 245 58Q270 81 285 114T318 219Q336 291 336 325Z\"></path>\n<path stroke-width=\"1\" id=\"E1-MJSZ3-7B\" d=\"M618 -943L612 -949H582L568 -943Q472 -903 411 -841T332 -703Q327 -682 327 -653T325 -350Q324 -28 323 -18Q317 24 301 61T264 124T221 171T179 205T147 225T132 234Q130 238 130 250Q130 255 130 258T131 264T132 267T134 269T139 272T144 275Q207 308 256 367Q310 436 323 519Q324 529 325 851Q326 1124 326 1154T332 1205Q369 1358 566 1443L582 1450H612L618 1444V1429Q618 1413 616 1411L608 1406Q599 1402 585 1393T552 1372T515 1343T479 1305T449 1257T429 1200Q425 1180 425 1152T423 851Q422 579 422 549T416 498Q407 459 388 424T346 364T297 318T250 284T214 264T197 254L188 251L205 242Q290 200 345 138T416 3Q421 -18 421 -48T423 -349Q423 -397 423 -472Q424 -677 428 -694Q429 -697 429 -699Q434 -722 443 -743T465 -782T491 -816T519 -845T548 -868T574 -886T595 -899T610 -908L616 -910Q618 -912 618 -928V-943Z\"></path>\n</defs>\n<g stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\" aria-hidden=\"true\">\n <use xlink:href=\"#E1-MJSZ3-7B\"></use>\n<g transform=\"translate(917,0)\">\n<g transform=\"translate(-11,0)\">\n <use xlink:href=\"#E1-MJMATHI-61\" x=\"0\" y=\"550\"></use>\n <use xlink:href=\"#E1-MJMATHI-62\" x=\"0\" y=\"-650\"></use>\n</g>\n</g>\n</g>\n</svg>",
      	string: '\\begin{cases}  \\  \\end{cases}',
      	substring: true,
      	pos: 13
      },
    ]
  ];
}
