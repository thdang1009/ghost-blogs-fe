import { Component, OnInit, Renderer2 } from '@angular/core';
import { openNewTab } from '@shared/common';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.scss']
})
export class DonationComponent implements OnInit {
  private readonly buyMeCoffeeUrl = 'https://www.buymeacoffee.com/thdang1009';

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    // No longer auto-open the tab
  }

  /**
   * Opens the Buy Me a Coffee page in a new tab and focuses on it
   */
  openBuyMeCoffee(): void {
    openNewTab(this.renderer, this.buyMeCoffeeUrl);
  }
}
