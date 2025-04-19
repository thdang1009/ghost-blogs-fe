import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, AlertService } from '@services/_index';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isAdmin = this.authService.isAdmin();
    if (isAdmin) {
      return true;
    }
    this.alertService.showNoti('Admin only features, please contact admin to upgrade your account', 'danger');
    this.router.navigate(['/home']);
    return false;
  }
}
