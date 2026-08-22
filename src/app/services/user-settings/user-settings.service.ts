import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ghostLog, handleError } from '@shared/common';
// Khai báo DUY NHẤT ở models/todo-board.ts. Trước đây service tự khai báo một
// bản riêng, và bản đó thiếu hết các trường v2 (sortByWeight, focusCount…) —
// hai interface trùng tên ở hai barrel là cách chắc chắn để sau này có người
// import nhầm bản cũ.
import { UserTodoSettings } from '@models/_index';

const apiUrl = environment.apiUrl + '/v1/user-settings';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  constructor(private http: HttpClient) {}

  getTodoSettings(): Observable<UserTodoSettings> {
    const url = `${apiUrl}/todo`;
    return this.http.get<UserTodoSettings>(url).pipe(
      tap(_ => ghostLog('fetched user todo settings')),
      catchError(handleError<UserTodoSettings>('getTodoSettings'))
    );
  }

  updateTodoSettings(settings: UserTodoSettings): Observable<UserTodoSettings> {
    const url = `${apiUrl}/todo`;
    return this.http.put<UserTodoSettings>(url, settings).pipe(
      tap(_ => ghostLog('updated user todo settings')),
      catchError(handleError<UserTodoSettings>('updateTodoSettings'))
    );
  }
}
