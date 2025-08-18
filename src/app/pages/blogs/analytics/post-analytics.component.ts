import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  PostAnalyticsService,
  PostAnalyticsResponse,
  TagAnalytics,
  TopPerformingPost,
  TrafficSource,
  SeriesAnalytics,
  TopPerformingSeries,
  SeriesAnalyticsResponse,
  AdvancedAnalytics,
} from '../../../services/post-analytics/post-analytics.service';
import { PostService } from '../../../services/post/post.service';
import { TagService } from '../../../services/tag/tag.service';
import { SeriesService } from '../../../services/series/series.service';
import { Post } from '../../../models/post';
import { Tag } from '../../../models/tag';
import { Series } from '../../../models/series';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-post-analytics',
  templateUrl: './post-analytics.component.html',
  styleUrls: ['./post-analytics.component.scss'],
})
export class PostAnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  posts: Post[] = [];
  tags: Tag[] = [];
  series: Series[] = [];
  topPosts: TopPerformingPost[] = [];
  tagAnalytics: TagAnalytics[] = [];
  trafficSources: TrafficSource[] = [];
  selectedPostAnalytics?: PostAnalyticsResponse;

  // Series Analytics Data
  seriesAnalyticsSummary: SeriesAnalytics[] = [];
  topPerformingSeries: TopPerformingSeries[] = [];
  selectedSeriesAnalytics?: SeriesAnalyticsResponse;

  // Advanced Analytics Data
  advancedAnalytics?: AdvancedAnalytics;

  // Filter properties
  selectedPost?: Post;
  selectedTag?: Tag;
  selectedSeries?: Series;
  startDate: Date = new Date();
  endDate: Date = new Date();
  groupBy: 'day' | 'hour' = 'day';

  // Form controls for autocomplete
  postControl = new FormControl();
  tagControl = new FormControl();
  seriesControl = new FormControl();

  // Filtered observables for autocomplete
  filteredPosts!: Observable<Post[]>;
  filteredTags!: Observable<Tag[]>;
  filteredSeries!: Observable<Series[]>;

  // UI state
  loading = false;
  selectedView:
    | 'overview'
    | 'post-details'
    | 'tag-analytics'
    | 'series-analytics'
    | 'traffic-sources'
    | 'advanced-analytics' = 'overview';
  selectedTabIndex = 0;

  // Expose Math for template
  Math = Math;

  // Comparison functions for Material Select
  comparePostsFn = (post1: Post, post2: Post): boolean => {
    return post1 && post2 ? post1._id === post2._id : post1 === post2;
  };

  compareTagsFn = (tag1: Tag, tag2: Tag): boolean => {
    return tag1 && tag2 ? tag1._id === tag2._id : tag1 === tag2;
  };

  compareSeriesFn = (series1: Series, series2: Series): boolean => {
    return series1 && series2
      ? series1._id === series2._id
      : series1 === series2;
  };

  // Filter functions for autocomplete
  private filterPosts(value: string | Post): Post[] {
    const filterValue =
      typeof value === 'string'
        ? value.toLowerCase()
        : value?.title?.toLowerCase() || '';
    return this.posts.filter(post =>
      post.title?.toLowerCase().includes(filterValue)
    );
  }

  private filterTags(value: string | Tag): Tag[] {
    const filterValue =
      typeof value === 'string'
        ? value.toLowerCase()
        : value?.name?.toLowerCase() || '';
    return this.tags.filter(tag =>
      tag.name?.toLowerCase().includes(filterValue)
    );
  }

  private filterSeries(value: string | Series): Series[] {
    const filterValue =
      typeof value === 'string'
        ? value.toLowerCase()
        : value?.name?.toLowerCase() || '';
    return this.series.filter(series =>
      series.name?.toLowerCase().includes(filterValue)
    );
  }

  // Display functions for autocomplete
  displayPostFn = (post: Post): string => {
    return post && post.title ? post.title : '';
  };

  displayTagFn = (tag: Tag): string => {
    return tag && tag.name ? tag.name : '';
  };

  displaySeriesFn = (series: Series): string => {
    return series && series.name ? series.name : '';
  };

  private formatDateForAPI(date: Date, isEndDate: boolean = false): string {
    // Format date to YYYY-MM-DD in local timezone
    const dateToFormat = new Date(date);

    // For end date, add one day to include the full day in the range
    if (isEndDate) {
      dateToFormat.setDate(dateToFormat.getDate() + 1);
    }

    const year = dateToFormat.getFullYear();
    const month = String(dateToFormat.getMonth() + 1).padStart(2, '0');
    const day = String(dateToFormat.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  constructor(
    private postAnalyticsService: PostAnalyticsService,
    private postService: PostService,
    private tagService: TagService,
    private seriesService: SeriesService
  ) {
    // Set default date range (last 30 days to today)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    this.endDate = endDate;
    this.startDate = startDate;
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.loadOverviewData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData(): void {
    // Load posts and tags for dropdowns
    this.postService
      .getAllPost({})
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        // getAllPost returns posts directly, not wrapped in a 'posts' property
        this.posts = Array.isArray(response) ? response : response.posts || [];

        // Initialize filtered posts observable after posts are loaded
        this.filteredPosts = this.postControl.valueChanges.pipe(
          startWith(''),
          map(value => this.filterPosts(value))
        );
      });

    this.tagService
      .getTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tags: Tag[]) => {
        this.tags = tags;

        // Initialize filtered tags observable after tags are loaded
        this.filteredTags = this.tagControl.valueChanges.pipe(
          startWith(''),
          map(value => this.filterTags(value))
        );
      });

    this.seriesService
      .getAllSeries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((series: Series[]) => {
        this.series = series;

        // Initialize filtered series observable after series are loaded
        this.filteredSeries = this.seriesControl.valueChanges.pipe(
          startWith(''),
          map(value => this.filterSeries(value))
        );
      });
  }

  loadOverviewData(): void {
    this.loading = true;
    const startDateStr = this.formatDateForAPI(this.startDate);
    const endDateStr = this.formatDateForAPI(this.endDate, true);

    // Load top performing posts
    this.postAnalyticsService
      .getTopPerformingPosts(startDateStr, endDateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe(posts => {
        this.topPosts = posts;
      });

    // Load tag analytics
    this.postAnalyticsService
      .getTagAnalytics(undefined, startDateStr, endDateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.tagAnalytics = data.tagAnalytics;
      });

    // Load series analytics summary
    this.postAnalyticsService
      .getSeriesAnalyticsSummary(startDateStr, endDateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe(seriesData => {
        this.seriesAnalyticsSummary = seriesData;
      });

    // Load top performing series
    this.postAnalyticsService
      .getTopPerformingSeries(startDateStr, endDateStr, 5)
      .pipe(takeUntil(this.destroy$))
      .subscribe(topSeries => {
        this.topPerformingSeries = topSeries;
      });

    // Load traffic sources
    this.postAnalyticsService
      .getTrafficSourceAnalytics(startDateStr, endDateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe(sources => {
        this.trafficSources = sources;
        this.loading = false;
      });
  }

  onPostSelected(): void {
    if (this.selectedPost) {
      this.selectedView = 'post-details';
      this.loadPostAnalytics();
    }
  }

  // Autocomplete selection handlers
  onPostAutocompleteSelected(post: Post): void {
    this.selectedPost = post;
    this.selectedView = 'post-details';
    this.selectedTabIndex = 1;
    this.loadPostAnalytics();
  }

  onTagAutocompleteSelected(tag: Tag): void {
    this.selectedTag = tag;
    this.selectedView = 'tag-analytics';
    this.selectedTabIndex = 2;
    this.loadTagSpecificAnalytics();
  }

  onSeriesAutocompleteSelected(series: Series): void {
    this.selectedSeries = series;
    this.selectedView = 'series-analytics';
    this.selectedTabIndex = 3;
    this.loadSeriesSpecificAnalytics();
  }

  onTagSelected(): void {
    if (this.selectedTag) {
      this.selectedView = 'tag-analytics';
      this.loadTagSpecificAnalytics();
    }
  }

  loadPostAnalytics(): void {
    if (!this.selectedPost) {
      console.log('No selected post');
      return;
    }

    console.log('Loading post analytics for:', this.selectedPost);
    this.loading = true;
    const startDateStr = this.formatDateForAPI(this.startDate);
    const endDateStr = this.formatDateForAPI(this.endDate, true);

    console.log('Date range:', startDateStr, 'to', endDateStr);

    this.postAnalyticsService
      .getPostAnalytics(
        this.selectedPost._id,
        undefined,
        startDateStr,
        endDateStr,
        this.groupBy
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          console.log('Post analytics received:', data);
          this.selectedPostAnalytics = data;
          this.loading = false;
        },
        error => {
          console.error('Error loading post analytics:', error);
          this.loading = false;
        }
      );
  }

  loadTagSpecificAnalytics(): void {
    if (!this.selectedTag) return;

    this.loading = true;
    const startDateStr = this.formatDateForAPI(this.startDate);
    const endDateStr = this.formatDateForAPI(this.endDate, true);

    this.postAnalyticsService
      .getTagAnalytics(this.selectedTag._id, startDateStr, endDateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.tagAnalytics = data.tagAnalytics;
        this.loading = false;
      });
  }

  loadSeriesSpecificAnalytics(): void {
    if (!this.selectedSeries || !this.selectedSeries._id) return;

    this.loading = true;
    const startDateStr = this.formatDateForAPI(this.startDate);
    const endDateStr = this.formatDateForAPI(this.endDate, true);

    this.postAnalyticsService
      .getSeriesAnalytics(this.selectedSeries._id, startDateStr, endDateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.selectedSeriesAnalytics = data;
        this.loading = false;
      });
  }

  applyFilters(): void {
    switch (this.selectedView) {
      case 'overview':
        this.loadOverviewData();
        break;
      case 'post-details':
        this.loadPostAnalytics();
        break;
      case 'tag-analytics':
        this.loadTagSpecificAnalytics();
        break;
      case 'series-analytics':
        this.loadSeriesSpecificAnalytics();
        break;
      case 'traffic-sources':
        this.loadTrafficSourceAnalytics();
        break;
      case 'advanced-analytics':
        this.loadAdvancedAnalytics();
        break;
    }
  }

  loadTrafficSourceAnalytics(): void {
    this.loading = true;
    const startDateStr = this.formatDateForAPI(this.startDate);
    const endDateStr = this.formatDateForAPI(this.endDate, true);

    this.postAnalyticsService
      .getTrafficSourceAnalytics(
        startDateStr,
        endDateStr,
        this.selectedPost?._id,
        this.selectedTag?._id
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(sources => {
        this.trafficSources = sources;
        this.loading = false;
      });
  }

  clearPostSelection(): void {
    this.selectedPost = undefined;
    this.selectedPostAnalytics = undefined;
    this.postControl.setValue('');
    this.selectedView = 'overview';
    this.selectedTabIndex = 0;
    this.loadOverviewData();
  }

  clearTagSelection(): void {
    this.selectedTag = undefined;
    this.tagControl.setValue('');
    this.selectedView = 'overview';
    this.selectedTabIndex = 0;
    this.loadOverviewData();
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m`;
    } else {
      return `${Math.round(seconds / 3600)}h`;
    }
  }

  formatPercentage(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  getTrafficSourceIcon(type: string): string {
    switch (type) {
      case 'search':
        return 'search';
      case 'social':
        return 'share';
      case 'direct':
        return 'trending_up';
      case 'referral':
        return 'link';
      case 'email':
        return 'email';
      default:
        return 'help_outline';
    }
  }

  selectPostFromTopList(postId: string): void {
    this.selectedPost = this.posts.find(p => p._id === postId);
    if (this.selectedPost) {
      this.selectedView = 'post-details';
      this.selectedTabIndex = 1; // Switch to Post Details tab
      this.loadPostAnalytics();
    }
  }

  selectTagFromList(tagId: string): void {
    this.selectedTag = this.tags.find(t => t._id === tagId);
    if (this.selectedTag) {
      this.selectedView = 'tag-analytics';
      this.selectedTabIndex = 2; // Switch to Tag Analytics tab
      this.loadTagSpecificAnalytics();
    }
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    switch (event.index) {
      case 0:
        this.selectedView = 'overview';
        this.loadOverviewData();
        break;
      case 1:
        this.selectedView = 'post-details';
        break;
      case 2:
        this.selectedView = 'tag-analytics';
        break;
      case 3:
        this.selectedView = 'series-analytics';
        break;
      case 4:
        this.selectedView = 'traffic-sources';
        this.loadTrafficSourceAnalytics();
        break;
      case 5:
        this.selectedView = 'advanced-analytics';
        this.loadAdvancedAnalytics();
        break;
    }
  }

  loadAdvancedAnalytics(): void {
    this.loading = true;
    const startDateStr = this.formatDateForAPI(this.startDate);
    const endDateStr = this.formatDateForAPI(this.endDate, true);

    this.postAnalyticsService
      .getAdvancedAnalytics(
        startDateStr,
        endDateStr,
        this.selectedPost?._id,
        this.selectedSeries?._id
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.advancedAnalytics = data;
        this.loading = false;
      });
  }

  clearSeriesSelection(): void {
    this.selectedSeries = undefined;
    this.selectedSeriesAnalytics = undefined;
    this.seriesControl.setValue('');
    this.selectedView = 'overview';
    this.selectedTabIndex = 0;
    this.loadOverviewData();
  }

  selectSeriesFromTopList(seriesId: string): void {
    this.selectedSeries = this.series.find(s => s._id === seriesId);
    if (this.selectedSeries) {
      this.selectedView = 'series-analytics';
      this.selectedTabIndex = 3; // Switch to Series Analytics tab
      this.loadSeriesSpecificAnalytics();
    }
  }

  exportData(): void {
    const startDateStr = this.formatDateForAPI(this.startDate);
    const endDateStr = this.formatDateForAPI(this.endDate, true);

    const dataToExport = {
      dateRange: { start: startDateStr, end: endDateStr },
      topPosts: this.topPosts,
      tagAnalytics: this.tagAnalytics,
      trafficSources: this.trafficSources,
      selectedPostAnalytics: this.selectedPostAnalytics,
      seriesAnalyticsSummary: this.seriesAnalyticsSummary,
      topPerformingSeries: this.topPerformingSeries,
      selectedSeriesAnalytics: this.selectedSeriesAnalytics,
      advancedAnalytics: this.advancedAnalytics,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `post-analytics-${startDateStr}-to-${endDateStr}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
