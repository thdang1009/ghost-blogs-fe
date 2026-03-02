import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Post } from '@models/_index';
import { PostListResponse, PostQueryParams } from '@models/api';
import { buildQueryString, handleError, ghostLog } from '@shared/common';
import { ApiConfigService } from '@services/api-config/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private get apiUrl(): string {
    return this.apiConfigService.getApiUrl('/v1/post');
  }

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {}

  getPublicPosts(req: PostQueryParams = {}): Observable<PostListResponse> {
    const hasKeys = !!Object.keys(req).length;
    const queryString = (hasKeys && '?' + buildQueryString(req)) || '';
    const url = `${this.apiUrl}/public${queryString}`;
    return this.http.get<PostListResponse>(url).pipe(
      tap(() => ghostLog(`fetched public post`)),
      catchError(
        handleError<PostListResponse>(`getPublicPost`, {
          posts: [],
          pagination: null,
        })
      )
    );
  }

  getMostReadPosts(
    limit: number = 6,
    includePrivate: boolean = false
  ): Observable<{ posts: Post[] }> {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    if (includePrivate) {
      params.set('private', 'true');
    }
    const url = `${this.apiUrl}/most-read?${params.toString()}`;
    return this.http.get<{ posts: Post[] }>(url).pipe(
      tap(() => ghostLog(`fetched most read posts`)),
      catchError(
        handleError<{ posts: Post[] }>(`getMostReadPosts`, { posts: [] })
      )
    );
  }

  getRecentPosts(
    page: number = 1,
    limit: number = 10,
    includePrivate: boolean = false
  ): Observable<PostListResponse> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (includePrivate) {
      params.set('private', 'true');
    }
    const url = `${this.apiUrl}/recent?${params.toString()}`;
    return this.http.get<PostListResponse>(url).pipe(
      tap(() => ghostLog(`fetched recent posts`)),
      catchError(
        handleError<PostListResponse>(`getRecentPosts`, {
          posts: [],
          pagination: null,
        })
      )
    );
  }

  getTagsSummary(
    includePrivate: boolean = false
  ): Observable<{ tags: { name: string; count: number; _id?: string }[] }> {
    const params = new URLSearchParams();
    if (includePrivate) {
      params.set('private', 'true');
    }
    const url = `${this.apiUrl}/tags-summary?${params.toString()}`;
    return this.http
      .get<{ tags: { name: string; count: number; _id?: string }[] }>(url)
      .pipe(
        tap(() => ghostLog(`fetched tags summary`)),
        catchError(
          handleError<{
            tags: { name: string; count: number; _id?: string }[];
          }>(`getTagsSummary`, { tags: [] })
        )
      );
  }

  getSeriesSummary(
    includePrivate: boolean = false
  ): Observable<{ series: { name: string; count: number; _id?: string }[] }> {
    const params = new URLSearchParams();
    if (includePrivate) {
      params.set('private', 'true');
    }
    const url = `${this.apiUrl}/series-summary?${params.toString()}`;
    return this.http
      .get<{ series: { name: string; count: number; _id?: string }[] }>(url)
      .pipe(
        tap(() => ghostLog(`fetched series summary`)),
        catchError(
          handleError<{
            series: { name: string; count: number; _id?: string }[];
          }>(`getSeriesSummary`, { series: [] })
        )
      );
  }

  getPost(ref: string): Observable<Post> {
    const url = `${this.apiUrl}/ref/${ref}`;
    return this.http.get<Post>(url).pipe(
      tap(() => ghostLog(`fetched post by ref=${ref}`)),
      catchError(handleError<Post>(`getPost ref=${ref}`))
    );
  }

  getPostAsAdmin(id: string | number): Observable<Post> {
    const url = `${this.apiUrl}/get-as-member/${id}`;
    return this.http.get<Post>(url).pipe(
      tap(() => ghostLog(`fetched post by id=${id}`)),
      catchError(handleError<Post>(`getPost id=${id}`))
    );
  }

  getAllPost(
    req: PostQueryParams,
    excludeContent: boolean = false
  ): Observable<PostListResponse> {
    const requestParams = excludeContent
      ? { ...req, excludeContent: true }
      : req;
    const queryString = buildQueryString(requestParams);
    const url = `${this.apiUrl}?${queryString}`;
    return this.http.get<PostListResponse>(url).pipe(
      tap(() => ghostLog(`fetched my post`)),
      catchError(
        handleError<PostListResponse>(`getAllPost`, {
          posts: [],
          pagination: null,
        })
      )
    );
  }

  addPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post).pipe(
      tap(() => ghostLog(`added post id=${post.id}`)),
      catchError(handleError<Post>('addPost'))
    );
  }

  clapPost(post: Post, num: number): Observable<Post> {
    return this.http
      .put<Post>(`${this.apiUrl}/clap-post/${post.id}`, { numIncrease: num })
      .pipe(
        tap(() => ghostLog(`clap post id=${post.id}`)),
        catchError(handleError<Post>('clap post'))
      );
  }

  updatePost(id: string | number, post: Post): Observable<Post> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Post>(url, post).pipe(
      tap(() => ghostLog(`updated post id=${id}`)),
      catchError(handleError<Post>('updatePost'))
    );
  }

  deletePost(id: string | number): Observable<Post> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Post>(url).pipe(
      tap(() => ghostLog(`deleted post id=${id}`)),
      catchError(handleError<Post>('deletePost'))
    );
  }

  getSeriesPosts(seriesId: string, currentPostId?: number): Observable<Post[]> {
    let url = `${this.apiUrl}/series-posts/${seriesId}`;
    if (currentPostId) {
      url += `?currentPostId=${currentPostId}`;
    }
    return this.http.get<Post[]>(url).pipe(
      tap(() => ghostLog(`fetched posts for series=${seriesId}`)),
      catchError(handleError<Post[]>(`getSeriesPosts seriesId=${seriesId}`, []))
    );
  }
}
