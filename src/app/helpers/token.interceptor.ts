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
    // Configure request to include cookies for authentication
    request = request.clone({
      setHeaders: {
        Accept: 'application/json',
      },
      withCredentials: true, // This ensures cookies are sent with requests
    });
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('ghost event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        console.log('ghost error--->>>', error);
        if (error.status === 401) {
          this.router.navigate(['login']);
        }
        if (error.status === 400) {
          // TODO document why this block is empty
        }
        return throwError(error);
      })
    );
  }
}
