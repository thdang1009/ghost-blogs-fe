import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/user-reward';

export interface ActiveTimer {
  totalSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  startTime: Date | null;
}

export interface UserRewardState {
  _id?: string;
  user?: number;
  activeTimer: ActiveTimer;
  savedReward: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserRewardService {

  constructor(private http: HttpClient) { }

  getRewardState(): Observable<UserRewardState> {
    return this.http.get<UserRewardState>(apiUrl).pipe(
      tap(_ => ghostLog('fetched user reward state')),
      catchError(handleError<UserRewardState>('getRewardState'))
    );
  }

  updateRewardState(state: Partial<UserRewardState>): Observable<UserRewardState> {
    return this.http.put<UserRewardState>(apiUrl, state).pipe(
      tap(_ => ghostLog('updated user reward state')),
      catchError(handleError<UserRewardState>('updateRewardState'))
    );
  }
}
