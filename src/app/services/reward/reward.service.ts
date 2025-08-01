import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Reward } from '@models/_index';
import { handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/reward';

@Injectable({
  providedIn: 'root',
})
export class RewardService {
  constructor(private http: HttpClient) {}

  getRewards(): Observable<Reward[]> {
    return this.http
      .get<Reward[]>(apiUrl)
      .pipe(catchError(handleError<Reward[]>('getRewards', [])));
  }

  getPendingRewards(partner?: 'A' | 'B'): Observable<Reward[]> {
    let url = `${apiUrl}?status=pending`;
    if (partner) {
      url += `&partner=${partner}`;
    }
    return this.http
      .get<Reward[]>(url)
      .pipe(catchError(handleError<Reward[]>('getPendingRewards', [])));
  }

  getReward(id: string): Observable<Reward> {
    return this.http
      .get<Reward>(`${apiUrl}/${id}`)
      .pipe(catchError(handleError<Reward>('getReward')));
  }

  addReward(reward: Reward): Observable<Reward> {
    return this.http
      .post<Reward>(apiUrl, reward)
      .pipe(catchError(handleError<Reward>('addReward')));
  }

  updateReward(id: string, reward: Reward): Observable<Reward> {
    return this.http
      .put<Reward>(`${apiUrl}/${id}`, reward)
      .pipe(catchError(handleError<Reward>('updateReward')));
  }

  deleteReward(id: string): Observable<any> {
    return this.http
      .delete<any>(`${apiUrl}/${id}`)
      .pipe(catchError(handleError('deleteReward')));
  }

  completeReward(id: string): Observable<any> {
    return this.http
      .patch<any>(`${apiUrl}/${id}/complete`, {})
      .pipe(catchError(handleError('completeReward')));
  }
}
