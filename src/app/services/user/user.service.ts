import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { User } from '@models/_index';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  cacheUser: any = [];
  loggedInStatus = false;
  redirectUrl!: string;


  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(apiUrl)
      .pipe(
        tap(_ => {
          ghostLog('fetched Users');
        }),
        catchError(handleError('getUser', []))
      );
  }

  getUser(id: any): Observable<User> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<User>(url).pipe(
      tap(_ => ghostLog(`fetched user by id=${id}`)),
      catchError(handleError<User>(`getUser id=${id}`))
    );
  }

  addUser(tdtd: User): Observable<User> {
    return this.http.post<User>(apiUrl, tdtd).pipe(
      tap((prod: User) => ghostLog(`added user id=${tdtd.id}`)),
      catchError(handleError<User>('addUser'))
    );
  }

  updateUser(id: any, tdtd: User): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, tdtd).pipe(
      tap(_ => ghostLog(`updated tdtd id=${id}`)),
      catchError(handleError<any>('updateUser'))
    );
  }

  deleteUser(id: any): Observable<User> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<User>(url).pipe(
      tap(_ => ghostLog(`deleted tdtd id=${id}`)),
      catchError(handleError<User>('deleteUser'))
    );
  }

  private initCacheUser() {
    this.getUsers().subscribe(users => {
      this.cacheUser = users;
    });
  }

  mapUserName(id: any) {
    if (!this.cacheUser || this.cacheUser.length === 0) {
      this.initCacheUser();
    }
    const get = (this.cacheUser.filter((user: User) => user.id === id)[0] || {});
    return get.fullName || '';
  }
}
