import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  LearningApiResponse,
  LearningItemStatus,
  LearningProgress,
  RoadmapDashboard,
  RoadmapImportResult,
  RoadmapWithStats,
} from '@models/_index';
import { environment } from '@environments/environment';
import { ghostLog } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/learning-roadmap';

/**
 * CỐ Ý không dùng `handleError()` như các service khác.
 *
 * `handleError` trả `of(default)` khi lỗi, tức lỗi bị nuốt im lặng. Với module
 * này nó nguy hiểm theo hai cách: tick "đã học" thất bại mà vẫn báo thành công,
 * và GET lỗi trả về null sẽ bị hiểu nhầm là "chưa import lộ trình" — trong khi
 * dữ liệu vẫn còn nguyên trên server. Nên lỗi được để nổi lên cho component
 * bắt và báo qua AlertService.
 */
@Injectable({
  providedIn: 'root',
})
export class LearningRoadmapService {
  constructor(private http: HttpClient) {}

  /** Cây lộ trình đã ghép tiến độ. `null` = user chưa import lần nào. */
  getRoadmap(): Observable<RoadmapWithStats | null> {
    return this.http
      .get<LearningApiResponse<RoadmapWithStats | null>>(apiUrl)
      .pipe(
        tap(() => ghostLog('fetched learning roadmap')),
        map(res => res.data)
      );
  }

  /** Mốc hiện tại, % hoàn thành, ngân sách tuần. `null` = chưa import. */
  getDashboard(): Observable<RoadmapDashboard | null> {
    return this.http
      .get<LearningApiResponse<RoadmapDashboard | null>>(`${apiUrl}/dashboard`)
      .pipe(
        tap(() => ghostLog('fetched learning roadmap dashboard')),
        map(res => res.data)
      );
  }

  /**
   * Import/cập nhật lộ trình từ markdown.
   * @param dryRun true = chỉ trả bảng diff, không ghi gì xuống DB.
   */
  importRoadmap(
    markdown: string,
    dryRun = false
  ): Observable<RoadmapImportResult> {
    return this.http
      .post<LearningApiResponse<RoadmapImportResult>>(`${apiUrl}/import`, {
        markdown,
        dryRun,
      })
      .pipe(
        tap(() => ghostLog(`imported learning roadmap (dryRun=${dryRun})`)),
        map(res => res.data)
      );
  }

  /** Tick / bỏ tick một mục. */
  updateItemStatus(
    key: string,
    status: LearningItemStatus,
    note?: string
  ): Observable<LearningProgress> {
    const body: { status: LearningItemStatus; note?: string } = { status };
    if (note !== undefined) {
      body.note = note;
    }
    return this.http
      .patch<
        LearningApiResponse<LearningProgress>
      >(`${apiUrl}/item/${encodeURIComponent(key)}`, body)
      .pipe(
        tap(() => ghostLog(`updated roadmap item ${key} -> ${status}`)),
        map(res => res.data)
      );
  }
}
