import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@services/../components/alert/alert.service';

/**
 * Centralised Angular ErrorHandler that:
 * 1. Shows user-facing feedback via AlertService
 * 2. Differentiates HTTP error types (4xx client vs 5xx server)
 * 3. Leaves a hook for monitoring services (Sentry, Datadog, etc.)
 *
 * Registered in AppModule providers:
 *   { provide: ErrorHandler, useClass: GlobalErrorHandlerService }
 */
@Injectable({ providedIn: 'root' })
export class GlobalErrorHandlerService implements ErrorHandler {
  private readonly alertService = inject(AlertService);
  private readonly zone = inject(NgZone);

  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      // Re-surface unexpected errors to the console so they don't silently vanish
      console.error('[GlobalErrorHandler] Unexpected error:', error);
      // Uncomment when a monitoring service is wired in:
      // this.monitoringService.captureException(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    const message = this.getErrorMessage(error);
    // Run inside Angular zone so change detection picks up the alert update
    this.zone.run(() => this.alertService.error(message));
    console.error(
      '[GlobalErrorHandler] HTTP error:',
      error.status,
      error.url,
      error.message
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error — please check your internet connection.';
    }
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict — this resource already exists.';
      case 422:
        return 'Validation failed. Please review your input.';
      case 429:
        return 'Too many requests. Please slow down and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `An unexpected error occurred (${error.status}).`;
    }
  }
}
