import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
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
    remoteShutdown: boolean;
  };
  timestamp: string;
}

export interface VibeCodingShutdownResponse {
  success: boolean;
  message: string;
  timestamp: string;
  delay: number;
  force: boolean;
  platform: string;
  error?: string;
}

export interface VibeCodingWebSocketMessage {
  type: 'status_update';
  status: string;
  message: string;
  timestamp: string;
  attempts?: number;
  maxAttempts?: number;
  services?: {
    vscode: string;
    claudeCode: string;
    devServer: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class VibeCodingService {
  private ws: WebSocket | null = null;
  private statusSubject =
    new BehaviorSubject<VibeCodingWebSocketMessage | null>(null);
  public status$ = this.statusSubject.asObservable();

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

  /**
   * Connect to WebSocket for real-time status updates
   */
  connectToWebSocket(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const wsUrl = environment.apiUrl.replace(/^http/, 'ws') + '/ws/vibe-coding';
    ghostLog(`Connecting to WebSocket: ${wsUrl}`);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      ghostLog('WebSocket connected for vibe coding status updates');
    };

    this.ws.onmessage = event => {
      try {
        const message: VibeCodingWebSocketMessage = JSON.parse(event.data);
        ghostLog(`WebSocket message received: ${message.status}`);
        this.statusSubject.next(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      ghostLog('WebSocket connection closed');
      this.ws = null;
    };

    this.ws.onerror = error => {
      console.error('WebSocket error:', error);
      this.ws = null;
    };
  }

  /**
   * Disconnect from WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get the current status from the BehaviorSubject
   */
  getCurrentStatus(): VibeCodingWebSocketMessage | null {
    return this.statusSubject.value;
  }

  /**
   * Shutdown the development machine remotely
   */
  shutdownMachine(
    delay: number = 30,
    force: boolean = false
  ): Observable<VibeCodingShutdownResponse> {
    return this.http
      .post<VibeCodingShutdownResponse>(`${apiUrl}/shutdown`, { delay, force })
      .pipe(
        tap((response: VibeCodingShutdownResponse) => {
          if (response.success) {
            ghostLog(
              `Shutdown command sent successfully. Platform: ${response.platform}, Delay: ${response.delay}s`
            );
          } else {
            console.error('Failed to send shutdown command:', response.error);
          }
        }),
        catchError(handleError<VibeCodingShutdownResponse>('shutdownMachine'))
      );
  }
}
