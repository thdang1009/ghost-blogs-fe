import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CONSTANT } from '@shared/constant';
import { StorageService } from '../services/storage/storage.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private storageService: StorageService
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
          // Clear any stored user info and redirect to login
          this.storageService.removeItem(CONSTANT.USER_INFO);
          // for backward compatibility
          this.storageService.removeItem(CONSTANT.TOKEN);
          this.router.navigate(['/login']);
        }

        if (error.status === 400) {
          // TODO document why this block is empty
        }

        return throwError(error);
      })
    );
  }
}
