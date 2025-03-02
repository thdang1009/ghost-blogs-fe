import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-list-badge',
  templateUrl: './list-badge.component.html',
  styleUrls: ['./list-badge.component.css']
})
export class ListBadgeComponent implements OnInit {

  @Input() myStyles;
  constructor() {

  }

  ngOnInit(): void {
    if (!this.myStyles) {
      this.myStyles = {
        'margin': 'auto',
        'padding': '5px',
        'text-align': 'center',
      }
    }
  }

}
