import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { PostService } from '@services/_index';
import { Router } from '@angular/router';
import { Title, Meta } from "@angular/platform-browser";
import { POST_TYPE } from '@shared/enum';
import { Post } from '@models/post';
import { addStructuredData } from '@shared/common';
import { DOCUMENT, isPlatformServer, PlatformLocation } from '@angular/common';
import { filter } from 'rxjs/operators';
import { environment } from '@environments/environment';
// Declare FB globally to access the Facebook SDK
declare const FB: any;

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  ready = false;
  item!: Post;
  idDebounce: any = undefined;
  POST_TYPE = POST_TYPE;
  num = 0;
  count: Number = 0;
  currentPageUrl: string = '';

  // @ViewChild('fbLike') fbLike!: ElementRef;
  @ViewChild('fbComments') fbComments!: ElementRef;
  @ViewChild('fbShareButton') fbShareButton!: ElementRef;
  @ViewChild('fbShareButtonLink') fbShareButtonLink!: ElementRef;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private platformLocation: PlatformLocation,
    private renderer: Renderer2
  ) {
    addStructuredData(this.document);
  }

  private setCurrentPageUrl() {
    if (isPlatformServer(this.platformId)) {
      // This code will only run on the server
      // You would typically get the URL from the request object here
      // For example, if you are using a Node.js server with Express:
      // this.currentPageUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      // However, for the client-side rendering after SSR, we'll use PlatformLocation
      this.currentPageUrl = environment.production ?
        this.platformLocation.href : 'https://dangtrinh.site/blogs/test-post-and-markdown';
    } else {
      // This code will run on the client
      this.currentPageUrl = environment.production ?
        this.platformLocation.href : 'https://dangtrinh.site/blogs/test-post-and-markdown';
    }

    // Update the URL when the route changes (optional, for single-page applications)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentPageUrl = this.platformLocation.href;
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
      this.ready = true;
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
      fbShareButtonLink.setAttribute('href', 'https://www.facebook.com/sharer/sharer.php?u=' + this.currentPageUrl);
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
      this.postService.clapPost(this.item, this.num)
        .subscribe(_ => {
          this.item = _;
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
      this.renderer.setStyle(heart, 'transform', 'translateY(-50px) scale(1.5)');
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
  imgClick() {

  }
  backToHome() {
    this.router.navigate(['home']);
  }
}
