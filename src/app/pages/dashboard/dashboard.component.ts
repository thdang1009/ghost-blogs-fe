import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  AnalyticsService,
  DateRange,
  DashboardData,
} from '@services/analytics/analytics.service';
import {
  AlertService,
  AuthService,
  AWSService,
  SystemService,
} from '@services/_index';
import { regexPercentage } from '@shared/constant';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData: DashboardData = {
    totalUsers: 0,
    pageViews: 0,
    sessions: 0,
    avgSessionDuration: 0,
    pagesPerSession: 0,
    bounceRate: 0,
    newVsReturning: { labels: [], datasets: [] },
    trafficSources: { labels: [], datasets: [] },
    deviceBreakdown: { labels: [], datasets: [] },
    topPages: [],
    geoDistribution: [],
  };
  awsEC2Usage: string = '';
  activeConnections: number = 0;

  loading = true;
  dateRange: DateRange = {
    startDate: this.getLastMonthDate(),
    endDate: this.getCurrentDate(),
  };
  private destroy$ = new Subject<void>();

  // Make Math available to template
  Math = Math;

  constructor(
    private analyticsService: AnalyticsService,
    private alertService: AlertService,
    private authService: AuthService,
    private systemService: SystemService,
    private awsService: AWSService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAWSStoragedSpace() {
    this.awsService.getAWSStoragedSpace().subscribe(
      res => {
        const regex = regexPercentage;
        this.awsEC2Usage = (res?.message?.match(regex) || [])[0] || '';
      },
      err => {
        console.log(err);
        this.alertService.showNoti(`getAWSStoragedSpace fail!`, 'danger');
      }
    );
  }

  getMongoDBConnections() {
    this.systemService.getMongoDBConnections().subscribe(
      res => {
        if (res && res.success && res.connections) {
          this.activeConnections = res.connections.activeConnections;
        }
      },
      err => {
        console.log(err);
        this.alertService.showNoti(
          `Failed to get MongoDB connections info!`,
          'danger'
        );
      }
    );
  }

  loadDashboardData(): void {
    this.loading = true;

    // Create a deep copy of dateRange to ensure we're using formatted dates
    const formattedDateRange: DateRange = {
      startDate: this.formatDate(this.dateRange.startDate),
      endDate: this.formatDate(this.dateRange.endDate),
    };

    this.analyticsService
      .getDashboardData(formattedDateRange)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: DashboardData) => {
          this.dashboardData = data;
          this.loading = false;
        },
        (error: any) => {
          console.error('Error loading dashboard data', error);
          this.alertService.showNoti('Failed to load analytics data', 'danger');
          this.loading = false;
        }
      );

    this.getAWSStoragedSpace();
    this.getMongoDBConnections();
  }

  // Called when either date in the range changes
  onDateRangeChange(): void {
    // Validate date range
    if (this.isValidDateRange()) {
      // Optionally auto-load data when dates change
      // this.loadDashboardData();
    }
  }

  // Validate date range (end date should be after start date)
  isValidDateRange(): boolean {
    if (!this.dateRange.startDate || !this.dateRange.endDate) {
      return false;
    }

    const startDate = new Date(this.formatDate(this.dateRange.startDate));
    const endDate = new Date(this.formatDate(this.dateRange.endDate));

    if (endDate < startDate) {
      this.alertService.showNoti(
        'End date must be after start date',
        'warning'
      );
      return false;
    }

    return true;
  }

  // Helper method to format time in minutes:seconds
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  }

  // Helper method to get default colors for charts
  getDefaultColors(): string[] {
    return [
      '#3F51B5', // Indigo
      '#F44336', // Red
      '#4CAF50', // Green
      '#FF9800', // Orange
      '#9C27B0', // Purple
      '#03A9F4', // Light Blue
      '#E91E63', // Pink
      '#8BC34A', // Light Green
    ];
  }

  // Helper method to calculate percentage for charts
  calculatePercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  // System management methods
  isGrandAdmin(): boolean {
    return this.authService.isGrandAdmin();
  }

  startProduction(): void {
    if (!this.isGrandAdmin()) {
      this.alertService.showNoti(
        'Unauthorized. Only GRAND_ADMIN can start production.',
        'danger'
      );
      return;
    }

    if (
      confirm(
        'Are you sure you want to start the production environment? This will execute the start-production.sh script.'
      )
    ) {
      this.systemService
        .startProduction()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: response => {
            if (response && response.success) {
              this.alertService.showNoti(
                'Production start initiated successfully!',
                'success'
              );
              console.log('Production start output:', response.output);
              if (response.warnings) {
                console.warn('Production start warnings:', response.warnings);
                this.alertService.showNoti(
                  'Production started with warnings. Check console for details.',
                  'warning'
                );
              }
            } else {
              this.alertService.showNoti(
                response?.msg || 'Failed to start production',
                'danger'
              );
            }
          },
          error: error => {
            console.error('Error starting production:', error);
            const errorMsg =
              error?.error?.msg ||
              error?.message ||
              'Failed to start production';
            this.alertService.showNoti(errorMsg, 'danger');
          },
        });
    }
  }

  restartBackend(): void {
    if (!this.isGrandAdmin()) {
      this.alertService.showNoti(
        'Unauthorized. Only GRAND_ADMIN can restart backend.',
        'danger'
      );
      return;
    }

    if (
      confirm(
        'Are you sure you want to restart the backend? This will stop and start the application using PM2.'
      )
    ) {
      this.systemService
        .restartBackend()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: response => {
            if (response && response.success) {
              this.alertService.showNoti(
                'Backend restart completed successfully!',
                'success'
              );
              console.log('Backend restart output:', response.output);
              if (response.warnings) {
                console.warn('Backend restart warnings:', response.warnings);
                this.alertService.showNoti(
                  'Backend restarted with warnings. Check console for details.',
                  'warning'
                );
              }
            } else {
              this.alertService.showNoti(
                response?.msg || 'Failed to restart backend',
                'danger'
              );
            }
          },
          error: error => {
            console.error('Error restarting backend:', error);
            const errorMsg =
              error?.error?.msg ||
              error?.message ||
              'Failed to restart backend';
            this.alertService.showNoti(errorMsg, 'danger');
          },
        });
    }
  }

  createMongoDBDump(): void {
    if (!this.isGrandAdmin()) {
      this.alertService.showNoti(
        'Unauthorized. Only GRAND_ADMIN can create MongoDB dumps.',
        'danger'
      );
      return;
    }

    if (
      confirm(
        'Are you sure you want to create a MongoDB dump? This will export the entire database to a file.'
      )
    ) {
      this.alertService.showNoti(
        'Creating MongoDB dump... This may take a few minutes.',
        'info'
      );

      this.systemService
        .createMongoDBDump()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: response => {
            if (response && response.success) {
              this.alertService.showNoti(
                `MongoDB dump created successfully! File: ${response.dumpFileName}`,
                'success'
              );
              console.log('MongoDB dump details:', response);
              if (response.warnings) {
                console.warn('MongoDB dump warnings:', response.warnings);
                this.alertService.showNoti(
                  'Dump created with warnings. Check console for details.',
                  'warning'
                );
              }
            } else {
              this.alertService.showNoti(
                response?.msg || 'Failed to create MongoDB dump',
                'danger'
              );
            }
          },
          error: error => {
            console.error('Error creating MongoDB dump:', error);
            const errorMsg =
              error?.error?.msg ||
              error?.message ||
              'Failed to create MongoDB dump';
            this.alertService.showNoti(errorMsg, 'danger');
          },
        });
    }
  }

  // Date helpers
  private getCurrentDate(): string {
    const today = new Date();
    return this.formatDate(today);
  }

  private getLastMonthDate(): string {
    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );
    return this.formatDate(lastMonth);
  }

  // Format date to YYYY-MM-DD string
  private formatDate(date: string | Date): string {
    if (!date) {
      return '';
    }

    let d: Date;
    if (typeof date === 'string') {
      // Handle string dates
      if (date.includes('T')) {
        // ISO format
        d = new Date(date);
      } else {
        // YYYY-MM-DD format
        d = new Date(date);
      }
    } else {
      // Handle Date objects
      d = date;
    }

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
