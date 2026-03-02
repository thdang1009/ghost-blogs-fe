import { TestBed } from '@angular/core/testing';
import { PostPaginationStateService } from './post-pagination-state.service';
import { Post } from '@models/_index';
import { Pagination } from '@models/api';

const mockPosts: Post[] = [
  { _id: '1', title: 'Post A', postReference: 'post-a' },
  { _id: '2', title: 'Post B', postReference: 'post-b' },
];

const mockPagination: Pagination = {
  totalDocs: 20,
  limit: 10,
  totalPages: 2,
  page: 1,
  hasPrevPage: false,
  hasNextPage: true,
  prevPage: null,
  nextPage: 2,
};

describe('PostPaginationStateService', () => {
  let service: PostPaginationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostPaginationStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Initial state ─────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('posts() is empty', () => expect(service.posts()).toEqual([]));
    it('pagination() is null', () => expect(service.pagination()).toBeNull());
    it('loading() is false', () => expect(service.loading()).toBeFalse());
    it('error() is null', () => expect(service.error()).toBeNull());
    it('currentPage() is 1', () => expect(service.currentPage()).toBe(1));
    it('hasNextPage() is false', () =>
      expect(service.hasNextPage()).toBeFalse());
    it('hasPrevPage() is false', () =>
      expect(service.hasPrevPage()).toBeFalse());
    it('totalDocs() is 0', () => expect(service.totalDocs()).toBe(0));
  });

  // ── setLoading ────────────────────────────────────────────────────────────────

  describe('setLoading()', () => {
    it('sets loading to true', () => {
      service.setLoading();
      expect(service.loading()).toBeTrue();
    });

    it('clears any previous error', () => {
      service.setError('previous error');
      service.setLoading();
      expect(service.error()).toBeNull();
    });
  });

  // ── setResult ─────────────────────────────────────────────────────────────────

  describe('setResult()', () => {
    it('sets posts and pagination', () => {
      service.setResult(mockPosts, mockPagination);
      expect(service.posts().length).toBe(2);
      expect(service.pagination()?.totalDocs).toBe(20);
    });

    it('sets loading to false', () => {
      service.setLoading();
      service.setResult(mockPosts, mockPagination);
      expect(service.loading()).toBeFalse();
    });

    it('clears any previous error', () => {
      service.setError('oops');
      service.setResult(mockPosts, null);
      expect(service.error()).toBeNull();
    });

    it('updates derived signals correctly', () => {
      service.setResult(mockPosts, mockPagination);
      expect(service.currentPage()).toBe(1);
      expect(service.hasNextPage()).toBeTrue();
      expect(service.hasPrevPage()).toBeFalse();
      expect(service.totalDocs()).toBe(20);
    });
  });

  // ── appendResult ──────────────────────────────────────────────────────────────

  describe('appendResult()', () => {
    it('appends new posts to existing posts', () => {
      service.setResult(mockPosts, mockPagination);
      const morePosts: Post[] = [{ _id: '3', title: 'Post C' }];
      service.appendResult(morePosts, {
        ...mockPagination,
        page: 2,
        hasNextPage: false,
      });
      expect(service.posts().length).toBe(3);
    });

    it('updates pagination to the new page', () => {
      service.setResult(mockPosts, mockPagination);
      const page2Pagination = {
        ...mockPagination,
        page: 2,
        hasNextPage: false,
        hasPrevPage: true,
      };
      service.appendResult([], page2Pagination);
      expect(service.currentPage()).toBe(2);
      expect(service.hasNextPage()).toBeFalse();
      expect(service.hasPrevPage()).toBeTrue();
    });
  });

  // ── setError ──────────────────────────────────────────────────────────────────

  describe('setError()', () => {
    it('stores the error message', () => {
      service.setError('fetch failed');
      expect(service.error()).toBe('fetch failed');
    });

    it('sets loading to false', () => {
      service.setLoading();
      service.setError('fetch failed');
      expect(service.loading()).toBeFalse();
    });
  });

  // ── reset ─────────────────────────────────────────────────────────────────────

  describe('reset()', () => {
    it('restores all state to initial values', () => {
      service.setResult(mockPosts, mockPagination);
      service.reset();
      expect(service.posts()).toEqual([]);
      expect(service.pagination()).toBeNull();
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });
  });
});
