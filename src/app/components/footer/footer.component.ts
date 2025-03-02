import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/_index';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
  isLogined = false;
  isLoadingResults = true;
  thisYear = (new Date).getFullYear();

  constructor(
    private authService: AuthService) {
  }

  ngOnInit() {
    this.isLogined = this.authService.isLogin();
  }

}
