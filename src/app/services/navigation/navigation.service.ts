import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private router: Router
  ) { }

  gotoHome() {
    this.router.navigate(['home']);
  }

  gotoLogin() {
    this.router.navigate(['login'], { queryParams: { fromRegister: true } });
  }
}
