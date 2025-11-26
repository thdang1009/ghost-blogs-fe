import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/user-settings';

export interface UserTodoSettings {
  _id?: string;
  user?: number;
  todayCount: number;
  weeklyCount: number;
  monthlyCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  constructor(private http: HttpClient) { }

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
