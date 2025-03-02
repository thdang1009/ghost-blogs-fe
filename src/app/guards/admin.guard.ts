import { Injectable } from '@angular/core';

import { showNoti } from '@shared/common';
import { AuthService } from '@services/_index';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {

  constructor(private authService: AuthService) { }

  canActivate(): boolean {
    const isAdmin = this.authService.isAdmin();
    if (!isAdmin) {
      showNoti('Admin only features, please contact admin to upgrade your account', 'danger');
    }
    return isAdmin;
  }

}
