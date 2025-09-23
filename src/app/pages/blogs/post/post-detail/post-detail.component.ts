import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { PostService } from '@services/_index';
import { PostAnalyticsService } from '@services/post-analytics/post-analytics.service';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { POST_TYPE } from '@shared/enum';
import { Post } from '@models/post';
import { addStructuredData } from '@shared/common';
import { DOCUMENT, isPlatformServer, PlatformLocation } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { environment } from '@environments/environment';
import {
  LanguageDetectionService,
  Language,
} from '../../../../services/language-detection.service';
// Declare FB globally to access the Facebook SDK
declare const FB: any;

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  ready = false;
  item!: Post;
  idDebounce: any = undefined;
  POST_TYPE = POST_TYPE;
  num = 0;
  count: Number = 0;
  currentPageUrl: string = '';

  // Analytics tracking
  private destroy$ = new Subject<void>();
  private viewStartTime: number = 0;
  private maxScrollDepth: number = 0;
  private scrollTrackingActive: boolean = false;

  // Bilingual content properties
  currentLanguage: Language = 'en';
  primaryLanguage: Language = 'en';
  alternativeLanguage: Language = 'vi';
  displayContent: string = '';

  // @ViewChild('fbLike') fbLike!: ElementRef;
  @ViewChild('fbComments') fbComments!: ElementRef;
  @ViewChild('fbShareButton') fbShareButton!: ElementRef;
  @ViewChild('fbShareButtonLink') fbShareButtonLink!: ElementRef;

  constructor(
    private postService: PostService,
    private postAnalyticsService: PostAnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private platformLocation: PlatformLocation,
    private renderer: Renderer2,
    private languageDetection: LanguageDetectionService
  ) {
    addStructuredData(this.document);
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  private setCurrentPageUrl() {
    if (isPlatformServer(this.platformId)) {
      // This code will only run on the server
      // You would typically get the URL from the request object here
      // For example, if you are using a Node.js server with Express:
      // this.currentPageUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      // However, for the client-side rendering after SSR, we'll use PlatformLocation
      this.currentPageUrl = environment.production
        ? this.platformLocation.href.replace('http://', 'https://')
        : 'https://dangtrinh.site/blogs/test-post-and-markdown';
    } else {
      // This code will run on the client
      this.currentPageUrl = environment.production
        ? this.platformLocation.href.replace('http://', 'https://')
        : 'https://dangtrinh.site/blogs/test-post-and-markdown';
    }

    // Update the URL when the route changes (optional, for single-page applications)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentPageUrl = this.platformLocation.href.replace(
          'http://',
          'https://'
        );
      });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('ref');

    this.postService.getPost(id as string).subscribe(post => {
      this.item = post;
      this.count = post.clapCount || 0;

      // Set the current page URL for Facebook plugins
      this.setCurrentPageUrl();

      const subject = post.title as string;
      const desc = post.description as string;
      const creator = post.author as string;
      const img = post.postBackgroundImg as string;
      this.titleService.setTitle(post.title as string);
      this.meta.updateTag({ itemprop: 'name', content: subject });
      this.meta.updateTag({ itemprop: 'description', content: desc });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
      this.meta.updateTag({ name: 'twitter:title', content: subject });
      this.meta.updateTag({ name: 'twitter:description', content: desc });
      this.meta.updateTag({ name: 'twitter:creator', content: creator });
      this.meta.updateTag({ name: 'twitter:image', content: img });
      this.meta.updateTag({ property: 'og:title', content: subject });
      this.meta.updateTag({ property: 'og:description', content: desc });
      this.meta.updateTag({ property: 'og:creator', content: creator });
      this.meta.updateTag({ property: 'og:image', content: img });
      this.meta.updateTag({ property: 'og:url', content: this.currentPageUrl });

      // Initialize bilingual content
      this.initializeBilingualContent();

      this.ready = true;

      // Start analytics tracking
      this.startAnalyticsTracking();
    });
  }

  ngAfterViewInit() {
    const intervalId = setInterval(() => {
      if (this.ready) {
        this.setCurrentPageUrlToFacebookPlugins();
        // Reload Facebook plugins after the post is loaded
        this.reloadFacebookPlugins();
        clearInterval(intervalId);
      }
    }, 150);
  }

  setCurrentPageUrlToFacebookPlugins() {
    const fbShareButton = this.fbShareButton.nativeElement;
    if (fbShareButton) {
      fbShareButton.setAttribute('data-href', this.currentPageUrl);
    }
    const fbComments = this.fbComments.nativeElement;
    if (fbComments) {
      fbComments.setAttribute('data-href', this.currentPageUrl);
    }
    const fbShareButtonLink = this.fbShareButtonLink.nativeElement;
    if (fbShareButtonLink) {
      fbShareButtonLink.setAttribute(
        'href',
        'https://www.facebook.com/sharer/sharer.php?u=' + this.currentPageUrl
      );
    }
  }
  /**
   * Reload Facebook plugins after dynamic content is loaded
   */
  reloadFacebookPlugins(): void {
    if (typeof FB !== 'undefined') {
      FB.XFBML.parse();
    }
  }

  /**
   * Helper method to encode URI component for sharing
   */
  encodeURIComponent(url: string): string {
    return encodeURIComponent(url);
  }

  ngOnDestroy(): void {
    // Stop analytics tracking and send final data
    this.stopAnalyticsTracking();

    this.meta.removeTag('itemprop="name"');
    this.meta.removeTag('itemprop="description"');
    this.meta.removeTag('name="twitter:card"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.meta.removeTag('name="twitter:creator"');
    this.meta.removeTag('name="twitter:image"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:creator"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:url"');
    this.titleService.setTitle('Ghost Site');

    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle clapping for the post with animation effect
   */
  clapThisPost(e: any) {
    // Create clap animation
    this.createClapAnimation(e);

    // Make debounce for API call
    this.num++;
    if (this.idDebounce) {
      clearTimeout(this.idDebounce);
    }
    this.idDebounce = setTimeout(() => {
      this.postService.clapPost(this.item, this.num).subscribe(_ => {
        // Preserve series navigation data when updating the post
        const previousPostId = this.item.previousPostId;
        const nextPostId = this.item.nextPostId;
        this.item = _;
        // Restore series navigation data
        this.item.previousPostId = previousPostId;
        this.item.nextPostId = nextPostId;
        this.num = 0;
        this.count = _.clapCount || 0;
        clearTimeout(this.idDebounce);
      });
    }, 500);
  }

  /**
   * Create a floating heart animation when clap button is clicked
   */
  createClapAnimation(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;

    // Create a heart element
    const heart = this.renderer.createElement('i');
    this.renderer.addClass(heart, 'material-icons');
    this.renderer.addClass(heart, 'clap-animation');
    this.renderer.setStyle(heart, 'position', 'fixed');
    this.renderer.setStyle(heart, 'color', '#e91e63');
    this.renderer.setStyle(heart, 'font-size', '16px');
    this.renderer.setStyle(heart, 'pointer-events', 'none');
    this.renderer.setStyle(heart, 'opacity', '1');
    this.renderer.setStyle(heart, 'transform', 'scale(1)');
    this.renderer.setStyle(heart, 'transition', 'all 0.7s ease-out');

    // Set the text content to heart icon
    this.renderer.setProperty(heart, 'textContent', 'favorite');

    console.log('target', target);
    // Position the heart relative to the button
    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - 8;
    const y = rect.top - 10;
    console.log('x', x);
    console.log('y', y);

    this.renderer.setStyle(heart, 'left', `${x}px`);
    this.renderer.setStyle(heart, 'top', `${y}px`);
    console.log('heart', heart);

    // Add to DOM at the click position
    this.renderer.appendChild(this.document.body, heart);
    // Animate the heart
    setTimeout(() => {
      this.renderer.setStyle(
        heart,
        'transform',
        'translateY(-50px) scale(1.5)'
      );
      this.renderer.setStyle(heart, 'opacity', '0');
      // Remove the element after animation completes
      setTimeout(() => {
        this.renderer.removeChild(this.document.body, heart);
      }, 700);
    }, 10);
  }

  updateClap() {
    console.log('update');
  }

  removeClap() {
    console.log('remove');
  }
  imgClick() {}
  backToHome() {
    this.router.navigate(['home']);
  }

  goToPost(post: Post): void {
    // Add defensive programming to handle incomplete post data
    if (!post) {
      console.error('Post object is null or undefined');
      return;
    }

    if (!post.postReference) {
      console.error('Post reference is missing for post:', post);
      return;
    }

    try {
      this.router.navigate(['/blogs', post.postReference]);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: navigate to home if navigation fails
      this.router.navigate(['/home']);
    }
  }

  private startAnalyticsTracking(): void {
    if (!this.item || isPlatformServer(this.platformId)) {
      return; // Don't track on server side
    }

    this.viewStartTime = Date.now();
    this.maxScrollDepth = 0;
    this.scrollTrackingActive = true;

    // Track initial page view
    this.postAnalyticsService
      .trackPostView({
        postId: this.item._id,
        postReference: this.item.postReference as string,
        title: this.item.title as string,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Set up scroll tracking
    this.setupScrollTracking();

    // Set up periodic tracking (every 30 seconds while active)
    this.setupPeriodicTracking();
  }

  private setupScrollTracking(): void {
    if (isPlatformServer(this.platformId)) return;

    const scrollHandler = () => {
      if (!this.scrollTrackingActive) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollDepth = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      if (scrollDepth > this.maxScrollDepth) {
        this.maxScrollDepth = Math.min(scrollDepth, 100);
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Remove listener when component is destroyed
    this.destroy$.subscribe(() => {
      window.removeEventListener('scroll', scrollHandler);
    });
  }

  private setupPeriodicTracking(): void {
    if (isPlatformServer(this.platformId)) return;

    // Track every 30 seconds
    const interval = setInterval(() => {
      if (!this.scrollTrackingActive || !this.item) {
        clearInterval(interval);
        return;
      }

      const viewDuration = Math.round((Date.now() - this.viewStartTime) / 1000);

      this.postAnalyticsService
        .trackPostView({
          postId: this.item._id,
          postReference: this.item.postReference as string,
          title: this.item.title as string,
          viewDuration,
          scrollDepth: this.maxScrollDepth,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }, 30000); // Every 30 seconds

    // Clear interval when component is destroyed
    this.destroy$.subscribe(() => {
      clearInterval(interval);
    });
  }

  private stopAnalyticsTracking(): void {
    if (
      !this.item ||
      !this.scrollTrackingActive ||
      isPlatformServer(this.platformId)
    ) {
      return;
    }

    this.scrollTrackingActive = false;
    const viewDuration = Math.round((Date.now() - this.viewStartTime) / 1000);

    // Send final tracking data
    this.postAnalyticsService
      .trackPostView({
        postId: this.item._id,
        postReference: this.item.postReference as string,
        title: this.item.title as string,
        viewDuration,
        scrollDepth: this.maxScrollDepth,
        exitPage: true,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  // Bilingual content methods
  private initializeBilingualContent(): void {
    if (this.item?.content) {
      // Detect primary language from content
      this.primaryLanguage = this.languageDetection.detectLanguage(
        this.item.content
      );
      this.alternativeLanguage = this.languageDetection.getOppositeLanguage(
        this.primaryLanguage
      );

      // Load user preference or default to primary language
      const preferredLanguage = this.languageDetection.getPreferredLanguage();
      if (
        preferredLanguage &&
        this.hasAlternativeContent &&
        preferredLanguage === this.alternativeLanguage
      ) {
        this.currentLanguage = preferredLanguage;
      } else {
        this.currentLanguage = this.primaryLanguage;
      }

      // Set display content
      this.updateDisplayContent();
    }
  }

  private updateDisplayContent(): void {
    if (this.currentLanguage === this.primaryLanguage) {
      this.displayContent = this.item.content || '';
    } else {
      this.displayContent =
        this.item.alternativeContent || this.item.content || '';
    }
  }

  get hasAlternativeContent(): boolean {
    return !!this.item?.alternativeContent?.trim()?.length;
  }

  onLanguageChanged(language: Language): void {
    this.currentLanguage = language;
    this.updateDisplayContent();

    // Update meta tags for the selected language content
    this.updateMetaTagsForLanguage(language);
  }

  private updateMetaTagsForLanguage(language: Language): void {
    const content =
      language === this.primaryLanguage
        ? this.item.content
        : this.item.alternativeContent;
    const title = this.item.title || '';
    const description = this.item.description || '';

    // Update page title and meta tags
    const languagePrefix =
      language === this.alternativeLanguage
        ? `[${this.languageDetection.getLanguageDisplayName(language)}] `
        : '';
    this.titleService.setTitle(languagePrefix + title);

    // Update meta description if we have alternative content
    if (language === this.alternativeLanguage && this.item.alternativeContent) {
      // Extract description from alternative content (first 160 characters)
      const altDescription = this.extractDescriptionFromContent(
        this.item.alternativeContent
      );
      this.meta.updateTag({ name: 'description', content: altDescription });
      this.meta.updateTag({
        property: 'og:description',
        content: altDescription,
      });
      this.meta.updateTag({
        name: 'twitter:description',
        content: altDescription,
      });
    } else {
      // Restore original description
      this.meta.updateTag({
        name: 'description',
        content: description as string,
      });
      this.meta.updateTag({
        property: 'og:description',
        content: description as string,
      });
      this.meta.updateTag({
        name: 'twitter:description',
        content: description as string,
      });
    }
  }

  private extractDescriptionFromContent(content: string): string {
    // Remove markdown formatting and extract first 160 characters
    const plainText = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .trim();

    return plainText.length > 160
      ? plainText.substring(0, 157) + '...'
      : plainText;
  }

  getLanguageDisplayName(language: Language): string {
    return this.languageDetection.getLanguageDisplayName(language);
  }
}
