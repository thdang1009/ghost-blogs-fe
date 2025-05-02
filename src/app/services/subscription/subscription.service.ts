import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Subscription } from '@models/_index';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/subscribe';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private http: HttpClient) { }

  /**
   * Gets all subscriptions for a user
   * @param userId User ID to get subscriptions for
   */
  getUserSubscriptions(userId: string): Observable<Subscription[]> {
    const url = `${apiUrl}?userId=${userId}`;
    return this.http.get<Subscription[]>(url).pipe(
      tap(_ => ghostLog(`fetched subscriptions for user ${userId}`)),
      catchError(handleError<Subscription[]>(`getUserSubscriptions`, []))
    );
  }

  /**
   * Gets all subscriptions for a guest email
   * @param email Email to get subscriptions for
   */
  getEmailSubscriptions(email: string): Observable<Subscription[]> {
    const url = `${apiUrl}?email=${email}`;
    return this.http.get<Subscription[]>(url).pipe(
      tap(_ => ghostLog(`fetched subscriptions for email ${email}`)),
      catchError(handleError<Subscription[]>(`getEmailSubscriptions`, []))
    );
  }

  /**
   * Subscribe to tags (either user or guest)
   * @param subscription Subscription object containing userId or email and tag IDs
   */
  subscribe(subscription: Subscription): Observable<Subscription> {
    return this.http.put<Subscription>(apiUrl, subscription).pipe(
      tap(_ => ghostLog('subscribed to tags')),
      catchError(handleError<Subscription>('subscribe'))
    );
  }

  /**
   * Unsubscribe from tags (either user or guest)
   * @param subscription Subscription object containing userId or email and tag IDs
   */
  unsubscribe(id: string, tagIds: string[]): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.patch<any>(url, { unsubscribe: tagIds }).pipe(
      tap(_ => ghostLog(`unsubscribed from tags`)),
      catchError(handleError<any>('unsubscribe'))
    );
  }

  /**
   * Delete all subscriptions for a user or email
   * @param id ID of the subscription to delete
   */
  deleteSubscription(id: string): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<any>(url).pipe(
      tap(_ => ghostLog(`deleted subscription ${id}`)),
      catchError(handleError<any>('deleteSubscription'))
    );
  }
}
