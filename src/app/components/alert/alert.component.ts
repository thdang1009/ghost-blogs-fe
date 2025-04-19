import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { Alert, AlertType } from '@models/_index';
import { AlertService } from '@services/alert/alert.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-20px)'
      })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ])
  ]
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() id = 'default-alert';
  @Input() fade = true;

  alerts: Alert[] = [];
  alertSubscription!: Subscription;
  routeSubscription!: Subscription;

  constructor(
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    // Subscribe to new alert notifications
    this.alertSubscription = this.alertService.onAlert(this.id)
      .subscribe(alert => {
        // Clear alerts when an empty alert is received
        if (!alert.message) {
          // Filter out alerts without 'keepAfterRouteChange' flag
          this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);

          // Remove 'keepAfterRouteChange' flag on the rest
          this.alerts.forEach(x => delete x.keepAfterRouteChange);
          return;
        }

        // Add alert to array
        this.alerts.push(alert);

        // Auto close alert if required
        if (alert.autoClose) {
          setTimeout(() => this.removeAlert(alert), alert.timer || 3000);
        }
      });

    // Clear alerts on location change
    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.alertService.clear(this.id);
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    if (this.alertSubscription) this.alertSubscription.unsubscribe();
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
  }

  removeAlert(alert: Alert) {
    // Check if alert has already been removed
    if (!this.alerts.includes(alert)) return;

    // Remove alert
    this.alerts = this.alerts.filter(x => x !== alert);
  }

  cssClass(alert: Alert) {
    if (!alert) return '';

    const classes = ['alert', 'alert-dismissible'];

    const alertTypeClass = {
      [AlertType.Success]: 'alert-success',
      [AlertType.Error]: 'alert-danger',
      [AlertType.Info]: 'alert-info',
      [AlertType.Warning]: 'alert-warning'
    };

    if (alert.type !== undefined) {
      classes.push(alertTypeClass[alert.type]);
    }

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }

  getIconClass(alert: Alert) {
    if (!alert || alert.type === undefined) return 'notifications';

    const alertTypeIcon = {
      [AlertType.Success]: 'check_circle',
      [AlertType.Error]: 'error',
      [AlertType.Info]: 'info',
      [AlertType.Warning]: 'warning'
    };

    return alertTypeIcon[alert.type];
  }
}
