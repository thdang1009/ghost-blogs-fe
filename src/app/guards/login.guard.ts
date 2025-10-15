import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '@services/_index';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const logined = this.authService.isLogin();

    if (!logined) {
      console.log(
        '🔒 LoginGuard: User not logged in, redirecting to login with returnUrl:',
        state.url
      );
      // Store the attempted URL for redirecting
      this.authService.redirectUrl = state.url;
      // Redirect to login page instead of home
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    return true;
  }
}
