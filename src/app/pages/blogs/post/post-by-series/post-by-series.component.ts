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

    // Update meta tags
    this.meta.updateTag({ name: 'description', content: this.series.description || `Posts in the ${this.series.name} series` });

    // Update Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: `${this.series.name} - Blog Series` });
    this.meta.updateTag({ property: 'og:description', content: this.series.description || `Posts in the ${this.series.name} series` });
    this.meta.updateTag({ property: 'og:url', content: `${environment.siteUrl}/post-by-series?series=${this.series.slug}` });
    this.meta.updateTag({ property: 'og:image', content: this.series.imageUrl || '' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    // Update Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: `${this.series.name} - Blog Series` });
    this.meta.updateTag({ name: 'twitter:description', content: this.series.description || `Posts in the ${this.series.name} series` });
    this.meta.updateTag({ name: 'twitter:image', content: this.series.imageUrl || '' });
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  openPost(post: Post) {
    // This method is required for compatibility with the post-by component
  }
}
