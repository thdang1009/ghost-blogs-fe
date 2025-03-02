import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Tag } from '@models/_index';
import { environment } from '@environments/environment';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/tag';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private http: HttpClient) { }

  getTags(name?: string): Observable<Tag[]> {
    const url = `${apiUrl}` + (name ? `?name=${name}` : '');
    return this.http.get<Tag[]>(url).pipe(
      tap(_ => ghostLog(`fetched tag`)),
      catchError(handleError<Tag[]>(`getTag`, []))
    );
  }

  getTag(id: any): Observable<Tag> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<Tag>(url).pipe(
      tap(_ => ghostLog(`fetched tag by id=${id}`)),
      catchError(handleError<Tag>(`getTag id=${id}`))
    );
  }

  createTagWithName(name: string): Observable<any> {
    const newItem: Tag = {
      name: name,
      description: undefined,
      imgUrl: undefined,
      content: undefined
    }
    return this.addTag.call(this, newItem);
  }

  addTag(tag: Tag): Observable<Tag> {
    ghostLog(tag);
    return this.http.post<Tag>(apiUrl, tag).pipe(
      tap((prod: Tag) => ghostLog(`added tag id=${prod.id}`)),
      catchError(handleError<Tag>('addTag'))
    );
  }

  updateTag(id: any, tag: Tag): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, tag).pipe(
      tap(_ => ghostLog(`updated tag id=${id}`)),
      catchError(handleError<any>('updateTag'))
    );
  }

  deleteTag(id: any): Observable<Tag> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<Tag>(url).pipe(
      tap(_ => ghostLog(`deleted tag id=${id}`)),
      catchError(handleError<Tag>('deleteTag'))
    );
  }

}
