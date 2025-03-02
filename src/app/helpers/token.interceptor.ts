import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { showNoti } from '@shared/common';
import { CONSTANT } from '@shared/constant';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem(CONSTANT.TOKEN);
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: token
        }
      });
    }
    request = request.clone({
      headers: request.headers.set('Accept', 'application/json')
    });
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('ghost event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.status === 401) {
          this.router.navigate(['login']);
        }
        if (error.status === 400) {
          // TODO document why this block is empty
        }
        showNoti(`Error: ${error.error.msg || error.message}`, 'danger');
        return throwError(error);
      }));
  }

}
