import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  ReadingBook,
  ReadingBookProgress,
  ReadingBookStatus,
  TodoApiResponse,
} from '@models/_index';
import { environment } from '@environments/environment';
import { ghostLog } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/reading-book';

/** Không dùng `handleError` — xem ADR 0002 §D9. */
@Injectable({ providedIn: 'root' })
export class ReadingBookService {
  constructor(private http: HttpClient) {}

  list(status?: ReadingBookStatus): Observable<ReadingBook[]> {
    const url = status ? `${apiUrl}?status=${status}` : apiUrl;
    return this.http.get<TodoApiResponse<ReadingBook[]>>(url).pipe(
      tap(() => ghostLog('fetched reading books')),
      map(res => res.data)
    );
  }

  create(body: Partial<ReadingBook>): Observable<ReadingBook> {
    return this.http
      .post<TodoApiResponse<ReadingBook>>(apiUrl, body)
      .pipe(map(res => res.data));
  }

  update(id: string, body: Partial<ReadingBook>): Observable<ReadingBook> {
    return this.http
      .put<TodoApiResponse<ReadingBook>>(`${apiUrl}/${id}`, body)
      .pipe(map(res => res.data));
  }

  /** Đổi trạng thái tự đồng bộ vòng xoay đọc ở server. */
  setStatus(id: string, status: ReadingBookStatus): Observable<ReadingBook> {
    return this.http
      .post<TodoApiResponse<ReadingBook>>(`${apiUrl}/${id}/status`, { status })
      .pipe(
        tap(() => ghostLog(`reading book ${id} -> ${status}`)),
        map(res => res.data)
      );
  }

  remove(id: string): Observable<unknown> {
    return this.http
      .delete<TodoApiResponse<unknown>>(`${apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  syncRotation(): Observable<unknown> {
    return this.http
      .post<TodoApiResponse<unknown>>(`${apiUrl}/sync-rotation`, {})
      .pipe(
        tap(() => ghostLog('synced reading rotation')),
        map(res => res.data)
      );
  }
}

/**
 * Tiến độ ƯỚC TÍNH.
 *
 * `estimateHours` là con số chủ nhân tự đoán, còn `minutesRead` chỉ đếm những
 * buổi đọc có ghi qua todo. Vì vậy đây là ước lượng thô và UI phải gắn nhãn
 * "(ước tính)" — không bao giờ trình bày như số đo thật (§9.5).
 */
export function readingProgress(book: ReadingBook): ReadingBookProgress {
  const estimateMinutes = book.estimateHours
    ? Math.round(book.estimateHours * 60)
    : null;
  const percent =
    estimateMinutes && estimateMinutes > 0
      ? Math.min(
          100,
          Math.round(((book.minutesRead || 0) / estimateMinutes) * 100)
        )
      : null;
  return { percent, minutesRead: book.minutesRead || 0, estimateMinutes };
}
