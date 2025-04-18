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
import { CONSTANT } from '@shared/constant';
import { StorageService } from '../services/storage/storage.service';
import { AlertService } from '@services/_index';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private storageService: StorageService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.storageService.getItem(CONSTANT.TOKEN);
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
        console.log('ghost error--->>>', error);
        if (error.status === 401) {
          this.router.navigate(['login']);
        }
        if (error.status === 400) {
          // TODO document why this block is empty
        }
        return throwError(error);
      }));
  }

}
