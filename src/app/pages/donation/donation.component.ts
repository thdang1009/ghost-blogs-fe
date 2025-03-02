import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.scss']
})
export class DonationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    window.open('https://www.buymeacoffee.com/thdang1009', '_blank');
  }

}
