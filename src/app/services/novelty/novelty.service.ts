import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  NoveltyDraft,
  NoveltyDuplicateCheck,
  NoveltyExperience,
  NoveltyReflection,
  NoveltyStatus,
  NoveltySuggestion,
  NoveltySummary,
  TodoApiResponse,
} from '@models/_index';
import { environment } from '@environments/environment';
import { ghostLog } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/novelty';

/**
 * Mỗi tuần một trải nghiệm mới (ADR 0003).
 *
 * Không dùng `handleError` — xem ADR 0002 §D9: lên lịch thất bại mà trông như
 * thành công thì chủ nhân chỉ biết khi việc không xuất hiện trên bảng.
 */
@Injectable({ providedIn: 'root' })
export class NoveltyService {
  constructor(private http: HttpClient) {}

  list(status?: NoveltyStatus): Observable<NoveltyExperience[]> {
    const url = status ? `${apiUrl}?status=${status}` : apiUrl;
    return this.http.get<TodoApiResponse<NoveltyExperience[]>>(url).pipe(
      tap(() => ghostLog('fetched novelty experiences')),
      map(res => res.data)
    );
  }

  summary(): Observable<NoveltySummary> {
    return this.http
      .get<TodoApiResponse<NoveltySummary>>(`${apiUrl}/summary`)
      .pipe(map(res => res.data));
  }

  suggestions(limit = 3): Observable<NoveltySuggestion[]> {
    return this.http
      .get<
        TodoApiResponse<NoveltySuggestion[]>
      >(`${apiUrl}/suggestions?limit=${limit}`)
      .pipe(map(res => res.data));
  }

  /** CHỈ cảnh báo — server không bao giờ chặn tạo trùng. */
  checkDuplicate(
    title: string,
    excludeId?: string
  ): Observable<NoveltyDuplicateCheck> {
    let params = new HttpParams().set('title', title);
    if (excludeId) params = params.set('excludeId', excludeId);
    return this.http
      .get<
        TodoApiResponse<NoveltyDuplicateCheck>
      >(`${apiUrl}/check-duplicate`, { params })
      .pipe(map(res => res.data));
  }

  create(body: NoveltyDraft): Observable<NoveltyExperience> {
    return this.http
      .post<TodoApiResponse<NoveltyExperience>>(apiUrl, body)
      .pipe(
        tap(() => ghostLog('created novelty experience')),
        map(res => res.data)
      );
  }

  update(id: string, body: NoveltyDraft): Observable<NoveltyExperience> {
    return this.http
      .put<TodoApiResponse<NoveltyExperience>>(`${apiUrl}/${id}`, body)
      .pipe(map(res => res.data));
  }

  /** Tạo hoặc dời việc trên bảng Todo Today. */
  plan(id: string, date: string): Observable<NoveltyExperience> {
    return this.http
      .post<TodoApiResponse<NoveltyExperience>>(`${apiUrl}/${id}/plan`, {
        date,
      })
      .pipe(
        tap(() => ghostLog(`planned novelty ${id} on ${date}`)),
        map(res => res.data)
      );
  }

  unplan(id: string): Observable<NoveltyExperience> {
    return this.http
      .delete<TodoApiResponse<NoveltyExperience>>(`${apiUrl}/${id}/plan`)
      .pipe(map(res => res.data));
  }

  /**
   * Gọi lại được: trải nghiệm đã DONE (vừa tick trên bảng) thì server chỉ gộp
   * phần suy ngẫm.
   */
  complete(
    id: string,
    reflection?: Partial<NoveltyReflection>,
    doneDate?: string
  ): Observable<NoveltyExperience> {
    const body: { reflection?: Partial<NoveltyReflection>; doneDate?: string } =
      {};
    if (reflection) body.reflection = reflection;
    if (doneDate) body.doneDate = doneDate;
    return this.http
      .post<
        TodoApiResponse<NoveltyExperience>
      >(`${apiUrl}/${id}/complete`, body)
      .pipe(map(res => res.data));
  }

  remove(id: string): Observable<unknown> {
    return this.http
      .delete<TodoApiResponse<unknown>>(`${apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }
}
