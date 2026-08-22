import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  RotateDirection,
  TodoApiResponse,
  TodoRecurrence,
  TodoToday,
} from '@models/_index';
import { environment } from '@environments/environment';
import { ghostLog } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/todo-recurrence';

/**
 * CỐ Ý không dùng `handleError()` (ADR 0002 §D9).
 *
 * `handleError` trả `of(default)` khi lỗi. Với module này nó nguy hiểm cụ thể:
 * lưu một lịch lặp thất bại sẽ trông y hệt lưu thành công, và chủ nhân chỉ
 * phát hiện ra vào sáng hôm sau khi việc không xuất hiện. Lỗi được để nổi lên
 * cho component báo qua AlertService.
 */
@Injectable({ providedIn: 'root' })
export class TodoRecurrenceService {
  constructor(private http: HttpClient) {}

  list(active?: boolean): Observable<TodoRecurrence[]> {
    const url = active === undefined ? apiUrl : `${apiUrl}?active=${active}`;
    return this.http.get<TodoApiResponse<TodoRecurrence[]>>(url).pipe(
      tap(() => ghostLog('fetched todo recurrences')),
      map(res => res.data)
    );
  }

  create(body: Partial<TodoRecurrence>): Observable<TodoRecurrence> {
    return this.http.post<TodoApiResponse<TodoRecurrence>>(apiUrl, body).pipe(
      tap(() => ghostLog('created todo recurrence')),
      map(res => res.data)
    );
  }

  update(
    id: string,
    body: Partial<TodoRecurrence>
  ): Observable<TodoRecurrence> {
    return this.http
      .put<TodoApiResponse<TodoRecurrence>>(`${apiUrl}/${id}`, body)
      .pipe(
        tap(() => ghostLog(`updated todo recurrence ${id}`)),
        map(res => res.data)
      );
  }

  /** Mặc định chỉ TẮT; việc đã sinh vẫn tham chiếu tới recurrence này. */
  remove(id: string, hard = false): Observable<unknown> {
    const url = hard ? `${apiUrl}/${id}?hard=true` : `${apiUrl}/${id}`;
    return this.http
      .delete<TodoApiResponse<unknown>>(url)
      .pipe(map(res => res.data));
  }

  /** Idempotent: gọi lại trong cùng ngày trả về việc cũ với alreadyExists. */
  spawn(id: string, date?: string): Observable<TodoToday> {
    return this.http
      .post<
        TodoApiResponse<TodoToday>
      >(`${apiUrl}/${id}/spawn`, date ? { date } : {})
      .pipe(
        tap(() => ghostLog(`spawned from recurrence ${id}`)),
        map(res => res.data)
      );
  }

  /** CHỈ hợp lệ với recurrence CYCLE — server trả 400 cho WEEKDAY (§D6). */
  rotate(
    id: string,
    direction: RotateDirection,
    index?: number
  ): Observable<TodoRecurrence> {
    return this.http
      .post<TodoApiResponse<TodoRecurrence>>(`${apiUrl}/${id}/rotate`, {
        direction,
        ...(index === undefined ? {} : { index }),
      })
      .pipe(map(res => res.data));
  }
}
