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
    // For cookie-based authentication, we need to ensure credentials are included
    let modifiedRequest = request.clone({
      setHeaders: {
        Accept: 'application/json',
      },
      withCredentials: true, // This ensures cookies are sent with requests
    });

    // Only add Content-Type for non-GET requests and when not already set
    if (request.method !== 'GET' && !request.headers.has('Content-Type')) {
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
          // Check if this is a token expiration error
          const errorCode = error.error?.code;

          if (errorCode === 'TOKEN_EXPIRED') {
            return this.handle401Error(request, next);
          }

          // For other 401 errors (invalid token, no token, etc.), logout immediately
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
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response);

          // Update user info if available in response
          if (response.data) {
            this.storageService.setItem(
              CONSTANT.USER_INFO,
              JSON.stringify(response.data)
            );
          }

          // Retry the original request
          return next.handle(request);
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.handleLogout();
          return throwError(err);
        })
      );
    } else {
      // If refresh is in progress, wait for the new token
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => next.handle(request))
      );
    }
  }

  private refreshToken(): Observable<any> {
    return this.http.post<any>(
      this.apiConfigService.getApiUrl('/v1/auth/refresh'),
      {},
      { withCredentials: true }
    );
  }

  private handleLogout(): void {
    // Clear any stored user info and redirect to login
    this.storageService.removeItem(CONSTANT.USER_INFO);
    // for backward compatibility
    this.storageService.removeItem(CONSTANT.TOKEN);
    this.router.navigate(['/login']);
  }
}
