import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANT } from '@shared/constant';
import { LoginResponse, ghostLog, handleError } from '@shared/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { StorageService } from '@services/storage/storage.service';
import { ApiConfigService } from '@services/api-config/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  @Output() isLoggedIn: EventEmitter<any> = new EventEmitter();
  @Output() isAdminE: EventEmitter<any> = new EventEmitter();
  userInfo: any = {};
  loggedInStatus = false;
  redirectUrl: string | null = null;

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
      this.userInfo = JSON.parse(
        localStorage.getItem(CONSTANT.USER_INFO) || '{}'
      );
    }
  }

  isLogin() {
    return !!this.storageService.getItem(CONSTANT.USER_INFO);
  }

  login(data: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl + '/login', data, { withCredentials: true })
      .pipe(
        tap((resp: LoginResponse) => {
          this.handleLoginResponse(resp);
        }),
        catchError(handleError('login', []))
      );
  }

  handleLoginResponse(resp: LoginResponse) {
    this.loggedInStatus = true;
    this.userInfo = resp.data;
    this.isLoggedIn.emit(true);
    this.saveUserLoginInfo(resp.data); // <- before check isAdminE
    this.isAdminE.emit(this.isAdmin());

    // Use the stored redirect URL if available, otherwise use the returnUrl from query params
    const returnUrl =
      this.redirectUrl ||
      this.route.snapshot.queryParams['returnUrl'] ||
      '/admin/dashboard';
    this.redirectUrl = null; // Clear the stored URL
    this.router.navigateByUrl(returnUrl);
  }

  logout(): Observable<any> {
    return this.http
      .post<any>(this.apiUrl + '/logout', {}, { withCredentials: true })
      .pipe(
        tap(_ => {
          this.isLoggedIn.emit(false);
          this.loggedInStatus = false;
          this.userInfo = {}; // Clear userInfo immediately
          this.clearUserInfo(); // Clear localStorage
          this.isAdminE.emit(false); // Set to false since user is logged out
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        }),
        catchError(handleError('logout', []))
      );
  }

  changePassword(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/change-password', data).pipe(
      tap(_ => ghostLog('change password')),
      catchError(handleError('change password', []))
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/register', data).pipe(
      tap(_ => ghostLog('login')),
      catchError(handleError('login', []))
    );
  }

  confirmEmail(code: string) {
    return this.http.get<any>(this.apiUrl + `/confirm/${code}`).pipe(
      tap(_ => ghostLog('confirm email')),
      catchError(handleError('confirm email', []))
    );
  }

  // call reset
  resetPassword(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/reset-password', data).pipe(
      tap(_ => ghostLog('reset password')),
      catchError(handleError('reset password', []))
    );
  }

  // after receive redirect from email, call this to set new password
  setNewPassword(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/set-new-password', data).pipe(
      tap(_ => {
        tap(_ => ghostLog('set new password'));
      }),
      catchError(handleError('set new password', []))
    );
  }

  getUserInfo() {
    return this.userInfo;
  }

  isGrandAdmin() {
    const arr = [CONSTANT.PERMISSION.GRAND_ADMIN];
    return this.userInfo && arr.includes(this.userInfo.permission);
  }

  isAdmin() {
    const arr = [CONSTANT.PERMISSION.GRAND_ADMIN, CONSTANT.PERMISSION.ADMIN];
    return this.userInfo && arr.includes(this.userInfo.permission);
  }

  isMember() {
    const arr = [
      CONSTANT.PERMISSION.GRAND_ADMIN,
      CONSTANT.PERMISSION.ADMIN,
      CONSTANT.PERMISSION.MEMBER,
    ];
    return this.userInfo && arr.includes(this.userInfo.permission);
  }

  isGuest() {
    return true;
  }

  private saveUserLoginInfo(userInfo: any) {
    this.storageService.setItem(CONSTANT.USER_INFO, JSON.stringify(userInfo));
  }

  private clearUserInfo() {
    this.storageService.removeItem(CONSTANT.USER_INFO);
  }
}
