import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/vibe-coding';

export interface VibeCodingWakeResponse {
  success: boolean;
  message: string;
  timestamp: string;
  target?: {
    mac: string;
    ip: string;
  };
  error?: string;
}

export interface VibeCodingStatusResponse {
  status: string;
  message: string;
  timestamp: string;
  services?: {
    vscode: string;
    claudeCode: string;
    devServer: string;
  };
  error?: string;
}

export interface VibeCodingConfigResponse {
  machine: {
    mac: string;
    hasIP: boolean;
  };
  features: {
    wakeOnLan: boolean;
    statusCheck: boolean;
    autoLaunch: boolean;
  };
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class VibeCodingService {
  constructor(private http: HttpClient) {}

  /**
   * Send magic packet to wake up the development machine
   */
  wakeUpMachine(): Observable<VibeCodingWakeResponse> {
    return this.http.post<VibeCodingWakeResponse>(`${apiUrl}/wake`, {}).pipe(
      tap((response: VibeCodingWakeResponse) => {
        if (response.success) {
          ghostLog(`Magic packet sent successfully to ${response.target?.mac}`);
        } else {
          console.error('Failed to send magic packet:', response.error);
        }
      }),
      catchError(handleError<VibeCodingWakeResponse>('wakeUpMachine'))
    );
  }

  /**
   * Check the status of the development machine
   */
  checkMachineStatus(): Observable<VibeCodingStatusResponse> {
    return this.http.get<VibeCodingStatusResponse>(`${apiUrl}/status`).pipe(
      tap((response: VibeCodingStatusResponse) => {
        ghostLog(`Machine status: ${response.status}`);
      }),
      catchError(handleError<VibeCodingStatusResponse>('checkMachineStatus'))
    );
  }

  /**
   * Get vibe coding configuration
   */
  getConfig(): Observable<VibeCodingConfigResponse> {
    return this.http.get<VibeCodingConfigResponse>(`${apiUrl}/config`).pipe(
      tap((response: VibeCodingConfigResponse) => {
        ghostLog(`Vibe coding config loaded: MAC=${response.machine.mac}`);
      }),
      catchError(handleError<VibeCodingConfigResponse>('getConfig'))
    );
  }
}
