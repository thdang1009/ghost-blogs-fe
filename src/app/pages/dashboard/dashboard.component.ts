import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService, DateRange, DashboardData } from '@services/analytics/analytics.service';
import { AlertService } from '@services/_index';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
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
    geoDistribution: []
  };

  loading = true;
  dateRange: DateRange = {
    startDate: this.getLastMonthDate(),
    endDate: this.getCurrentDate()
  };
  private destroy$ = new Subject<void>();

  // Make Math available to template
  Math = Math;

  constructor(
    private analyticsService: AnalyticsService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.analyticsService.getDashboardData(this.dateRange)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: DashboardData) => {
        this.dashboardData = data;
        this.loading = false;
      }, (error: any) => {
        console.error('Error loading dashboard data', error);
        this.alertService.showNoti('Failed to load analytics data', 'danger');
        this.loading = false;
      });
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
      '#8BC34A'  // Light Green
    ];
  }

  // Helper method to calculate percentage for charts
  calculatePercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  // Date helpers
  private getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private getLastMonthDate(): string {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    return lastMonth.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}
