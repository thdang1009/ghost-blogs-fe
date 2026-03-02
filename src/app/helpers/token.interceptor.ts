import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CONSTANT } from '@shared/constant';
import { StorageService } from '../services/storage/storage.service';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../services/api-config/api-config.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    private router: Router,
    private storageService: StorageService,
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let modifiedRequest = request.clone({
      setHeaders: {
        Accept: 'application/json',
      },
      withCredentials: true,
    });

    if (
      request.method !== 'GET' &&
      !request.headers.has('Content-Type') &&
      !(request.body instanceof FormData)
    ) {
      modifiedRequest = modifiedRequest.clone({
        setHeaders: {
          'Content-Type': 'application/json',
        },
      });
    }

    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const errorCode = error.error?.code;

          if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'NO_TOKEN') {
            return this.handle401Error(request, next);
          }

          this.handleLogout();
        }

        return throwError(error);
      })
    );
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response);

          if (response.data) {
            this.storageService.setItem(
              CONSTANT.USER_INFO,
              JSON.stringify(response.data)
            );
          }

          const retryRequest = request.clone({ withCredentials: true });
          return next.handle(retryRequest);
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          // Only force logout if the user has no session at all.
          // If USER_INFO is still in storage the cookie may simply not have
          // propagated yet (race condition right after login); let the
          // original error bubble up instead of kicking the user out.
          const hasSession = !!this.storageService.getItem(CONSTANT.USER_INFO);
          if (!hasSession) {
            this.handleLogout();
          }
          return throwError(err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => {
          const retryRequest = request.clone({ withCredentials: true });
          return next.handle(retryRequest);
        })
      );
    }
  }

  private refreshToken(): Observable<any> {
    const refreshUrl = this.apiConfigService.getApiUrl('/v1/auth/refresh');
    return this.http.post<any>(refreshUrl, {}, { withCredentials: true });
  }

  private handleLogout(): void {
    const currentUrl = this.router.url;
    const returnUrl =
      currentUrl && currentUrl !== '/login' && !currentUrl.startsWith('/login')
        ? currentUrl
        : null;

    this.storageService.removeItem(CONSTANT.USER_INFO);

    if (returnUrl) {
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
