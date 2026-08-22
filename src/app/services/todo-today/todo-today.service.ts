import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  TodoApiResponse,
  TodoBacklogPage,
  TodoBoard,
  TodoDeferPayload,
  TodoToday,
} from '@models/_index';
import { environment } from '@environments/environment';
import { buildQueryString, ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/todotoday';

export interface TodoTodayQueryParams {
  date?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TodoTodayService {
  constructor(private http: HttpClient) {}

  getTodoTodays(): Observable<TodoToday[]> {
    return this.http.get<TodoToday[]>(apiUrl).pipe(
      tap(() => ghostLog('fetched Todo Todays')),
      catchError(handleError<TodoToday[]>('getTodoTodays', []))
    );
  }

  getTodoToday(id: string | number): Observable<TodoToday> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<TodoToday>(url).pipe(
      tap(() => ghostLog(`fetched tdtd by id=${id}`)),
      catchError(handleError<TodoToday>(`getTodoToday id=${id}`))
    );
  }

  getMyTodoToday(req: TodoTodayQueryParams): Observable<TodoToday> {
    const queryString = buildQueryString(req);
    const url = `${apiUrl}/my-tdtd?${queryString}`;
    return this.http.get<TodoToday>(url).pipe(
      tap(() => ghostLog(`fetched my tdtd`)),
      catchError(handleError<TodoToday>(`getMyTodoToday`))
    );
  }

  addTodoToday(tdtd: TodoToday): Observable<TodoToday> {
    return this.http.post<TodoToday>(apiUrl, tdtd).pipe(
      tap(() => ghostLog(`added tdtd id=${tdtd.id}`)),
      catchError(handleError<TodoToday>('addTodoToday'))
    );
  }

  updateTodoToday(id: string | number, tdtd: TodoToday): Observable<TodoToday> {
    const url = `${apiUrl}/${id}`;
    return this.http.put<TodoToday>(url, tdtd).pipe(
      tap(() => ghostLog(`updated tdtd id=${id}`)),
      catchError(handleError<TodoToday>('updateTodoToday'))
    );
  }

  deleteTodoToday(id: string | number): Observable<TodoToday> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<TodoToday>(url).pipe(
      tap(() => ghostLog(`deleted tdtd id=${id}`)),
      catchError(handleError<TodoToday>('deleteTodoToday'))
    );
  }

  // ==========================================================================
  // Todo Today v2 (ADR 0002)
  //
  // CÁC METHOD DƯỚI ĐÂY CỐ Ý KHÔNG DÙNG `handleError`.
  //
  // `handleError` trả `of(default)` khi lỗi, nên một lần dời việc THẤT BẠI
  // trông y hệt một lần dời thành công, và một GET lỗi trông y hệt "hôm nay
  // không có việc nào". Với màn hình chủ nhân mở mỗi sáng thì đó là kiểu hỏng
  // tệ nhất: im lặng và giống hệt trạng thái bình thường. Ở đây để lỗi nổi
  // lên, component bắt và báo qua AlertService.
  //
  // Các method cũ phía trên vẫn giữ `handleError` — đổi chúng là một commit
  // riêng, rủi ro riêng (§D9).
  // ==========================================================================

  /** Một lần gọi dựng cả màn hình. `date` dạng 'YYYY-MM-DD' giờ VN. */
  getBoard(date?: string): Observable<TodoBoard> {
    const url = date ? `${apiUrl}/board?date=${date}` : `${apiUrl}/board`;
    return this.http.get<TodoApiResponse<TodoBoard>>(url).pipe(
      tap(() => ghostLog(`fetched todo board ${date || 'today'}`)),
      map(res => res.data)
    );
  }

  getBacklog(limit = 20, offset = 0): Observable<TodoBacklogPage> {
    const url = `${apiUrl}/backlog?limit=${limit}&offset=${offset}`;
    return this.http.get<TodoApiResponse<TodoBacklogPage>>(url).pipe(
      tap(() => ghostLog('fetched todo backlog')),
      map(res => res.data)
    );
  }

  /**
   * Dời việc. Trả về todo đã cập nhật, kèm `autoBacklogged` khi server tự đẩy
   * nó vào backlog vì đã dời quá số lần cho phép — UI cần cờ này để nói được
   * LÝ DO việc vừa biến khỏi hôm nay.
   */
  defer(id: number, payload: TodoDeferPayload): Observable<TodoToday> {
    return this.http
      .post<TodoApiResponse<TodoToday>>(`${apiUrl}/${id}/defer`, payload)
      .pipe(
        tap(() => ghostLog(`deferred tdtd id=${id} -> ${payload.to}`)),
        map(res => res.data)
      );
  }

  /** Đặt việc lên một ngày; cũng là đường kéo việc RA KHỎI backlog. */
  schedule(id: number, date: string): Observable<TodoToday> {
    return this.http
      .post<TodoApiResponse<TodoToday>>(`${apiUrl}/${id}/schedule`, { date })
      .pipe(
        tap(() => ghostLog(`scheduled tdtd id=${id} -> ${date}`)),
        map(res => res.data)
      );
  }

  setWeight(id: number, weight: number): Observable<TodoToday> {
    return this.http
      .patch<TodoApiResponse<TodoToday>>(`${apiUrl}/${id}/weight`, { weight })
      .pipe(
        tap(() => ghostLog(`set weight tdtd id=${id} -> ${weight}`)),
        map(res => res.data)
      );
  }
}
