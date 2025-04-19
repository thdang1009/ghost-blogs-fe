import { Injectable } from '@angular/core';

import { AuthService } from '@services/_index';
import { AlertService } from '@services/_index';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {

  constructor(private authService: AuthService, private alertService: AlertService) { }

  canActivate(): boolean {
    const isAdmin = this.authService.isAdmin();
    if (!isAdmin) {
      this.alertService.error('Admin only features, please contact admin to upgrade your account');
    }
    return isAdmin;
  }

}
