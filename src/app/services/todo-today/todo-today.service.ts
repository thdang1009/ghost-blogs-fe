import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TodoToday } from '@models/_index';
import { environment } from '@environments/environment';
import { buildQueryString, ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/todotoday';

@Injectable({
  providedIn: 'root'
})
export class TodoTodayService {

  constructor(private http: HttpClient) { }

  getTodoTodays(): Observable<TodoToday[]> {
    return this.http.get<TodoToday[]>(apiUrl)
      .pipe(
        tap(_ => ghostLog('fetched Todo Todays')),
        catchError(handleError('getTodoTodays', []))
      );
  }

  getTodoToday(id: any): Observable<TodoToday> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<TodoToday>(url).pipe(
      tap(_ => ghostLog(`fetched tdtd by id=${id}`)),
      catchError(handleError<TodoToday>(`getTodoToday id=${id}`))
    );
  }

  getMyTodoToday(req: any): Observable<TodoToday> {
    const queryString = buildQueryString(req);
    const url = `${apiUrl}/my-tdtd?${queryString}`;
    return this.http.get<TodoToday>(url).pipe(
      tap(_ => ghostLog(`fetched my tdtd`)),
      catchError(handleError<TodoToday>(`getMyTodoToday`))
    );
  }

  addTodoToday(tdtd: TodoToday): Observable<TodoToday> {
    return this.http.post<TodoToday>(apiUrl, tdtd).pipe(
      tap((prod: TodoToday) => ghostLog(`added tdtd id=${tdtd.id}`)),
      catchError(handleError<TodoToday>('addTodoToday'))
    );
  }

  updateTodoToday(id: any, tdtd: TodoToday): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, tdtd).pipe(
      tap(_ => ghostLog(`updated tdtd id=${id}`)),
      catchError(handleError<any>('updateTodoToday'))
    );
  }

  deleteTodoToday(id: any): Observable<TodoToday> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<TodoToday>(url).pipe(
      tap(_ => ghostLog(`deleted tdtd id=${id}`)),
      catchError(handleError<TodoToday>('deleteTodoToday'))
    );
  }
}
