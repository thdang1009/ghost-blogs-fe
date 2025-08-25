import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../components/alert/alert.service';
import {
  VibeCodingService,
  VibeCodingWebSocketMessage,
} from '../../../services/vibe-coding/vibe-coding.service';

@Component({
  selector: 'app-vibe-coding',
  templateUrl: './vibe-coding.component.html',
  styleUrls: ['./vibe-coding.component.scss'],
})
export class VibeCodingComponent implements OnInit, OnDestroy {
  machineStatus: 'sleeping' | 'waking' | 'ready' | 'error' = 'sleeping';
  isLoading = false;
  lastWakeTime: string | null = null;
  statusMessage = '';
  attempts = 0;
  maxAttempts = 0;

  private statusSubscription?: Subscription;

  constructor(
    private vibeCodingService: VibeCodingService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Connect to WebSocket for real-time status updates
    this.vibeCodingService.connectToWebSocket();

    // Subscribe to status updates
    this.statusSubscription = this.vibeCodingService.status$.subscribe(
      (message: VibeCodingWebSocketMessage | null) => {
        if (message) {
          this.handleStatusUpdate(message);
        }
      }
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }

    // Disconnect WebSocket
    this.vibeCodingService.disconnectWebSocket();
  }

  async wakeUpMachine(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.machineStatus = 'waking';

    try {
      const response = await this.vibeCodingService.wakeUpMachine().toPromise();

      if (response && response.success) {
        this.alertService.success(
          'Magic packet sent successfully! Monitoring wake-up status via WebSocket.'
        );
        this.lastWakeTime = new Date().toLocaleTimeString();
        // WebSocket will automatically receive status updates from the server
      } else {
        throw new Error(response?.message || 'Failed to send magic packet');
      }
    } catch (error: any) {
      console.error('Error sending magic packet:', error);
      this.alertService.error(
        `Failed to wake machine: ${error.message || 'Unknown error'}`
      );
      this.machineStatus = 'error';
    } finally {
      this.isLoading = false;
    }
  }

  async checkMachineStatus(): Promise<void> {
    try {
      const response = await this.vibeCodingService
        .checkMachineStatus()
        .toPromise();

      if (response && response.status === 'ready') {
        this.machineStatus = 'ready';
        this.alertService.success('Development machine is ready!');
      } else {
        this.machineStatus = 'sleeping';
      }
    } catch (error) {
      this.machineStatus = 'sleeping';
    }
  }

  private handleStatusUpdate(message: VibeCodingWebSocketMessage): void {
    this.statusMessage = message.message;
    this.attempts = message.attempts || 0;
    this.maxAttempts = message.maxAttempts || 0;

    switch (message.status) {
      case 'waking':
        this.machineStatus = 'waking';
        break;
      case 'ready':
        this.machineStatus = 'ready';
        this.alertService.success('Development machine is ready!');
        break;
      case 'shutting_down':
        this.machineStatus = 'sleeping';
        this.alertService.info(message.message);
        break;
      case 'error':
        this.machineStatus = 'error';
        this.alertService.error('Error while waking up machine');
        break;
      default:
        this.machineStatus = 'sleeping';
        break;
    }
  }

  async shutdownMachine(delay: number = 30): Promise<void> {
    if (this.isLoading) return;

    const confirmShutdown = confirm(
      `Are you sure you want to shutdown the machine in ${delay} seconds? This will turn off your PC!`
    );
    if (!confirmShutdown) return;

    this.isLoading = true;

    try {
      const response = await this.vibeCodingService
        .shutdownMachine(delay, false)
        .toPromise();

      if (response && response.success) {
        this.alertService.warn(
          `Shutdown command sent! Machine will shutdown in ${delay} seconds on ${response.platform}.`
        );
        this.machineStatus = 'sleeping';

        // Set a timeout to change status after the delay
        setTimeout(
          () => {
            this.machineStatus = 'sleeping';
            this.statusMessage = 'Machine has been shut down';
          },
          (delay + 5) * 1000
        ); // Add 5 seconds buffer
      } else {
        throw new Error(response?.message || 'Failed to send shutdown command');
      }
    } catch (error: any) {
      console.error('Error sending shutdown command:', error);
      this.alertService.error(
        `Failed to shutdown machine: ${error.message || 'Unknown error'}`
      );
    } finally {
      this.isLoading = false;
    }
  }

  async forceShutdownMachine(): Promise<void> {
    if (this.isLoading) return;

    const confirmForceShutdown = confirm(
      'Are you sure you want to FORCE SHUTDOWN the machine immediately? This will turn off your PC without saving!'
    );
    if (!confirmForceShutdown) return;

    this.isLoading = true;

    try {
      const response = await this.vibeCodingService
        .shutdownMachine(0, true)
        .toPromise();

      if (response && response.success) {
        this.alertService.warn(
          'Force shutdown command sent! Machine will shutdown immediately.'
        );
        this.machineStatus = 'sleeping';

        // Machine should be off almost immediately
        setTimeout(() => {
          this.machineStatus = 'sleeping';
          this.statusMessage = 'Machine has been shut down (forced)';
        }, 3000);
      } else {
        throw new Error(
          response?.message || 'Failed to send force shutdown command'
        );
      }
    } catch (error: any) {
      console.error('Error sending force shutdown command:', error);
      this.alertService.error(
        `Failed to force shutdown machine: ${error.message || 'Unknown error'}`
      );
    } finally {
      this.isLoading = false;
    }
  }

  openVSCode(): void {
    // This would open VS Code remotely - placeholder for now
    this.alertService.info('VS Code integration coming soon!');
  }

  openClaudeCode(): void {
    // This would open Claude Code - placeholder for now
    this.alertService.info('Claude Code integration coming soon!');
  }

  openDevServer(): void {
    // This would open the dev server - placeholder for now
    this.alertService.info('Dev server integration coming soon!');
  }

  getStatusIcon(): string {
    switch (this.machineStatus) {
      case 'sleeping':
        return '😴';
      case 'waking':
        return '⏰';
      case 'ready':
        return '🚀';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  }

  getStatusText(): string {
    switch (this.machineStatus) {
      case 'sleeping':
        return 'Development Machine Sleeping';
      case 'waking':
        return 'Waking Up Machine...';
      case 'ready':
        return 'Machine Ready for Coding!';
      case 'error':
        return 'Error Waking Machine';
      default:
        return 'Unknown Status';
    }
  }

  getStatusClass(): string {
    switch (this.machineStatus) {
      case 'sleeping':
        return 'text-muted';
      case 'waking':
        return 'text-warning';
      case 'ready':
        return 'text-success';
      case 'error':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  }
}
