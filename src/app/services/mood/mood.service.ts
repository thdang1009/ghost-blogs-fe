import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MoodType } from '@models/_index';
import { environment } from '@environments/environment';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/mood';

@Injectable({
  providedIn: 'root'
})
export class MoodService {

  constructor(private http: HttpClient) { }

  getAllMoodTypes(): Observable<MoodType[]> {
    return this.http.get<MoodType[]>(apiUrl).pipe(
      tap(_ => ghostLog('fetched all mood types')),
      catchError(handleError<MoodType[]>('getAllMoodTypes', []))
    );
  }

  getMoodType(id: string): Observable<MoodType> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<MoodType>(url).pipe(
      tap(_ => ghostLog(`fetched mood type id=${id}`)),
      catchError(handleError<MoodType>(`getMoodType id=${id}`))
    );
  }

  createMoodType(moodType: MoodType): Observable<MoodType> {
    return this.http.post<MoodType>(apiUrl, moodType).pipe(
      tap((m: MoodType) => ghostLog(`created mood type id=${m.id}`)),
      catchError(handleError<MoodType>('createMoodType'))
    );
  }

  updateMoodType(id: string, moodType: MoodType): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, moodType).pipe(
      tap(_ => ghostLog(`updated mood type id=${id}`)),
      catchError(handleError<any>('updateMoodType'))
    );
  }

  deleteMoodType(id: string): Observable<MoodType> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<MoodType>(url).pipe(
      tap(_ => ghostLog(`deleted mood type id=${id}`)),
      catchError(handleError<MoodType>('deleteMoodType'))
    );
  }

  incrementUsage(id: string): Observable<MoodType> {
    const url = `${apiUrl}/${id}/increment-usage`;
    return this.http.put<MoodType>(url, {}).pipe(
      tap(_ => ghostLog(`incremented usage for mood type id=${id}`)),
      catchError(handleError<MoodType>('incrementUsage'))
    );
  }
}
