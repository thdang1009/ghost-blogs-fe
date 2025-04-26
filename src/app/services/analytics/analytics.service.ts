import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

// Define interfaces for the GA4 API requests and responses
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Metric {
  name: string;
}

export interface Dimension {
  name: string;
}

export interface OrderBy {
  metric?: { metricName: string };
  dimension?: { dimensionName: string };
  desc?: boolean;
}

export interface RunReportRequest {
  dateRanges: DateRange[];
  metrics: Metric[];
  dimensions?: Dimension[];
  orderBys?: OrderBy[];
  limit?: number;
}

export interface MetricValue {
  value: string;
}

export interface DimensionValue {
  value: string;
}

export interface Row {
  dimensionValues?: DimensionValue[];
  metricValues: MetricValue[];
}

export interface RunReportResponse {
  rows: Row[];
  rowCount: number;
  dimensionHeaders?: { name: string }[];
  metricHeaders: { name: string }[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface DashboardData {
  totalUsers: number;
  pageViews: number;
  sessions: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  bounceRate: number;
  newVsReturning: ChartData;
  trafficSources: ChartData;
  deviceBreakdown: ChartData;
  topPages: {
    page: string;
    views: number;
    uniqueViews: number;
  }[];
  geoDistribution: {
    country: string;
    sessions: number;
    users: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly apiBaseUrl = 'https://analyticsdata.googleapis.com/v1beta1/properties';
  private readonly propertyId = environment.googleAnalytics?.propertyId || ''; // Add this to your environment config
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) { }

  /**
   * Helper method to run a GA4 report
   */
  private runReport(request: RunReportRequest): Observable<RunReportResponse> {
    const url = `${this.apiBaseUrl}/${this.propertyId}:runReport`;

    // Typically you would need to include an authorization token here
    // This depends on how you've set up authentication with Google
    return this.http.post<RunReportResponse>(url, request).pipe(
      catchError(error => {
        console.error('Error fetching GA data:', error);
        return of({ rows: [], rowCount: 0, metricHeaders: [] } as RunReportResponse);
      })
    );
  }

  /**
   * Get a complete dashboard data set for a date range
   */
  getDashboardData(dateRange: DateRange): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`, {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
    }).pipe(
      catchError(error => {
        console.error('Error fetching analytics data', error);
        // Return mock data in case of error or during development
        return of(this.getMockData());
      })
    );
  }

  // Mock data for development and testing
  private getMockData(): DashboardData {
    return {
      totalUsers: 1254,
      pageViews: 3875,
      sessions: 1965,
      avgSessionDuration: 126,
      pagesPerSession: 2.8,
      bounceRate: 42.3,
      newVsReturning: {
        labels: ['New Users', 'Returning Users'],
        datasets: [{
          label: 'Users',
          data: [845, 409],
          backgroundColor: ['#4CAF50', '#2196F3']
        }]
      },
      trafficSources: {
        labels: ['Organic Search', 'Direct', 'Social', 'Referral', 'Email'],
        datasets: [{
          label: 'Sessions',
          data: [825, 431, 367, 289, 53],
          backgroundColor: ['#FF9800', '#9C27B0', '#03A9F4', '#E91E63', '#8BC34A']
        }]
      },
      deviceBreakdown: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [{
          label: 'Users',
          data: [642, 498, 114],
          backgroundColor: ['#3F51B5', '#F44336', '#009688']
        }]
      },
      topPages: [
        { page: '/blog/top-10-seo-strategies', views: 485, uniqueViews: 412 },
        { page: '/blog/content-marketing-guide', views: 328, uniqueViews: 274 },
        { page: '/pricing', views: 297, uniqueViews: 256 },
        { page: '/features', views: 243, uniqueViews: 201 },
        { page: '/blog/email-marketing-tips', views: 198, uniqueViews: 167 }
      ],
      geoDistribution: [
        { country: 'United States', sessions: 824, users: 756 },
        { country: 'United Kingdom', sessions: 312, users: 287 },
        { country: 'Canada', sessions: 198, users: 176 },
        { country: 'Australia', sessions: 143, users: 126 },
        { country: 'Germany', sessions: 87, users: 79 }
      ]
    };
  }

  /**
   * Get total users
   */
  getTotalUsers(startDate: string, endDate: string): Observable<number> {
    const request: RunReportRequest = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'totalUsers' }]
    };

    return this.runReport(request).pipe(
      catchError(error => {
        console.error('Error fetching total users:', error);
        return of({ rows: [{ metricValues: [{ value: '0' }] }], rowCount: 1, metricHeaders: [{ name: 'totalUsers' }] });
      }),
      map(response => parseInt(response.rows[0]?.metricValues[0]?.value || '0', 10))
    );
  }

  /**
   * Get new vs returning users data
   */
  getNewVsReturningUsers(startDate: string, endDate: string): Observable<ChartData> {
    const request: RunReportRequest = {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'totalUsers' }],
      dimensions: [{ name: 'newVsReturning' }]
    };

    return this.runReport(request).pipe(
      catchError(error => {
        console.error('Error fetching new vs returning users:', error);
        return of({
          rows: [
            { dimensionValues: [{ value: 'new' }], metricValues: [{ value: '0' }] },
            { dimensionValues: [{ value: 'returning' }], metricValues: [{ value: '0' }] }
          ],
          rowCount: 2,
          dimensionHeaders: [{ name: 'newVsReturning' }],
          metricHeaders: [{ name: 'totalUsers' }]
        });
      }),
      map(response => {
        const labels: string[] = [];
        const data: number[] = [];

        response.rows.forEach(row => {
          if (row.dimensionValues && row.dimensionValues.length > 0) {
            labels.push(row.dimensionValues[0].value);
            data.push(parseInt(row.metricValues[0].value, 10));
          }
        });

        return {
          labels,
          datasets: [{
            label: 'Users',
            data,
            backgroundColor: ['#36A2EB', '#FF6384']
          }]
        } as ChartData;
      })
    );
  }

  // Additional methods would be implemented for each metric in the requirements
  // Following the same pattern as the examples above
}
