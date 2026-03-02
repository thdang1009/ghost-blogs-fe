import { Injectable, computed, signal } from '@angular/core';
import { AuthState, AuthUserData } from '@models/_index';
import { CONSTANT } from '@shared/constant';

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  isGrandAdmin: false,
};

/**
 * Signal-based auth state service.
 * Single source of truth for authentication status across the app.
 * Components read from computed signals; AuthService drives mutations.
 */
@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly _state = signal<AuthState>(initialState);

  /** Current authenticated user, or null if not logged in */
  readonly user = computed(() => this._state().user);

  /** True when a valid session exists */
  readonly isLoggedIn = computed(() => this._state().isLoggedIn);

  /** True when the current user has admin or grand-admin role */
  readonly isAdmin = computed(() => this._state().isAdmin);

  /** True when the current user has grand-admin role */
  readonly isGrandAdmin = computed(() => this._state().isGrandAdmin);

  setUser(user: AuthUserData): void {
    this._state.update(() => ({
      user,
      isLoggedIn: true,
      isAdmin: this._hasAdminRole(user),
      isGrandAdmin: user.permission === CONSTANT.PERMISSION.GRAND_ADMIN,
    }));
  }

  clearUser(): void {
    this._state.set(initialState);
  }

  private _hasAdminRole(user: AuthUserData): boolean {
    return (
      user.permission === CONSTANT.PERMISSION.ADMIN ||
      user.permission === CONSTANT.PERMISSION.GRAND_ADMIN
    );
  }
}
