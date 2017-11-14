import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ElementService } from'../element.service';

// models and reducers
import { CMButton } from '../../models/CMButton';

@Component({
  selector: 'app-s-button',
  templateUrl: './s-button.component.html',
  styleUrls: ['./s-button.component.css']
})
export class SButtonComponent implements OnInit {
  @Input() buttons: Observable<Array<CMButton>>;
  @Input() selector: number;

  constructor(private elementService: ElementService) { }

  ngOnInit() {
  }

  clicked(button) {
    this.elementService.changeElement(button);
  }
}
