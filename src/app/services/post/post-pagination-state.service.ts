import { Injectable, computed, signal } from '@angular/core';
import { Post } from '@models/_index';
import { Pagination } from '@models/api';

export interface PostPaginationState {
  posts: Post[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: PostPaginationState = {
  posts: [],
  pagination: null,
  loading: false,
  error: null,
};

/**
 * Signal-based state service for post list pagination.
 * Decouples pagination state from PostService HTTP calls
 * so any page component can subscribe reactively without
 * prop-drilling or BehaviorSubject boilerplate.
 *
 * Usage:
 *   inject PostPaginationStateService, call setLoading()/setResult()/setError()
 *   from the component that fetches posts, then read signals in templates.
 */
@Injectable({ providedIn: 'root' })
export class PostPaginationStateService {
  private readonly _state = signal<PostPaginationState>(initialState);

  /** Currently loaded posts */
  readonly posts = computed(() => this._state().posts);

  /** Pagination metadata from the last successful fetch */
  readonly pagination = computed(() => this._state().pagination);

  /** True while a fetch is in flight */
  readonly loading = computed(() => this._state().loading);

  /** Non-null when the last fetch resulted in an error */
  readonly error = computed(() => this._state().error);

  /** Derived: current page number (1-based) */
  readonly currentPage = computed(() => this._state().pagination?.page ?? 1);

  /** Derived: true when a next page exists */
  readonly hasNextPage = computed(
    () => this._state().pagination?.hasNextPage ?? false
  );

  /** Derived: true when a previous page exists */
  readonly hasPrevPage = computed(
    () => this._state().pagination?.hasPrevPage ?? false
  );

  /** Derived: total number of documents across all pages */
  readonly totalDocs = computed(() => this._state().pagination?.totalDocs ?? 0);

  setLoading(): void {
    this._state.update(s => ({ ...s, loading: true, error: null }));
  }

  setResult(posts: Post[], pagination: Pagination | null): void {
    this._state.update(() => ({
      posts,
      pagination,
      loading: false,
      error: null,
    }));
  }

  appendResult(posts: Post[], pagination: Pagination | null): void {
    this._state.update(s => ({
      posts: [...s.posts, ...posts],
      pagination,
      loading: false,
      error: null,
    }));
  }

  setError(message: string): void {
    this._state.update(s => ({ ...s, loading: false, error: message }));
  }

  reset(): void {
    this._state.set(initialState);
  }
}
