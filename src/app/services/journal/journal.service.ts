import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Journal } from '@models/_index';
import { environment } from '@environments/environment';
import { buildQueryString, ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/journal';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  constructor(private http: HttpClient) { }

  getJournalEntry(date: string): Observable<Journal> {
    const queryString = buildQueryString({ date });
    return this.http.get<Journal>(`${apiUrl}?${queryString}`).pipe(
      tap(_ => ghostLog(`fetched journal for date=${date}`)),
      catchError(handleError<Journal>(`getJournalEntry date=${date}`))
    );
  }

  createJournalEntry(journal: Journal): Observable<Journal> {
    return this.http.post<Journal>(apiUrl, journal).pipe(
      tap((j: Journal) => ghostLog(`created journal id=${j.id}`)),
      catchError(handleError<Journal>('createJournalEntry'))
    );
  }

  updateJournalEntry(id: number, journal: Journal): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, journal).pipe(
      tap(_ => ghostLog(`updated journal id=${id}`)),
      catchError(handleError<any>('updateJournalEntry'))
    );
  }
}
