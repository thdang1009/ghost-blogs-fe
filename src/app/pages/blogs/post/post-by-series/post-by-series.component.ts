import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesService, PostService } from '@services/_index';
import { Post, Series } from '@models/_index';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from '@environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-post-by-series',
  templateUrl: './post-by-series.component.html',
  styleUrls: ['./post-by-series.component.scss']
})
export class PostBySeriesComponent implements OnInit {
  posts: Post[] = [];
  series?: Series;
  loading = true;
  error = '';
  currentPageUrl: string = '';
  seriesSlug: string = '';

  constructor(
    private seriesService: SeriesService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // First check path parameter
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.seriesSlug = slug;
        this.loadSeries(slug);
        return;
      }

      // If no path parameter, check query parameter (for backward compatibility)
      this.route.queryParams.subscribe(queryParams => {
        const seriesSlug = queryParams['series'];
        if (seriesSlug) {
          this.seriesSlug = seriesSlug;
          // Redirect to the new URL format for better SEO and social sharing
          this.router.navigate(['/post-by-series', seriesSlug], { replaceUrl: true });
        } else {
          this.router.navigate(['/home']);
        }
      });
    });
  }

  loadSeries(slug: string): void {
    this.loading = true;
    this.seriesService.getPostsBySeries(slug).subscribe(
      data => {
        this.series = data.series;
        this.posts = data.posts;

        // Set the current page URL with the new format using path parameter
        this.currentPageUrl = `${environment.siteUrl}/post-by-series/${slug}`;

        this.setupMetaTags();
        this.loading = false;
      },
      error => {
        console.error('Error fetching series:', error);
        this.error = 'Could not load the series. Please try again later.';
        this.loading = false;
      }
    );
  }

  setupMetaTags(): void {
    if (!this.series) return;

    // Set title and meta tags for SEO
    this.titleService.setTitle(`${this.series.name} - Blog Series`);

    // Ensure image URL is absolute
    const imageUrl = this.series.imageUrl || '';
    const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${environment.siteUrl}${imageUrl}`;

    // Update meta tags directly without removing them first
    this.meta.updateTag({ name: 'description', content: this.series.description || `Posts in the ${this.series.name} series` });

    // Set Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: `${this.series.name} - Blog Series` });
    this.meta.updateTag({ property: 'og:description', content: this.series.description || `Posts in the ${this.series.name} series` });
    this.meta.updateTag({ property: 'og:url', content: this.currentPageUrl });
    this.meta.updateTag({ property: 'og:image', content: absoluteImageUrl });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Ghost Site' });

    // Set Facebook-specific meta tags
    this.meta.updateTag({ property: 'fb:app_id', content: '598355823212592' });

    // Set Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: `${this.series.name} - Blog Series` });
    this.meta.updateTag({ name: 'twitter:description', content: this.series.description || `Posts in the ${this.series.name} series` });
    this.meta.updateTag({ name: 'twitter:image', content: absoluteImageUrl });

    // Only log in browser environment
    if (isPlatformBrowser(this.platformId)) {
      console.log('Meta tags updated for series page:', this.currentPageUrl);
    }
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  openPost(post: Post) {
    // This method is required for compatibility with the post-by component
  }
}
