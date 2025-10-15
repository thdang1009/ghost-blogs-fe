import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap, filter, take } from 'rxjs/operators';
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
    // Log every request to track when token expires
    console.log('📤 [Request]', request.method, request.url);

    // For cookie-based authentication, we need to ensure credentials are included
    let modifiedRequest = request.clone({
      setHeaders: {
        Accept: 'application/json',
      },
      withCredentials: true, // This ensures cookies are sent with requests
    });

    // Only add Content-Type for non-GET requests and when not already set
    // Skip Content-Type for FormData uploads (multipart/form-data should be set automatically)
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
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('ghost event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        console.log('ghost error--->>>', error);

        if (error.status === 401) {
          // Check if this is a token expiration error or no token error
          const errorCode = error.error?.code;
          console.log('🔐 [Auth Debug] 401 Error received:', {
            url: request.url,
            errorCode: errorCode,
            errorMessage: error.error?.msg,
            fullError: error.error,
          });

          if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'NO_TOKEN') {
            console.log(
              '🔄 [Auth Debug] Token expired/missing, attempting refresh...'
            );
            return this.handle401Error(request, next);
          }

          // For other 401 errors (invalid token, user not found, etc.), logout immediately
          console.log(
            '⚠️ [Auth Debug] Non-recoverable 401 error, logging out:',
            errorCode
          );
          this.handleLogout();
        }

        if (error.status === 400) {
          // TODO document why this block is empty
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
      console.log('🔄 [Auth Debug] Starting token refresh process...');
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((response: any) => {
          console.log('✅ [Auth Debug] Token refresh successful:', {
            success: response.success,
            hasData: !!response.data,
            username: response.data?.username,
          });
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response);

          // Update user info if available in response
          if (response.data) {
            console.log('💾 [Auth Debug] Updating user info in localStorage');
            this.storageService.setItem(
              CONSTANT.USER_INFO,
              JSON.stringify(response.data)
            );
          }

          // Retry the original request with credentials
          console.log(
            '🔁 [Auth Debug] Retrying original request:',
            request.url
          );
          const retryRequest = request.clone({
            withCredentials: true,
          });
          return next.handle(retryRequest);
        }),
        catchError(err => {
          console.error('❌ [Auth Debug] Token refresh failed:', {
            status: err.status,
            error: err.error,
            message: err.message,
          });
          this.isRefreshing = false;
          this.handleLogout();
          return throwError(err);
        })
      );
    } else {
      // If refresh is in progress, wait for the new token
      console.log('⏳ [Auth Debug] Refresh already in progress, waiting...');
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => {
          console.log(
            '🔁 [Auth Debug] Refresh completed, retrying request:',
            request.url
          );
          const retryRequest = request.clone({
            withCredentials: true,
          });
          return next.handle(retryRequest);
        })
      );
    }
  }

  private refreshToken(): Observable<any> {
    const refreshUrl = this.apiConfigService.getApiUrl('/v1/auth/refresh');
    console.log('🔄 [Auth Debug] Calling refresh endpoint:', refreshUrl);
    console.log('🍪 [Auth Debug] Document cookies:', document.cookie);

    return this.http.post<any>(refreshUrl, {}, { withCredentials: true });
  }

  private handleLogout(): void {
    console.log('🚪 [Auth Debug] Logging out user...');
    // Store the current URL so user can return after re-login
    const currentUrl = this.router.url;
    const returnUrl =
      currentUrl && currentUrl !== '/login' && !currentUrl.startsWith('/login')
        ? currentUrl
        : null;

    console.log('🧹 [Auth Debug] Clearing user info and tokens');
    // Clear any stored user info and redirect to login
    this.storageService.removeItem(CONSTANT.USER_INFO);
    // for backward compatibility
    this.storageService.removeItem(CONSTANT.TOKEN);

    // Navigate to login with return URL if available
    if (returnUrl) {
      console.log(
        '🔙 [Auth Debug] Redirecting to login with returnUrl:',
        returnUrl
      );
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
    } else {
      console.log('🔙 [Auth Debug] Redirecting to login');
      this.router.navigate(['/login']);
    }
  }
}
