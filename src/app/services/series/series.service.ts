import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Series } from '@models/series';
import { handleError, ghostLog } from '@shared/common';
import { Post } from '@models/post';

const apiUrl = environment.apiUrl + '/v1/series';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {

  constructor(private http: HttpClient) { }

  // Get all public series
  getPublicSeries(): Observable<Series[]> {
    const url = `${apiUrl}/public`;
    return this.http.get<Series[]>(url).pipe(
      tap(_ => ghostLog('fetched public series')),
      catchError(handleError<Series[]>('getPublicSeries', []))
    );
  }

  // Get posts in a specific series
  getPostsBySeries(slug: string): Observable<any> {
    const url = `${apiUrl}/public/${slug}`;
    return this.http.get<any>(url).pipe(
      tap(_ => ghostLog(`fetched posts for series=${slug}`)),
      catchError(handleError<any>(`getPostsBySeries slug=${slug}`))
    );
  }

  // Admin functions

  // Get all series (admin)
  getAllSeries(): Observable<Series[]> {
    return this.http.get<Series[]>(apiUrl).pipe(
      tap(_ => ghostLog('fetched all series')),
      catchError(handleError<Series[]>('getAllSeries', []))
    );
  }

  // Get a specific series by ID (admin)
  getSeries(id: number): Observable<Series> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<Series>(url).pipe(
      tap(_ => ghostLog(`fetched series id=${id}`)),
      catchError(handleError<Series>(`getSeries id=${id}`))
    );
  }

  // Create a new series (admin)
  createSeries(series: Series): Observable<Series> {
    return this.http.post<Series>(apiUrl, series).pipe(
      tap((newSeries: Series) => ghostLog(`created series id=${newSeries.id}`)),
      catchError(handleError<Series>('createSeries'))
    );
  }

  // Update a series (admin)
  updateSeries(id: number, series: Series): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, series).pipe(
      tap(_ => ghostLog(`updated series id=${id}`)),
      catchError(handleError<any>('updateSeries'))
    );
  }

  // Delete a series (admin)
  deleteSeries(id: number): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<any>(url).pipe(
      tap(_ => ghostLog(`deleted series id=${id}`)),
      catchError(handleError<any>('deleteSeries'))
    );
  }
  getSeriesPosts(seriesId: string): Observable<Post[]> {
    const url = `${apiUrl}/${seriesId}/posts`;
    return this.http.get<Post[]>(url).pipe(
      tap(_ => ghostLog(`fetched series posts id=${seriesId}`)),
      catchError(handleError<Post[]>(`getSeriesPosts id=${seriesId}`))
    );
  }
}
