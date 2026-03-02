import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANT } from '@shared/constant';
import { ghostLog, handleError } from '@shared/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { StorageService } from '@services/storage/storage.service';
import { ApiConfigService } from '@services/api-config/api-config.service';
import { AuthStateService } from './auth-state.service';
import {
  AuthUserData,
  LoginCredentials,
  ChangePasswordPayload,
  ResetPasswordPayload,
  SetNewPasswordPayload,
  RegisterPayload,
  LoginApiResponse,
  ApiResponse,
} from '@models/_index';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authState = inject(AuthStateService);

  loggedInStatus = false;
  redirectUrl: string | null = null;

  // Re-expose signals for backward-compat with existing template bindings
  readonly isLoggedIn = this.authState.isLoggedIn;
  readonly isAdminSignal = this.authState.isAdmin;

  private get apiUrl(): string {
    return this.apiConfigService.getApiUrl('/v1/auth');
  }

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private storageService: StorageService,
    private apiConfigService: ApiConfigService
  ) {
    this.loggedInStatus = this.isLogin();
    if (this.loggedInStatus && isPlatformBrowser(this.platformId)) {
      const stored = JSON.parse(
        localStorage.getItem(CONSTANT.USER_INFO) || '{}'
      );
      this.authState.setUser(stored);
    }
  }

  isLogin(): boolean {
    return !!this.storageService.getItem(CONSTANT.USER_INFO);
  }

  login(
    data: LoginCredentials
  ): Observable<LoginApiResponse | LoginCredentials[]> {
    return this.http
      .post<LoginApiResponse>(this.apiUrl + '/login', data, {
        withCredentials: true,
      })
      .pipe(
        tap((resp: LoginApiResponse) => {
          this.handleLoginResponse(resp);
        }),
        catchError(handleError<LoginCredentials[]>('login', []))
      );
  }

  handleLoginResponse(resp: LoginApiResponse): void {
    this.loggedInStatus = true;
    this.saveUserLoginInfo(resp.data);
    this.authState.setUser(resp.data);

    let returnUrl = this.redirectUrl || '/admin/dashboard';

    if (!this.redirectUrl) {
      const returnUrlParam = this.router.parseUrl(this.router.url).queryParams[
        'returnUrl'
      ];
      if (returnUrlParam) {
        returnUrl = returnUrlParam;
      }
    }

    this.redirectUrl = null;
    this.router.navigateByUrl(returnUrl);
  }

  logout(): Observable<ApiResponse<unknown>> {
    return this.http
      .post<
        ApiResponse<unknown>
      >(this.apiUrl + '/logout', {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearLocalSession();
          setTimeout(() => this.router.navigate(['/login']), 1000);
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.clearLocalSession();
            setTimeout(() => this.router.navigate(['/login']), 500);
            return of({ status: 'success', data: { success: true } });
          }
          console.error('logout failed', error);
          return of({
            status: 'error',
            data: { success: false, msg: error.message },
          });
        })
      );
  }

  private clearLocalSession(): void {
    this.loggedInStatus = false;
    this.clearUserInfo();
    this.authState.clearUser();
  }

  changePassword(
    data: ChangePasswordPayload
  ): Observable<ApiResponse<unknown> | unknown[]> {
    return this.http
      .post<ApiResponse<unknown>>(this.apiUrl + '/change-password', data)
      .pipe(
        tap(() => ghostLog('change password')),
        catchError(handleError<unknown[]>('change password', []))
      );
  }

  register(
    data: RegisterPayload
  ): Observable<ApiResponse<AuthUserData> | unknown[]> {
    return this.http
      .post<ApiResponse<AuthUserData>>(this.apiUrl + '/register', data)
      .pipe(
        tap(() => ghostLog('register')),
        catchError(handleError<unknown[]>('register', []))
      );
  }

  confirmEmail(code: string): Observable<ApiResponse<unknown> | unknown[]> {
    return this.http
      .get<ApiResponse<unknown>>(this.apiUrl + `/confirm/${code}`)
      .pipe(
        tap(() => ghostLog('confirm email')),
        catchError(handleError<unknown[]>('confirm email', []))
      );
  }

  resetPassword(
    data: ResetPasswordPayload
  ): Observable<ApiResponse<unknown> | unknown[]> {
    return this.http
      .post<ApiResponse<unknown>>(this.apiUrl + '/reset-password', data)
      .pipe(
        tap(() => ghostLog('reset password')),
        catchError(handleError<unknown[]>('reset password', []))
      );
  }

  setNewPassword(
    data: SetNewPasswordPayload
  ): Observable<ApiResponse<unknown> | unknown[]> {
    return this.http
      .post<ApiResponse<unknown>>(this.apiUrl + '/set-new-password', data)
      .pipe(
        tap(() => ghostLog('set new password')),
        catchError(handleError<unknown[]>('set new password', []))
      );
  }

  getUserInfo(): AuthUserData | null {
    return this.authState.user();
  }

  isGrandAdmin(): boolean {
    const user = this.authState.user();
    return !!(user && user.permission === CONSTANT.PERMISSION.GRAND_ADMIN);
  }

  isAdmin(): boolean {
    const user = this.authState.user();
    const roles = [CONSTANT.PERMISSION.GRAND_ADMIN, CONSTANT.PERMISSION.ADMIN];
    return !!(user && roles.includes(user.permission!));
  }

  isMember(): boolean {
    const user = this.authState.user();
    const roles = [
      CONSTANT.PERMISSION.GRAND_ADMIN,
      CONSTANT.PERMISSION.ADMIN,
      CONSTANT.PERMISSION.MEMBER,
    ];
    return !!(user && roles.includes(user.permission!));
  }

  isGuest(): boolean {
    return true;
  }

  private saveUserLoginInfo(userInfo: AuthUserData): void {
    this.storageService.setItem(CONSTANT.USER_INFO, JSON.stringify(userInfo));
  }

  private clearUserInfo(): void {
    this.storageService.removeItem(CONSTANT.USER_INFO);
  }

  refreshToken(): Observable<ApiResponse<AuthUserData> | unknown[]> {
    return this.http
      .post<
        ApiResponse<AuthUserData>
      >(this.apiUrl + '/refresh', {}, { withCredentials: true })
      .pipe(
        tap((resp: ApiResponse<AuthUserData>) => {
          if (resp.status === 'success' && resp.data) {
            this.saveUserLoginInfo(resp.data);
            this.authState.setUser(resp.data);
          }
        }),
        catchError(handleError<unknown[]>('refresh token', []))
      );
  }
}
