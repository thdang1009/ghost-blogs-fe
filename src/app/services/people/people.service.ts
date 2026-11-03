import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  PeopleDashboard,
  Person,
  PersonDraft,
  PersonMeeting,
  PersonMeetingDraft,
  TodoApiResponse,
  TodoToday,
} from '@models/_index';
import { environment } from '@environments/environment';
import { ghostLog } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/people';

/**
 * Những người quan trọng (ADR 0003).
 *
 * Không dùng `handleError` — xem ADR 0002 §D9. Ghi một lần gặp thất bại mà
 * trông như thành công là mất dữ liệu trong im lặng.
 */
@Injectable({ providedIn: 'root' })
export class PeopleService {
  constructor(private http: HttpClient) {}

  list(archived = false): Observable<Person[]> {
    const url = archived ? `${apiUrl}?archived=true` : apiUrl;
    return this.http.get<TodoApiResponse<Person[]>>(url).pipe(
      tap(() => ghostLog('fetched people')),
      map(res => res.data)
    );
  }

  dashboard(): Observable<PeopleDashboard> {
    return this.http
      .get<TodoApiResponse<PeopleDashboard>>(`${apiUrl}/dashboard`)
      .pipe(map(res => res.data));
  }

  get(id: string): Observable<Person> {
    return this.http
      .get<TodoApiResponse<Person>>(`${apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  create(body: PersonDraft): Observable<Person> {
    return this.http.post<TodoApiResponse<Person>>(apiUrl, body).pipe(
      tap(() => ghostLog('created person')),
      map(res => res.data)
    );
  }

  update(id: string, body: PersonDraft): Observable<Person> {
    return this.http
      .put<TodoApiResponse<Person>>(`${apiUrl}/${id}`, body)
      .pipe(map(res => res.data));
  }

  archive(id: string, archived = true): Observable<Person> {
    return this.http
      .post<TodoApiResponse<Person>>(`${apiUrl}/${id}/archive`, { archived })
      .pipe(map(res => res.data));
  }

  /** Xoá hẳn — kèm mọi lần gặp. UI phải hỏi xác nhận trước khi gọi. */
  removeForever(id: string): Observable<unknown> {
    return this.http
      .delete<TodoApiResponse<unknown>>(`${apiUrl}/${id}?confirm=true`)
      .pipe(map(res => res.data));
  }

  // --- lần gặp ---

  meetings(id: string): Observable<PersonMeeting[]> {
    return this.http
      .get<TodoApiResponse<PersonMeeting[]>>(`${apiUrl}/${id}/meetings`)
      .pipe(map(res => res.data));
  }

  recordMeeting(
    id: string,
    body: PersonMeetingDraft
  ): Observable<{ meeting: PersonMeeting; todosClosed: number }> {
    return this.http
      .post<
        TodoApiResponse<{ meeting: PersonMeeting; todosClosed: number }>
      >(`${apiUrl}/${id}/meetings`, body)
      .pipe(
        tap(() => ghostLog(`recorded meeting with ${id}`)),
        map(res => res.data)
      );
  }

  updateMeeting(
    meetingId: string,
    body: PersonMeetingDraft
  ): Observable<PersonMeeting> {
    return this.http
      .put<
        TodoApiResponse<PersonMeeting>
      >(`${apiUrl}/meetings/${meetingId}`, body)
      .pipe(map(res => res.data));
  }

  deleteMeeting(meetingId: string): Observable<unknown> {
    return this.http
      .delete<TodoApiResponse<unknown>>(`${apiUrl}/meetings/${meetingId}`)
      .pipe(map(res => res.data));
  }

  // --- việc trên bảng Todo Today ---

  /** Hẹn gặp = một việc MEETING. Cùng ngày bấm hai lần vẫn một việc. */
  schedule(
    id: string,
    date: string
  ): Observable<{ person: Person; todo: TodoToday; created: boolean }> {
    return this.http
      .post<
        TodoApiResponse<{ person: Person; todo: TodoToday; created: boolean }>
      >(`${apiUrl}/${id}/schedule`, { date })
      .pipe(
        tap(() => ghostLog(`scheduled meeting with ${id} on ${date}`)),
        map(res => res.data)
      );
  }

  /** "📞 Nhắn <tên>" — không phải một lần gặp. Không gửi ngày = hôm nay. */
  contact(id: string, date?: string): Observable<{ todo: TodoToday }> {
    return this.http
      .post<
        TodoApiResponse<{ todo: TodoToday }>
      >(`${apiUrl}/${id}/contact`, date ? { date } : {})
      .pipe(map(res => res.data));
  }
}
