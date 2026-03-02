import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { AuthStateService } from './auth-state.service';
import { StorageService } from '../storage/storage.service';
import {
  LoginCredentials,
  LoginApiResponse,
  AuthUserData,
} from '@models/_index';

const BASE_URL = 'http://localhost:3000/v1/auth';

const mockUserData: AuthUserData = {
  id: 1,
  _id: 'abc123',
  fullName: 'Test Admin',
  username: 'testadmin',
  permission: 'ADMIN',
  status: 'ACTIVE',
};

const mockLoginResponse: LoginApiResponse = {
  status: 'success',
  token: 'jwt-token-abc',
  data: mockUserData,
};

describe('AuthService', () => {
  let service: AuthService;
  let authState: AuthStateService;
  let httpMock: HttpTestingController;
  let storageSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('StorageService', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    storageSpy.getItem.and.returnValue(null); // not logged in by default

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
      ],
      providers: [
        AuthService,
        AuthStateService,
        { provide: StorageService, useValue: storageSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    authState = TestBed.inject(AuthStateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── Construction ────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with isLoggedIn = false when storage has no user', () => {
    storageSpy.getItem.and.returnValue(null);
    expect(service.isLogin()).toBeFalse();
  });

  it('should detect existing session from storage on construction', () => {
    storageSpy.getItem.and.returnValue(JSON.stringify(mockUserData));
    // Re-create service after configuring the spy
    const freshService = TestBed.inject(AuthService);
    expect(freshService.isLogin()).toBeTrue();
  });

  // ── isLogin ─────────────────────────────────────────────────────────────────

  describe('isLogin()', () => {
    it('returns true when USER_INFO is in storage', () => {
      storageSpy.getItem.and.returnValue('{"id":1}');
      expect(service.isLogin()).toBeTrue();
    });

    it('returns false when USER_INFO is absent from storage', () => {
      storageSpy.getItem.and.returnValue(null);
      expect(service.isLogin()).toBeFalse();
    });
  });

  // ── login ────────────────────────────────────────────────────────────────────

  describe('login()', () => {
    const credentials: LoginCredentials = {
      username: 'testadmin',
      password: 'secret123',
    };

    it('should POST to /v1/auth/login with credentials', () => {
      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockLoginResponse);
    });

    it('should update AuthStateService on successful login', fakeAsync(() => {
      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/login`);
      req.flush(mockLoginResponse);
      tick(100); // allow setTimeout in handleLoginResponse

      expect(authState.isLoggedIn()).toBeTrue();
      expect(authState.isAdmin()).toBeTrue();
      expect(authState.user()?.username).toBe('testadmin');
    }));

    it('should save user info to storage on successful login', fakeAsync(() => {
      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/login`);
      req.flush(mockLoginResponse);
      tick(100);

      expect(storageSpy.setItem).toHaveBeenCalled();
    }));

    it('should return empty array on login error', () => {
      let result: unknown;
      service.login(credentials).subscribe(r => (result = r));

      const req = httpMock.expectOne(`${BASE_URL}/login`);
      req.error(new ErrorEvent('Network error'));

      expect(result as unknown[]).toEqual([]);
    });
  });

  // ── logout ───────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should POST to /v1/auth/logout', () => {
      service.logout().subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({ status: 'success', data: {} });
    });

    it('should clear auth state on successful logout', fakeAsync(() => {
      // Seed a logged-in state first
      authState.setUser(mockUserData);

      service.logout().subscribe();
      const req = httpMock.expectOne(`${BASE_URL}/logout`);
      req.flush({ status: 'success', data: {} });
      tick(1100);

      expect(authState.isLoggedIn()).toBeFalse();
      expect(storageSpy.removeItem).toHaveBeenCalled();
    }));

    it('should treat a 401 response as a successful logout', fakeAsync(() => {
      authState.setUser(mockUserData);
      let result: unknown;

      service.logout().subscribe(r => (result = r));
      const req = httpMock.expectOne(`${BASE_URL}/logout`);
      req.flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' }
      );
      tick(600);

      expect(authState.isLoggedIn()).toBeFalse();
      expect(
        (result as { data: { success: boolean } }).data.success
      ).toBeTrue();
    }));
  });

  // ── changePassword ────────────────────────────────────────────────────────────

  describe('changePassword()', () => {
    it('should POST to /v1/auth/change-password', () => {
      service
        .changePassword({ oldPassword: 'old', password: 'new' })
        .subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/change-password`);
      expect(req.request.method).toBe('POST');
      req.flush({ status: 'success', data: {} });
    });

    it('should return empty array on error', () => {
      let result: unknown;
      service
        .changePassword({ oldPassword: 'old', password: 'new' })
        .subscribe(r => (result = r));

      const req = httpMock.expectOne(`${BASE_URL}/change-password`);
      req.error(new ErrorEvent('Network error'));

      expect(result as unknown[]).toEqual([]);
    });
  });

  // ── register ──────────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('should POST to /v1/auth/register', () => {
      service
        .register({
          fullName: 'New User',
          username: 'newuser',
          password: 'pass123',
        })
        .subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/register`);
      expect(req.request.method).toBe('POST');
      req.flush({ status: 'success', data: mockUserData });
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────────

  describe('refreshToken()', () => {
    it('should POST to /v1/auth/refresh', () => {
      service.refreshToken().subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush({ status: 'success', data: mockUserData });
    });

    it('should update stored user on successful refresh', () => {
      service.refreshToken().subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/refresh`);
      req.flush({ status: 'success', data: mockUserData });

      expect(storageSpy.setItem).toHaveBeenCalled();
      expect(authState.user()?.username).toBe('testadmin');
    });

    it('should return empty array on refresh failure', () => {
      let result: unknown;
      service.refreshToken().subscribe(r => (result = r));

      const req = httpMock.expectOne(`${BASE_URL}/refresh`);
      req.error(new ErrorEvent('Network error'));

      expect(result as unknown[]).toEqual([]);
    });
  });

  // ── role checks ───────────────────────────────────────────────────────────────

  describe('role checks', () => {
    it('isAdmin() returns true for ADMIN permission', () => {
      service.userInfo = { ...mockUserData, permission: 'ADMIN' };
      expect(service.isAdmin()).toBeTrue();
    });

    it('isAdmin() returns true for GRAND_ADMIN permission', () => {
      service.userInfo = { ...mockUserData, permission: 'GRAND_ADMIN' };
      expect(service.isAdmin()).toBeTrue();
    });

    it('isAdmin() returns false for MEMBER permission', () => {
      service.userInfo = { ...mockUserData, permission: 'MEMBER' };
      expect(service.isAdmin()).toBeFalse();
    });

    it('isGrandAdmin() returns true only for GRAND_ADMIN', () => {
      service.userInfo = { ...mockUserData, permission: 'GRAND_ADMIN' };
      expect(service.isGrandAdmin()).toBeTrue();

      service.userInfo = { ...mockUserData, permission: 'ADMIN' };
      expect(service.isGrandAdmin()).toBeFalse();
    });

    it('isGuest() always returns true', () => {
      expect(service.isGuest()).toBeTrue();
    });
  });
});
