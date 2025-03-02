import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { GuestMessage } from '@models/_index';
import { environment } from '@environments/environment';
import { buildQueryString, ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/guest-message';

@Injectable({
  providedIn: 'root'
})
export class GuestMessageService {

  constructor(private http: HttpClient) { }


  sendGuestMessage(message: any): Observable<GuestMessage> {
    return this.http.post<GuestMessage>(apiUrl, message).pipe(
      tap((_message: GuestMessage) => ghostLog(`add guest message= ${_message.id}`)),
      catchError(handleError<GuestMessage>('add guest message'))
    );
  }

  getGuestMessage(id: any): Observable<GuestMessage> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<GuestMessage>(url).pipe(
      tap(_ => ghostLog(`fetched guest-message by id=${id}`)),
      catchError(handleError<GuestMessage>(`getGuestMessage id=${id}`))
    );
  }

  getGuestMessages(req: any): Observable<GuestMessage> {
    const queryString = buildQueryString(req);
    const hasParams = queryString.length;
    const url = `${apiUrl}${hasParams ? ('?' + queryString) : ''}`;
    return this.http.get<GuestMessage>(url).pipe(
      // tap(_ => ghostLog(`fetched my guest-message`)),
      catchError(handleError<GuestMessage>(`getMyGuestMessage`))
    );
  }

  addGuestMessage(guestMessage: GuestMessage): Observable<GuestMessage> {
    return this.http.post<GuestMessage>(apiUrl, guestMessage).pipe(
      tap((prod: GuestMessage) => ghostLog(`added guest-message id=${guestMessage.id}`)),
      catchError(handleError<GuestMessage>('addGuestMessage'))
    );
  }

  updateGuestMessage(id: any, guestMessage: GuestMessage): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, guestMessage).pipe(
      tap(_ => ghostLog(`updated guest-message id=${id}`)),
      catchError(handleError<any>('updateGuestMessage'))
    );
  }

  deleteGuestMessage(id: any): Observable<GuestMessage> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<GuestMessage>(url).pipe(
      tap(_ => ghostLog(`deleted guest-message id=${id}`)),
      catchError(handleError<GuestMessage>('deleteGuestMessage'))
    );
  }
}
