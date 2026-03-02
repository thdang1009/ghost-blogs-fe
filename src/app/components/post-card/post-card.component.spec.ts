import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PostCardComponent } from './post-card.component';
import { Post } from '@models/_index';
import { MarkdownModule } from 'ngx-markdown';

const mockPost: Post = {
  _id: 'post1',
  id: 1,
  title: 'Angular 18 Deep Dive',
  description: 'A comprehensive look at Angular 18 signals.',
  postReference: 'angular-18-deep-dive',
  postBackgroundImg: 'https://example.com/img.jpg',
  author: 'Ghost',
  permission: 'PUBLIC',
  createdAt: new Date('2024-06-01'),
  viewCount: 1200,
  readTime: 8,
  tags: [
    { _id: 't1', name: 'angular' },
    { _id: 't2', name: 'signals' },
  ],
  series: {
    _id: 's1',
    name: 'Frontend Masters',
    slug: 'frontend-masters',
  },
};

describe('PostCardComponent', () => {
  let component: PostCardComponent;
  let fixture: ComponentFixture<PostCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PostCardComponent,
        RouterTestingModule,
        MarkdownModule.forRoot(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCardComponent);
    component = fixture.componentInstance;
    component.post = mockPost;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Inputs & defaults ─────────────────────────────────────────────────────────

  describe('Input defaults', () => {
    it('showSeries defaults to true', () => {
      expect(component.showSeries).toBeTrue();
    });

    it('showTags defaults to true', () => {
      expect(component.showTags).toBeTrue();
    });

    it('compact defaults to false', () => {
      expect(component.compact).toBeFalse();
    });

    it('priority defaults to false', () => {
      expect(component.priority).toBeFalse();
    });
  });

  // ── Template rendering ────────────────────────────────────────────────────────

  describe('template rendering', () => {
    it('renders the post title', () => {
      const title = fixture.debugElement.query(By.css('.post-title'));
      expect(title.nativeElement.textContent).toContain('Angular 18 Deep Dive');
    });

    it('adds compact-card class when compact=true', () => {
      fixture.componentRef.setInput('compact', true);
      fixture.detectChanges();
      const article = fixture.debugElement.query(By.css('article'));
      expect(article.nativeElement.classList).toContain('compact-card');
    });

    it('adds private-post class when permission is PRIVATE', () => {
      fixture.componentRef.setInput('post', {
        ...mockPost,
        permission: 'PRIVATE',
      });
      fixture.detectChanges();
      const article = fixture.debugElement.query(By.css('article'));
      expect(article.nativeElement.classList).toContain('private-post');
    });

    it('shows series info when showSeries=true and post has series', () => {
      fixture.componentRef.setInput('showSeries', true);
      fixture.detectChanges();
      const series = fixture.debugElement.query(By.css('.series-info'));
      expect(series).not.toBeNull();
    });

    it('hides series info when showSeries=false', () => {
      fixture.componentRef.setInput('showSeries', false);
      fixture.detectChanges();
      const series = fixture.debugElement.query(By.css('.series-info'));
      expect(series).toBeNull();
    });

    it('hides series info when post has no series', () => {
      fixture.componentRef.setInput('post', { ...mockPost, series: undefined });
      fixture.detectChanges();
      const series = fixture.debugElement.query(By.css('.series-info'));
      expect(series).toBeNull();
    });

    it('shows tags when showTags=true and post has tags', () => {
      fixture.componentRef.setInput('showTags', true);
      fixture.detectChanges();
      const tags = fixture.debugElement.queryAll(By.css('.tagging'));
      expect(tags.length).toBe(2);
    });

    it('hides tags when showTags=false', () => {
      fixture.componentRef.setInput('showTags', false);
      fixture.detectChanges();
      const tags = fixture.debugElement.queryAll(By.css('.tagging'));
      expect(tags.length).toBe(0);
    });

    it('uses ngSrc for the post image (NgOptimizedImage)', () => {
      const img = fixture.debugElement.query(By.css('img'));
      expect(img).not.toBeNull();
      // NgOptimizedImage replaces the img element internals; the attribute is present
      expect(
        img.nativeElement.hasAttribute('ng-img') ||
          img.nativeElement.src ||
          img.nativeElement.getAttribute('ngsrc') !== null
      ).toBeTruthy();
    });
  });

  // ── Routing ───────────────────────────────────────────────────────────────────

  describe('routing', () => {
    it('thumbnail link points to the correct post reference', () => {
      const link = fixture.debugElement.query(By.css('a.post-thumbnail'));
      expect(link.nativeElement.getAttribute('href')).toContain(
        'angular-18-deep-dive'
      );
    });

    it('title link points to the correct post reference', () => {
      const link = fixture.debugElement.query(By.css('.post-title a'));
      expect(link.nativeElement.getAttribute('href')).toContain(
        'angular-18-deep-dive'
      );
    });

    it('tag links include the tag name as a query param', () => {
      const tagLinks = fixture.debugElement.queryAll(By.css('.tagging__item'));
      expect(tagLinks[0].nativeElement.getAttribute('href')).toContain(
        'angular'
      );
    });
  });
});
