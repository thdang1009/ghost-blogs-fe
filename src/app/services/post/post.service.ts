import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Post } from '@models/_index';
import { buildQueryString, handleError, ghostLog } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/post';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) { }

  // lấy hết list post cho khách, nếu là admin thì thấy bài viết ẩn của bản thân
  getPublicPosts(req?: any): Observable<Post[]> {
    const hasKeys = !!Object.keys(req).length;
    const queryString = hasKeys && ('?' + buildQueryString(req)) || '';
    const url = `${apiUrl}/public${req && queryString || ''}`;
    return this.http.get<Post[]>(url).pipe(
      tap(_ => ghostLog(`fetched public post`)),
      catchError(handleError<Post[]>(`getPublicPost`, []))
    );
  }

  // khách xem post
  getPost(ref: String): Observable<Post> {
    const url = `${apiUrl}/ref/${ref}`;
    return this.http.get<Post>(url).pipe(
      tap(_ => ghostLog(`fetched post by ref=${ref}`)),
      catchError(handleError<Post>(`getPost ref=${ref}`))
    );
  }

  // admin xem và edit post
  getPostAsAdmin(id: any): Observable<Post> {
    const url = `${apiUrl}/get-as-member/${id}`;
    return this.http.get<Post>(url).pipe(
      tap(_ => ghostLog(`fetched post by id=${id}`)),
      catchError(handleError<Post>(`getPost id=${id}`))
    );
  }

  // lấy danh sách tất cả post
  getAllPost(req: any): Observable<Post> {
    const queryString = buildQueryString(req);
    const url = `${apiUrl}?${queryString}`;
    return this.http.get<Post>(url).pipe(
      tap(_ => ghostLog(`fetched my post`)),
      catchError(handleError<Post>(`getAllPost`))
    );
  }

  addPost(post: Post): Observable<Post> {
    return this.http.post<Post>(apiUrl, post).pipe(
      tap((prod: Post) => ghostLog(`added post id=${post.id}`)),
      catchError(handleError<Post>('addPost'))
    );
  }

  clapPost(post: Post, num: number): Observable<Post> {
    return this.http.put<Post>(`${apiUrl}/clap-post/${post.id}`, { numIncrease: num })
      .pipe(
        tap((prod: Post) => ghostLog(`clap post id=${post.id}`)),
        catchError(handleError<Post>('clap post'))
      );
  }

  updatePost(id: any, post: Post): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, post).pipe(
      tap(_ => ghostLog(`updated post id=${id}`)),
      catchError(handleError<any>('updatePost'))
    );
  }

  deletePost(id: any): Observable<Post> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<Post>(url).pipe(
      tap(_ => ghostLog(`deleted post id=${id}`)),
      catchError(handleError<Post>('deletePost'))
    );
  }
}
