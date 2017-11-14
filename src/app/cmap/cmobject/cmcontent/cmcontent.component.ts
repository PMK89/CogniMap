import { Component, OnInit, Input } from '@angular/core';
import { CMContent } from '../../../models/content';

@Component({
  selector: 'app-cmcontent',
  templateUrl: './cmcontent.component.html',
  styleUrls: ['./cmcontent.component.scss']
})
export class CmcontentComponent implements OnInit {
  @Input() content: CMContent;
  imgsource: String;

  constructor() { }

  ngOnInit() {
    if (this.content.cat === 'i') {
      this.imgsource = 'assets/images/' + this.content.object;
    } else if (this.content.cat === 'l' || this.content.cat === 'p') {
      this.imgsource = 'assets/images/basic/empty.png';
    } else {
      this.imgsource = this.content.object;
    }
  }

}
