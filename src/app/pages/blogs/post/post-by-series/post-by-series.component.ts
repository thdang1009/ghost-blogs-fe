import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesService, PostService } from '@services/_index';
import { Post, Series } from '@models/_index';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from '@environments/environment';

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

  constructor(
    private seriesService: SeriesService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private meta: Meta
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const seriesSlug = params['series'];
      if (!seriesSlug) {
        this.router.navigate(['/home']);
        return;
      }

      this.loadSeries(seriesSlug);
    });
  }

  loadSeries(slug: string): void {
    this.loading = true;
    this.seriesService.getPostsBySeries(slug).subscribe(
      data => {
        this.series = data.series;
        this.posts = data.posts;

        // Set the current page URL first
        this.currentPageUrl = `${environment.siteUrl}/post-by-series?series=${slug}`;

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

    console.log('Meta tags updated for series page:', this.currentPageUrl);
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  openPost(post: Post) {
    // This method is required for compatibility with the post-by component
  }
}
