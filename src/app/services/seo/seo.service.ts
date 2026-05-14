import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, PlatformLocation, isPlatformServer } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '@environments/environment';
import { Post } from '@models/post';

const SITE_ORIGIN = 'https://dangtrinh.site';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/img/ghost.png`;
const DEFAULT_OG_IMAGE_WIDTH = '1200';
const DEFAULT_OG_IMAGE_HEIGHT = '630';

export interface BlogSeoInput {
  title: string;
  description: string;
  author?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string | Date;
  modifiedTime?: string | Date;
  tags?: string[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private titleService: Title,
    private meta: Meta,
    private platformLocation: PlatformLocation,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  setBlogTags(post: Post): void {
    const title = (post.title as string) || 'Ghost Site';
    const description = (post.description as string) || '';
    const author = (post.author as string) || 'Dang Trinh';
    const image = this.toAbsoluteUrl(post.postBackgroundImg as string);
    const url = this.currentAbsoluteUrl();

    this.applyTags({
      title,
      description,
      author,
      image,
      url,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      tags: (post.tags || []).map(t => t.name).filter(Boolean) as string[],
    });
  }

  applyTags(input: BlogSeoInput): void {
    const title = input.title;
    const description = input.description;
    const author = input.author || 'Dang Trinh';
    const image = this.toAbsoluteUrl(input.image) || DEFAULT_OG_IMAGE;
    const url = input.url || this.currentAbsoluteUrl();
    const type = input.type || 'website';

    this.titleService.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ itemprop: 'name', content: title });
    this.meta.updateTag({ itemprop: 'description', content: description });
    this.meta.updateTag({ itemprop: 'image', content: image });

    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:secure_url', content: image });
    this.meta.updateTag({ property: 'og:image:width', content: DEFAULT_OG_IMAGE_WIDTH });
    this.meta.updateTag({ property: 'og:image:height', content: DEFAULT_OG_IMAGE_HEIGHT });
    this.meta.updateTag({ property: 'og:image:alt', content: title });
    this.meta.updateTag({ property: 'og:site_name', content: "Ghost's Blogs" });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });
    this.meta.updateTag({ property: 'article:author', content: author });

    if (input.publishedTime) {
      this.meta.updateTag({
        property: 'article:published_time',
        content: this.toIso(input.publishedTime),
      });
    }
    if (input.modifiedTime) {
      this.meta.updateTag({
        property: 'article:modified_time',
        content: this.toIso(input.modifiedTime),
      });
    }
    (input.tags || []).forEach(tag => {
      this.meta.addTag({ property: 'article:tag', content: tag });
    });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: title });
    this.meta.updateTag({ name: 'twitter:creator', content: author });

    this.setCanonical(url);
  }

  resetToDefaults(): void {
    this.titleService.setTitle('Ghost Site');
    this.meta.removeTag('itemprop="name"');
    this.meta.removeTag('itemprop="description"');
    this.meta.removeTag('itemprop="image"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.meta.removeTag('name="twitter:image"');
    this.meta.removeTag('name="twitter:image:alt"');
    this.meta.removeTag('name="twitter:creator"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:url"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:image:secure_url"');
    this.meta.removeTag('property="og:image:width"');
    this.meta.removeTag('property="og:image:height"');
    this.meta.removeTag('property="og:image:alt"');
    this.meta.removeTag('property="article:author"');
    this.meta.removeTag('property="article:published_time"');
    this.meta.removeTag('property="article:modified_time"');
    const articleTags = this.document.querySelectorAll(
      'meta[property="article:tag"]'
    );
    articleTags.forEach(node => node.parentNode?.removeChild(node));
  }

  private currentAbsoluteUrl(): string {
    const href = this.platformLocation.href || '';
    if (/^https?:\/\//i.test(href)) {
      return href.replace(/^http:\/\//i, environment.production ? 'https://' : 'http://');
    }
    const path = this.platformLocation.pathname || '/';
    const search = this.platformLocation.search || '';
    const origin = isPlatformServer(this.platformId)
      ? SITE_ORIGIN
      : (this.document.location?.origin || SITE_ORIGIN);
    return `${origin}${path}${search}`;
  }

  private toAbsoluteUrl(maybeUrl?: string | null): string {
    if (!maybeUrl) return '';
    const trimmed = maybeUrl.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('//')) return `https:${trimmed}`;
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${SITE_ORIGIN}${path}`;
  }

  private toIso(value: string | Date): string {
    try {
      return new Date(value).toISOString();
    } catch {
      return String(value);
    }
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    if (!head) return;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
