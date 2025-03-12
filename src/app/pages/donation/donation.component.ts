import { Component, OnInit, Renderer2 } from '@angular/core';
import { openNewTab } from '@shared/common';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.scss']
})
export class DonationComponent implements OnInit {

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    const url = 'https://www.buymeacoffee.com/thdang1009';
    openNewTab(this.renderer, url);
  }

}
