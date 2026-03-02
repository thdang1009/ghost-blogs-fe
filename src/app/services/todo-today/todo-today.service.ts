import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TodoToday } from '@models/_index';
import { environment } from '@environments/environment';
import { buildQueryString, ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/todotoday';

export interface TodoTodayQueryParams {
  date?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TodoTodayService {
  constructor(private http: HttpClient) {}

  getTodoTodays(): Observable<TodoToday[]> {
    return this.http.get<TodoToday[]>(apiUrl).pipe(
      tap(() => ghostLog('fetched Todo Todays')),
      catchError(handleError<TodoToday[]>('getTodoTodays', []))
    );
  }

  getTodoToday(id: string | number): Observable<TodoToday> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<TodoToday>(url).pipe(
      tap(() => ghostLog(`fetched tdtd by id=${id}`)),
      catchError(handleError<TodoToday>(`getTodoToday id=${id}`))
    );
  }

  getMyTodoToday(req: TodoTodayQueryParams): Observable<TodoToday> {
    const queryString = buildQueryString(req);
    const url = `${apiUrl}/my-tdtd?${queryString}`;
    return this.http.get<TodoToday>(url).pipe(
      tap(() => ghostLog(`fetched my tdtd`)),
      catchError(handleError<TodoToday>(`getMyTodoToday`))
    );
  }

  addTodoToday(tdtd: TodoToday): Observable<TodoToday> {
    return this.http.post<TodoToday>(apiUrl, tdtd).pipe(
      tap(() => ghostLog(`added tdtd id=${tdtd.id}`)),
      catchError(handleError<TodoToday>('addTodoToday'))
    );
  }

  updateTodoToday(id: string | number, tdtd: TodoToday): Observable<TodoToday> {
    const url = `${apiUrl}/${id}`;
    return this.http.put<TodoToday>(url, tdtd).pipe(
      tap(() => ghostLog(`updated tdtd id=${id}`)),
      catchError(handleError<TodoToday>('updateTodoToday'))
    );
  }

  deleteTodoToday(id: string | number): Observable<TodoToday> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<TodoToday>(url).pipe(
      tap(() => ghostLog(`deleted tdtd id=${id}`)),
      catchError(handleError<TodoToday>('deleteTodoToday'))
    );
  }
}
