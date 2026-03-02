import { TestBed } from '@angular/core/testing';
import { AuthStateService } from './auth-state.service';
import { AuthUserData } from '@models/_index';

const adminUser: AuthUserData = {
  id: 1,
  fullName: 'Admin User',
  username: 'admin',
  permission: 'ADMIN',
};

const grandAdminUser: AuthUserData = {
  id: 2,
  fullName: 'Grand Admin',
  username: 'grandadmin',
  permission: 'GRAND_ADMIN',
};

const memberUser: AuthUserData = {
  id: 3,
  fullName: 'Member User',
  username: 'member',
  permission: 'MEMBER',
};

describe('AuthStateService', () => {
  let service: AuthStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Initial state ─────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('user() should be null', () => {
      expect(service.user()).toBeNull();
    });

    it('isLoggedIn() should be false', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('isAdmin() should be false', () => {
      expect(service.isAdmin()).toBeFalse();
    });

    it('isGrandAdmin() should be false', () => {
      expect(service.isGrandAdmin()).toBeFalse();
    });
  });

  // ── setUser ───────────────────────────────────────────────────────────────────

  describe('setUser()', () => {
    it('sets isLoggedIn to true', () => {
      service.setUser(memberUser);
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('exposes the correct user', () => {
      service.setUser(adminUser);
      expect(service.user()?.username).toBe('admin');
    });

    it('sets isAdmin to true for ADMIN permission', () => {
      service.setUser(adminUser);
      expect(service.isAdmin()).toBeTrue();
    });

    it('sets isAdmin to true for GRAND_ADMIN permission', () => {
      service.setUser(grandAdminUser);
      expect(service.isAdmin()).toBeTrue();
    });

    it('sets isAdmin to false for MEMBER permission', () => {
      service.setUser(memberUser);
      expect(service.isAdmin()).toBeFalse();
    });

    it('sets isGrandAdmin to true only for GRAND_ADMIN', () => {
      service.setUser(grandAdminUser);
      expect(service.isGrandAdmin()).toBeTrue();

      service.setUser(adminUser);
      expect(service.isGrandAdmin()).toBeFalse();
    });
  });

  // ── clearUser ─────────────────────────────────────────────────────────────────

  describe('clearUser()', () => {
    it('resets all state to initial values', () => {
      service.setUser(adminUser);
      service.clearUser();

      expect(service.user()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.isAdmin()).toBeFalse();
      expect(service.isGrandAdmin()).toBeFalse();
    });
  });
});
