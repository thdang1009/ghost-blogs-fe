import { Component } from '@angular/core';
import { AlertService } from '../../../components/alert/alert.service';
import { VibeCodingService } from '../../../services/vibe-coding/vibe-coding.service';

@Component({
  selector: 'app-vibe-coding',
  templateUrl: './vibe-coding.component.html',
  styleUrls: ['./vibe-coding.component.scss'],
})
export class VibeCodingComponent {
  machineStatus: 'sleeping' | 'waking' | 'ready' | 'error' = 'sleeping';
  isLoading = false;
  lastWakeTime: string | null = null;

  constructor(
    private vibeCodingService: VibeCodingService,
    private alertService: AlertService
  ) {}

  async wakeUpMachine(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.machineStatus = 'waking';

    try {
      const response = await this.vibeCodingService.wakeUpMachine().toPromise();

      if (response && response.success) {
        this.alertService.success(
          'Magic packet sent successfully! Machine should wake up in ~30 seconds.'
        );
        this.lastWakeTime = new Date().toLocaleTimeString();
        this.pollMachineStatus();
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

  private pollMachineStatus(): void {
    let attempts = 0;
    const maxAttempts = 15; // Poll for 30 seconds (2s intervals)

    const interval = setInterval(async () => {
      attempts++;

      try {
        await this.checkMachineStatus();

        if (this.machineStatus === 'ready' || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts && this.machineStatus !== 'ready') {
            this.machineStatus = 'sleeping';
            this.alertService.warn(
              'Machine may still be waking up. Check manually.'
            );
          }
        }
      } catch (error) {
        console.log(`Polling attempt ${attempts}: Machine still waking up...`);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          this.machineStatus = 'sleeping';
        }
      }
    }, 2000);
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
