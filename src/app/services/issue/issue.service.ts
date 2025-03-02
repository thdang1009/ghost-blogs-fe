import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/common';

@Injectable()
export class IssueService {
  /**
  * Get all issues available for the base URL.
  * Returns full HTTP response with headers,
  * so we can read Link reader parameter to implement
  * pagination.
  *
  * @param url: string - optional URL to fetch issues from.
  */
  getIssues(url?: string): Observable<any> {
    if (url) {
      return this.http.get(url, { observe: 'response' })
        .pipe(
          catchError(handleError('getIssues', []))
        );
    } else {
      return this.http.get('https://api.github.com/repos/thdang1009/mean-ghost-tim-ui/issues?per_page=100', { observe: 'response' })
        .pipe(
          catchError(handleError('getIssues', []))
        );
    }
  }

  /**
  * Get a single issue by issue number.
  *
  * @param num: number - number of the issue to fetch
  */
  getIssue(num: number): Observable<any> {
    const url = `https://api.github.com/repos/thdang1009/mean-ghost-tim-ui/issues/${num}`;
    return this.http.get(url).pipe(
      catchError(handleError('getIssue', []))
    );
  }

  /**
 * Get comments by issue number.
 *
 * @param num: number - number of the issue to fetch comments for
 */
  getComments(num: number): Observable<any> {
    const url = `https://api.github.com/repos/thdang1009/mean-ghost-tim-ui/issues/${num}/comments`;
    return this.http.get(url).pipe(
      catchError(handleError('getComments', []))
    );
  }

  constructor(private http: HttpClient) { }
}
