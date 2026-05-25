import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/system';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  constructor(private http: HttpClient) {}

  restartSystem(): Observable<any> {
    return this.http.put<any>(apiUrl + '/restart', {}).pipe(
      tap(response => {
        ghostLog('Restart system response:', response);
      }),
      catchError(handleError('restartSystem', null))
    );
  }

  getMongoDBConnections(): Observable<any> {
    return this.http.get<any>(apiUrl + '/mongodb-connections').pipe(
      tap(response => {
        ghostLog('MongoDB connections response:', response);
      }),
      catchError(handleError('getMongoDBConnections', null))
    );
  }

  createMongoDBDump(): Observable<any> {
    return this.http.post<any>(apiUrl + '/mongodb-dump', {}).pipe(
      tap(response => {
        ghostLog('MongoDB dump response:', response);
      }),
      catchError(handleError('createMongoDBDump', null))
    );
  }
}
