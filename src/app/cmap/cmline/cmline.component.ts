import { Component, OnInit, Input } from '@angular/core';
import { CMElement } from '../../models/CMElement';

@Component({
  selector: 'app-cmline',
  templateUrl: './cmline.component.html',
  styleUrls: ['./cmline.component.scss']
})
export class CmlineComponent implements OnInit {
  @Input() cmelement: CMElement;

  constructor() { }

  ngOnInit() {

  }

}
