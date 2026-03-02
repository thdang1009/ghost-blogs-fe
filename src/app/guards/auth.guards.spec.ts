import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  loginGuard,
  notLoginGuard,
  adminGuard,
  grandAdminGuard,
} from './auth.guards';
import { AuthService } from '@services/_index';
import { AlertService } from '@services/_index';

function runGuard<T>(
  guardFn: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => T,
  route: Partial<ActivatedRouteSnapshot> = {},
  state: Partial<RouterStateSnapshot> = { url: '/protected' }
): T {
  return TestBed.runInInjectionContext(() =>
    guardFn(route as ActivatedRouteSnapshot, state as RouterStateSnapshot)
  );
}

describe('Functional Guards', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isLogin',
      'isAdmin',
      'isGrandAdmin',
    ]);
    alertServiceSpy = jasmine.createSpyObj('AlertService', ['error']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy },
      ],
    });

    router = TestBed.inject(Router);
  });

  // ── loginGuard ────────────────────────────────────────────────────────────────

  describe('loginGuard', () => {
    it('returns true when user is logged in', () => {
      authServiceSpy.isLogin.and.returnValue(true);
      const result = runGuard(loginGuard);
      expect(result).toBeTrue();
    });

    it('returns a UrlTree redirecting to /login when not logged in', () => {
      authServiceSpy.isLogin.and.returnValue(false);
      const result = runGuard(loginGuard, {}, { url: '/admin/dashboard' });
      expect(result instanceof UrlTree).toBeTrue();
      expect((result as UrlTree).toString()).toContain('login');
    });

    it('sets returnUrl query param to the attempted URL', () => {
      authServiceSpy.isLogin.and.returnValue(false);
      const result = runGuard(
        loginGuard,
        {},
        { url: '/admin/posts' }
      ) as UrlTree;
      expect(result.queryParams['returnUrl']).toBe('/admin/posts');
    });

    it('stores redirectUrl on AuthService before redirecting', () => {
      authServiceSpy.isLogin.and.returnValue(false);
      runGuard(loginGuard, {}, { url: '/admin/posts' });
      expect(authServiceSpy.redirectUrl).toBe('/admin/posts');
    });
  });

  // ── notLoginGuard ─────────────────────────────────────────────────────────────

  describe('notLoginGuard', () => {
    it('returns true when user is NOT logged in', () => {
      authServiceSpy.isLogin.and.returnValue(false);
      const result = runGuard(notLoginGuard);
      expect(result).toBeTrue();
    });

    it('returns false when user IS logged in', () => {
      authServiceSpy.isLogin.and.returnValue(true);
      const result = runGuard(notLoginGuard);
      expect(result).toBeFalse();
    });
  });

  // ── adminGuard ────────────────────────────────────────────────────────────────

  describe('adminGuard', () => {
    it('returns true when user is admin', () => {
      authServiceSpy.isAdmin.and.returnValue(true);
      const result = runGuard(adminGuard);
      expect(result).toBeTrue();
    });

    it('returns false and shows error alert when user is not admin', () => {
      authServiceSpy.isAdmin.and.returnValue(false);
      const result = runGuard(adminGuard);
      expect(result).toBeFalse();
      expect(alertServiceSpy.error).toHaveBeenCalledWith(
        jasmine.stringContaining('Admin only')
      );
    });
  });

  // ── grandAdminGuard ───────────────────────────────────────────────────────────

  describe('grandAdminGuard', () => {
    it('returns true when user is grand admin', () => {
      authServiceSpy.isGrandAdmin.and.returnValue(true);
      const result = runGuard(grandAdminGuard);
      expect(result).toBeTrue();
    });

    it('returns false when user is not grand admin', () => {
      authServiceSpy.isGrandAdmin.and.returnValue(false);
      const result = runGuard(grandAdminGuard);
      expect(result).toBeFalse();
    });
  });
});
