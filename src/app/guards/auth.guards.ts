import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/_index';
import { AlertService } from '@services/_index';

export const loginGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLogin()) return true;

  authService.redirectUrl = state.url;
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

export const notLoginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return !authService.isLogin();
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);

  if (authService.isAdmin()) return true;

  alertService.error(
    'Admin only features, please contact admin to upgrade your account'
  );
  return false;
};

export const grandAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isGrandAdmin();
};
