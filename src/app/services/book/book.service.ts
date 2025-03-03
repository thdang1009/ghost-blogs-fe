import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Book } from '@models/_index';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  bookInfo: any = {};
  loggedInStatus = false;
  redirectUrl: string = '';

  constructor(private http: HttpClient) { }

  getBook(id: string): Observable<Book> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<Book>(url).pipe(
      tap(_ => ghostLog(`fetched my book`)),
      catchError(handleError<Book>(`getMyBook`))
    );
  }

  getBooks(): Observable<Book[]> {
    const url = `${apiUrl}`;
    return this.http.get<Book[]>(url).pipe(
      tap(_ => ghostLog(`fetched my book`)),
      catchError(handleError<Book[]>(`getMyBook`))
    );
  }

  addBook(item: Book): Observable<Book> {
    return this.http.post<Book>(apiUrl, item).pipe(
      tap((prod: Book) => ghostLog(`added book`)),
      catchError(handleError<Book>('addBook'))
    );
  }

  updateBook(id: any, item: Book): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, item).pipe(
      tap(_ => ghostLog(`updated item id=${id}`)),
      catchError(handleError<any>('updateBook'))
    );
  }

  deleteBook(id: any): Observable<Book> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<Book>(url).pipe(
      tap(_ => ghostLog(`deleted item id=${id}`)),
      catchError(handleError<Book>('deleteBook'))
    );
  }
}
