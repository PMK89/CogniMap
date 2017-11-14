import { Component, OnInit } from '@angular/core';
import { WindowService } from '../../shared/window.service';

@Component({
  selector: 'app-tb-navigation',
  templateUrl: './tb-navigation.component.html',
  styleUrls: ['./tb-navigation.component.scss']
})
export class TbNavigationComponent implements OnInit {

  constructor(private windowService: WindowService) { }

  ngOnInit() {
  }

  // Scrolls to starting point
  scrollStart() {
    this.windowService.scrollXY(5000, 100000);
  }

}
