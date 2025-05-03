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
        this.setupMetaTags(slug);
        this.loading = false;
      },
      error => {
        console.error('Error fetching series:', error);
        this.error = 'Could not load the series. Please try again later.';
        this.loading = false;
      }
    );
  }

  setupMetaTags(slug: string): void {
    if (!this.series) return;

    // First, remove existing OG tags that might conflict
    this.meta.removeTag("property='og:url'");
    this.meta.removeTag("property='og:title'");
    this.meta.removeTag("property='og:description'");
    this.meta.removeTag("property='og:image'");
    this.meta.removeTag("property='og:type'");

    // Set title and meta tags for SEO
    this.titleService.setTitle(`${this.series.name} - Blog Series`);

    // Update meta tags
    this.meta.updateTag({ name: 'description', content: this.series.description || `Posts in the ${this.series.name} series` });

    // Ensure image URL is absolute
    const imageUrl = this.series.imageUrl || '';
    const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${environment.siteUrl}${imageUrl}`;

    // Construct the absolute URL for the current page
    const currentUrl = `${environment.siteUrl}/post-by-series?series=${slug}`;

    // Update Open Graph tags - using both property and name for maximum compatibility
    this.meta.addTag({ property: 'og:title', content: `${this.series.name} - Blog Series` });
    this.meta.addTag({ property: 'og:description', content: this.series.description || `Posts in the ${this.series.name} series` });
    this.meta.addTag({ property: 'og:url', content: currentUrl });
    this.meta.addTag({ property: 'og:image', content: absoluteImageUrl });
    this.meta.addTag({ property: 'og:image:width', content: '1200' });
    this.meta.addTag({ property: 'og:image:height', content: '630' });
    this.meta.addTag({ property: 'og:type', content: 'article' });
    this.meta.addTag({ property: 'og:site_name', content: 'Ghost Site' });

    // Add Facebook-specific meta tags
    this.meta.addTag({ property: 'fb:app_id', content: '598355823212592' });

    // Update Twitter Card tags
    this.meta.addTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.addTag({ name: 'twitter:title', content: `${this.series.name} - Blog Series` });
    this.meta.addTag({ name: 'twitter:description', content: this.series.description || `Posts in the ${this.series.name} series` });
    this.meta.addTag({ name: 'twitter:image', content: absoluteImageUrl });

    // Log for debugging
    console.log('Meta tags updated for series page:', currentUrl);
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  openPost(post: Post) {
    // This method is required for compatibility with the post-by component
  }
}
