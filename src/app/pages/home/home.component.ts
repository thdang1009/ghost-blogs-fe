import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, PostService } from '@services/_index';
import { Post } from '@models/_index';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

interface Section {
  id: string;
  title: string;
  icon: string;
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Signals for reactive state management
  isLogined = signal(false);
  isAdmin = signal(false);
  privateMode = signal(false);
  currentTagFilter = signal<string | null>(null);

  // Section data
  mostReadPosts = signal<Post[]>([]);
  recentPosts = signal<Post[]>([]);
  tagsSummary = signal<any[]>([]);
  seriesSummary = signal<any[]>([]);
  filteredPosts = signal<Post[]>([]);

  // Pagination for recent posts
  recentPostsPage = signal(1);
  recentPostsPagination = signal<any>(null);

  // Section states
  sections = signal<Record<string, Section>>({
    mostRead: {
      id: 'mostRead',
      title: '🔥 Most Read Posts',
      icon: 'trending_up',
      loaded: false,
      loading: false,
      error: null,
    },
    series: {
      id: 'series',
      title: '📚 Browse Series',
      icon: 'library_books',
      loaded: false,
      loading: false,
      error: null,
    },
    recent: {
      id: 'recent',
      title: '🆕 Recent Posts',
      icon: 'schedule',
      loaded: false,
      loading: false,
      error: null,
    },
    tags: {
      id: 'tags',
      title: '🏷️ Explore by Tags',
      icon: 'label',
      loaded: false,
      loading: false,
      error: null,
    },
  });

  // Computed values
  showPrivateToggle = computed(() => this.isAdmin());
  currentPrivateMode = computed(() => this.privateMode());
  isFilterMode = computed(() => this.currentTagFilter() !== null);

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeAuth();
    this.handleRouteParams();
  }

  private initializeAuth() {
    this.isLogined.set(this.authService.isLogin());
    this.isAdmin.set(this.authService.isAdmin());
  }

  private handleRouteParams() {
    this.activeRoute.queryParams.subscribe(params => {
      if (params['tag']) {
        // Filter content by tag instead of navigating
        this.filterByTag(params['tag']);
      } else if (params['series']) {
        this.navigateToSeriesFilter(params['series']);
      } else {
        // No filters, load normal content
        this.loadInitialSections();
      }
    });
  }

  private loadInitialSections() {
    // Load most critical sections first
    this.loadMostReadPosts();
    this.loadTagsSummary();

    // Load other sections with slight delay for better perceived performance
    setTimeout(() => {
      this.loadSeriesSummary();
      this.loadRecentPosts();
    }, 100);
  }

  loadMostReadPosts() {
    this.updateSectionState('mostRead', { loading: true, error: null });

    this.postService
      .getMostReadPosts(6, this.privateMode())
      .pipe(
        catchError(error => {
          this.updateSectionState('mostRead', {
            loading: false,
            error: 'Failed to load most read posts',
          });
          return of({ posts: [] });
        }),
        finalize(() =>
          this.updateSectionState('mostRead', { loading: false, loaded: true })
        )
      )
      .subscribe(response => {
        this.mostReadPosts.set(response.posts);
      });
  }

  loadRecentPosts(page: number = 1) {
    this.updateSectionState('recent', { loading: true, error: null });

    this.postService
      .getRecentPosts(page, 6, this.privateMode())
      .pipe(
        catchError(error => {
          this.updateSectionState('recent', {
            loading: false,
            error: 'Failed to load recent posts',
          });
          return of({ posts: [], pagination: null });
        }),
        finalize(() =>
          this.updateSectionState('recent', { loading: false, loaded: true })
        )
      )
      .subscribe(response => {
        if (page === 1) {
          this.recentPosts.set(response.posts);
        } else {
          this.recentPosts.update(posts => [...posts, ...response.posts]);
        }
        this.recentPostsPagination.set(response.pagination);
        this.recentPostsPage.set(page);
      });
  }

  loadTagsSummary() {
    this.updateSectionState('tags', { loading: true, error: null });

    this.postService
      .getTagsSummary(this.privateMode())
      .pipe(
        catchError(error => {
          this.updateSectionState('tags', {
            loading: false,
            error: 'Failed to load tags',
          });
          return of({ tags: [] });
        }),
        finalize(() =>
          this.updateSectionState('tags', { loading: false, loaded: true })
        )
      )
      .subscribe(response => {
        this.tagsSummary.set(response.tags);
      });
  }

  loadSeriesSummary() {
    this.updateSectionState('series', { loading: true, error: null });

    this.postService
      .getSeriesSummary(this.privateMode())
      .pipe(
        catchError(error => {
          this.updateSectionState('series', {
            loading: false,
            error: 'Failed to load series',
          });
          return of({ series: [] });
        }),
        finalize(() =>
          this.updateSectionState('series', { loading: false, loaded: true })
        )
      )
      .subscribe(response => {
        this.seriesSummary.set(response.series);
      });
  }

  private updateSectionState(sectionId: string, updates: Partial<Section>) {
    this.sections.update(sections => {
      return {
        ...sections,
        [sectionId]: { ...sections[sectionId], ...updates },
      };
    });
  }

  togglePrivateMode() {
    this.privateMode.update(mode => !mode);
    this.refreshAllSections();
  }

  private refreshAllSections() {
    this.loadMostReadPosts();
    this.loadTagsSummary();
    this.loadSeriesSummary();
    this.loadRecentPosts(1);
  }

  private filterByTag(tagName: string) {
    this.currentTagFilter.set(tagName);
    this.updateSectionState('recent', { loading: true, error: null });

    this.postService
      .getPublicPosts({ tag: tagName, limit: 20, page: 1 })
      .pipe(
        catchError(error => {
          this.updateSectionState('recent', {
            loading: false,
            error: `Failed to load posts for tag: ${tagName}`,
          });
          return of({ posts: [] });
        }),
        finalize(() =>
          this.updateSectionState('recent', { loading: false, loaded: true })
        )
      )
      .subscribe(response => {
        // Extract posts array from response object
        const posts = response.posts || response || [];
        this.filteredPosts.set(posts);
      });
  }

  clearTagFilter() {
    this.currentTagFilter.set(null);
    this.filteredPosts.set([]);
    this.router.navigate(['/home']);
  }

  loadMoreRecentPosts() {
    const pagination = this.recentPostsPagination();
    if (pagination && pagination.hasNextPage) {
      // Save current scroll position before loading more posts
      const scrollY = window.scrollY || window.pageYOffset;

      // Load more posts and restore position after they're loaded
      this.loadRecentPostsWithScrollPreservation(
        pagination.currentPage + 1,
        scrollY
      );
    }
  }

  private loadRecentPostsWithScrollPreservation(page: number, scrollY: number) {
    this.updateSectionState('recent', { loading: true, error: null });

    this.postService
      .getRecentPosts(page, 6, this.privateMode())
      .pipe(
        tap(response => {
          // Update data without triggering scroll
          this.recentPosts.update(posts => [...posts, ...response.posts]);
          this.recentPostsPagination.set(response.pagination);
          this.recentPostsPage.set(page);
        }),
        catchError(error => {
          this.updateSectionState('recent', {
            loading: false,
            error: 'Failed to load recent posts',
          });
          return of({ posts: [], pagination: null });
        }),
        finalize(() => {
          this.updateSectionState('recent', { loading: false, loaded: true });

          // Use multiple RAF calls to ensure DOM is fully rendered
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.scrollTo({
                top: scrollY,
                behavior: 'instant' as ScrollBehavior,
              });
            });
          });
        })
      )
      .subscribe();
  }

  navigateToTagFilter(tagName: string) {
    this.router.navigate(['/home'], { queryParams: { tag: tagName } });
  }

  navigateToSeriesFilter(seriesSlug: string) {
    this.router.navigate(['/post-by-series', seriesSlug]);
  }

  retrySection(sectionId: string) {
    switch (sectionId) {
      case 'mostRead':
        this.loadMostReadPosts();
        break;
      case 'tags':
        this.loadTagsSummary();
        break;
      case 'series':
        this.loadSeriesSummary();
        break;
      case 'recent':
        this.loadRecentPosts(1);
        break;
    }
  }

  // TrackBy functions for performance optimization
  trackByPostId(index: number, post: Post): any {
    return post.id || post.postReference;
  }

  trackByTagId(index: number, tag: any): any {
    return tag._id || tag.name;
  }

  trackBySeriesId(index: number, series: any): any {
    return series._id || series.slug;
  }
}
