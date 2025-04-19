import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { Alert, AlertType } from '@models/_index';

/**
 * Type definition for notification types
 */
export type NotiType = 'danger' | 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private subject = new Subject<Alert>();
  private defaultId = 'default-alert';

  constructor() {}

  // enable subscribing to alerts observable
  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(filter(x => x && x.id === id));
  }

  /**
   * Display a notification with default position at top-right
   * @param content The message content to display
   * @param type The type of notification (success, error, warning, info)
   * @param timer Auto-close time in milliseconds
   * @param title Optional title for the notification
   */
  showNoti(content: string, type: NotiType, timer = 3000, title = 'Notifications'): void {
    this.showNotification('top', 'right', title, content, type, timer);
  }

  /**
   * Display a socket notification with default position at top-left
   * @param content The message content to display
   * @param type The type of notification (success, error, warning, info)
   * @param timer Auto-close time in milliseconds
   * @param title Optional title for the notification
   */
  showNotiSocket(content: string, type: NotiType, timer = 3000, title = 'Notifications'): void {
    this.showNotification('top', 'left', title, content, type, timer);
  }

  /**
   * Display a notification with custom position
   * @param from Vertical position (top, bottom)
   * @param align Horizontal position (left, right)
   * @param title Title of the notification
   * @param content Message content
   * @param type Type of notification (success, error, warning, info)
   * @param timer Auto-close time in milliseconds
   */
  showNotification(from: string, align: string, title: string, content: string, type: NotiType, timer = 3000): void {
    // Skip in SSR mode
    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    // Convert NotiType to AlertType
    let alertType = AlertType.Info;

    if (type === 'success') {
      alertType = AlertType.Success;
    } else if (type === 'error' || type === 'danger') {
      alertType = AlertType.Error;
    } else if (type === 'warning') {
      alertType = AlertType.Warning;
    } else if (type === 'info') {
      alertType = AlertType.Info;
    }

    // Configure the notification options
    const options = {
      autoClose: true,
      keepAfterRouteChange: false,
      position: { from, align },
      title,
      timer
    };

    // Call the appropriate method based on the notification type
    switch (alertType) {
      case AlertType.Success:
        this.success(content, options);
        break;
      case AlertType.Error:
        this.error(content, options);
        break;
      case AlertType.Warning:
        this.warn(content, options);
        break;
      case AlertType.Info:
      default:
        this.info(content, options);
        break;
    }
  }

  // convenience methods
  success(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Success, message }));
  }

  error(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Error, message }));
  }

  info(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Info, message }));
  }

  warn(message: string, options?: any) {
    this.alert(new Alert({ ...options, type: AlertType.Warning, message }));
  }

  // main alert method
  alert(alert: Alert) {
    alert.id = alert.id || this.defaultId;

    // Set defaults for alert properties
    if (alert.autoClose === undefined) {
      alert.autoClose = true;
    }

    if (alert.timer === undefined) {
      alert.timer = 3000; // Default 3 seconds
    }

    if (alert.position === undefined) {
      alert.position = { from: 'top', align: 'right' };
    }

    this.subject.next(alert);
  }

  // clear alerts
  clear(id = this.defaultId) {
    this.subject.next(new Alert({ id }));
  }
}
