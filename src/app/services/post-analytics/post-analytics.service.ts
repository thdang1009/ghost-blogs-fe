import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface PostViewTrackingData {
  postId?: string;
  postReference?: string;
  title: string;
  sessionId?: string;
  viewDuration?: number;
  scrollDepth?: number;
  referer?: string;
  searchQuery?: string;
  exitPage?: boolean;
  bounced?: boolean;
}

export interface PostAnalytics {
  totalViews: number;
  uniqueViews: number;
  avgViewDuration: number;
  avgScrollDepth: number;
  bounceRate: number;
}

export interface TrafficSource {
  _id: string;
  totalViews: number;
  totalUniqueViews: number;
  avgViewDuration: number;
  domains: {
    domain: string;
    count: number;
    uniqueViews: number;
    posts: { postId: string; title: string }[];
  }[];
}

export interface TagAnalytics {
  tagId: string;
  tagName: string;
  totalViews: number;
  uniqueViews: number;
  avgViewDuration: number;
  avgScrollDepth: number;
  postCount: number;
}

export interface TopPerformingPost {
  _id: string;
  title: string;
  postReference: string;
  totalViews: number;
  uniqueViews: number;
  avgViewDuration: number;
  avgScrollDepth: number;
  bounceRate: number;
  tagDetails: { _id: string; title: string }[];
}

export interface PostAnalyticsResponse {
  analytics: PostAnalytics;
  trafficSources: TrafficSource[];
  deviceBreakdown: { _id: string; count: number }[];
  timeBreakdown: { _id: string; views: number; uniqueViews: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class PostAnalyticsService {
  private apiUrl = environment.apiUrl + '/v1/post-analytics';
  private sessionId: string;

  constructor(private http: HttpClient) {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  trackPostView(data: PostViewTrackingData): Observable<any> {
    const trackingData = {
      ...data,
      sessionId: this.sessionId,
      referer: document.referrer,
    };

    return this.http.post(`${this.apiUrl}/track`, trackingData).pipe(
      catchError(error => {
        console.error('Error tracking post view:', error);
        return of({ success: false });
      })
    );
  }

  getPostAnalytics(
    postId?: string,
    postReference?: string,
    startDate?: string,
    endDate?: string,
    groupBy?: 'day' | 'hour'
  ): Observable<PostAnalyticsResponse> {
    const params: any = {};
    if (postId) params.postId = postId;
    if (postReference) params.postReference = postReference;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (groupBy) params.groupBy = groupBy;

    return this.http
      .get<PostAnalyticsResponse>(`${this.apiUrl}/post`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching post analytics:', error);
          return of({
            analytics: {
              totalViews: 0,
              uniqueViews: 0,
              avgViewDuration: 0,
              avgScrollDepth: 0,
              bounceRate: 0,
            },
            trafficSources: [],
            deviceBreakdown: [],
            timeBreakdown: [],
          });
        })
      );
  }

  getTagAnalytics(
    tagId?: string,
    startDate?: string,
    endDate?: string
  ): Observable<{
    tagAnalytics: TagAnalytics[];
    tagTrafficSources: any[];
  }> {
    const params: any = {};
    if (tagId) params.tagId = tagId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.http
      .get<{
        tagAnalytics: TagAnalytics[];
        tagTrafficSources: any[];
      }>(`${this.apiUrl}/tags`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching tag analytics:', error);
          return of({ tagAnalytics: [], tagTrafficSources: [] });
        })
      );
  }

  getTopPerformingPosts(
    startDate?: string,
    endDate?: string,
    limit: number = 10
  ): Observable<TopPerformingPost[]> {
    const params: any = { limit: limit.toString() };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.http
      .get<TopPerformingPost[]>(`${this.apiUrl}/top-posts`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching top performing posts:', error);
          return of([]);
        })
      );
  }

  getTrafficSourceAnalytics(
    startDate?: string,
    endDate?: string,
    postId?: string,
    tagId?: string
  ): Observable<TrafficSource[]> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (postId) params.postId = postId;
    if (tagId) params.tagId = tagId;

    return this.http
      .get<TrafficSource[]>(`${this.apiUrl}/traffic-sources`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching traffic source analytics:', error);
          return of([]);
        })
      );
  }

  // Helper method to track scroll depth
  trackScrollDepth(): Observable<void> {
    return new Observable(observer => {
      let maxScrollDepth = 0;

      const calculateScrollDepth = () => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollDepth = Math.round(
          ((scrollTop + windowHeight) / documentHeight) * 100
        );

        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
        }
      };

      const handleScroll = () => {
        calculateScrollDepth();
      };

      window.addEventListener('scroll', handleScroll);

      // Return cleanup function
      return () => {
        window.removeEventListener('scroll', handleScroll);
        observer.next();
        observer.complete();
      };
    });
  }

  // Helper method to track view duration
  trackViewDuration(): { startTime: number; getViewDuration: () => number } {
    const startTime = Date.now();

    return {
      startTime,
      getViewDuration: () => Math.round((Date.now() - startTime) / 1000),
    };
  }
}
