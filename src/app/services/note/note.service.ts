import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Note } from '@models/_index';
import { environment } from '@environments/environment';
import { buildQueryString, ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/note';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient) { }

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(apiUrl)
      .pipe(
        tap(_ => ghostLog('fetched Note')),
        catchError(handleError('getNote', []))
      );
  }

  getNote(id: any): Observable<Note> {
    const url = `${apiUrl}/id/${id}`;
    return this.http.get<Note>(url).pipe(
      tap(_ => ghostLog(`fetched note by id=${id}`)),
      catchError(handleError<Note>(`getNote id=${id}`))
    );
  }

  getMyNote(req: any): Observable<Note> {
    const queryString = buildQueryString(req);
    const url = `${apiUrl}/my-note?${queryString}`;
    return this.http.get<Note>(url).pipe(
      // tap(_ => ghostLog(`fetched my note`)),
      catchError(handleError<Note>(`getMyNote`))
    );
  }

  addNote(note: Note): Observable<Note> {
    return this.http.post<Note>(apiUrl, note).pipe(
      tap((prod: Note) => ghostLog(`added note id=${note.id}`)),
      catchError(handleError<Note>('addNote'))
    );
  }

  updateNote(id: any, note: Note): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, note).pipe(
      tap(_ => ghostLog(`updated note id=${id}`)),
      catchError(handleError<any>('updateNote'))
    );
  }

  deleteNote(id: any): Observable<Note> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<Note>(url).pipe(
      tap(_ => ghostLog(`deleted note id=${id}`)),
      catchError(handleError<Note>('deleteNote'))
    );
  }
}
