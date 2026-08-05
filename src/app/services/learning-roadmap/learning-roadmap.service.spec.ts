import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LearningRoadmapService } from './learning-roadmap.service';
import { environment } from '@environments/environment';
import {
  RoadmapDashboard,
  RoadmapImportResult,
  RoadmapWithStats,
} from '@models/_index';

describe('LearningRoadmapService', () => {
  let service: LearningRoadmapService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/v1/learning-roadmap';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LearningRoadmapService],
    });
    service = TestBed.inject(LearningRoadmapService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRoadmap', () => {
    it('bóc `data` ra khỏi envelope {success, data}', () => {
      const payload = {
        roadmap: { title: 'Lộ trình', milestones: [] },
        stats: { milestones: [], overall: { total: 0, done: 0, percent: 0 } },
      } as unknown as RoadmapWithStats;

      let result: RoadmapWithStats | null | undefined;
      service.getRoadmap().subscribe(res => (result = res));

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: payload });

      expect(result).toEqual(payload);
    });

    it('chưa import thì trả null', () => {
      let result: RoadmapWithStats | null | undefined;
      service.getRoadmap().subscribe(res => (result = res));

      httpMock.expectOne(apiUrl).flush({ success: true, data: null });
      expect(result).toBeNull();
    });

    // Đây là lý do service này không dùng handleError: nuốt lỗi sẽ khiến
    // component hiển thị "chưa import" trong khi dữ liệu vẫn còn trên server.
    it('lỗi mạng phải nổi lên component chứ không bị nuốt thành null', () => {
      let errored = false;
      let nexted = false;

      service.getRoadmap().subscribe({
        next: () => (nexted = true),
        error: () => (errored = true),
      });

      httpMock
        .expectOne(apiUrl)
        .flush(
          { success: false, msg: 'boom' },
          { status: 500, statusText: 'Server Error' }
        );

      expect(errored).toBe(true);
      expect(nexted).toBe(false);
    });
  });

  describe('getDashboard', () => {
    it('gọi đúng endpoint và bóc data', () => {
      const payload = {
        title: 'Lộ trình',
        currentMilestone: { key: 'm1', number: 1 },
        overall: { total: 4, done: 1, percent: 25 },
      } as unknown as RoadmapDashboard;

      let result: RoadmapDashboard | null | undefined;
      service.getDashboard().subscribe(res => (result = res));

      const req = httpMock.expectOne(`${apiUrl}/dashboard`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: payload });

      expect(result).toEqual(payload);
    });
  });

  describe('importRoadmap', () => {
    const mockResult = {
      dryRun: false,
      title: 'Lộ trình',
      milestoneCount: 5,
      itemCount: 41,
      sourceUnchanged: false,
      diff: { unchanged: 40, added: 1, removed: 0, remapped: 0 },
      remapped: [],
      keptProgress: 3,
    } as RoadmapImportResult;

    it('POST markdown kèm dryRun=false mặc định', () => {
      let result: RoadmapImportResult | undefined;
      service.importRoadmap('# Lộ trình').subscribe(res => (result = res));

      const req = httpMock.expectOne(`${apiUrl}/import`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        markdown: '# Lộ trình',
        dryRun: false,
      });
      req.flush({ success: true, data: mockResult });

      expect(result).toEqual(mockResult);
    });

    it('truyền dryRun=true khi xem trước', () => {
      service.importRoadmap('# Lộ trình', true).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/import`);
      expect(req.request.body.dryRun).toBe(true);
      req.flush({ success: true, data: { ...mockResult, dryRun: true } });
    });

    it('lỗi import nổi lên để component báo cho user', () => {
      let errorStatus = 0;
      service.importRoadmap('rác').subscribe({
        error: err => (errorStatus = err.status),
      });

      httpMock
        .expectOne(`${apiUrl}/import`)
        .flush(
          { success: false, msg: 'Không tìm thấy mốc nào.' },
          { status: 400, statusText: 'Bad Request' }
        );

      expect(errorStatus).toBe(400);
    });
  });

  describe('updateItemStatus', () => {
    it('PATCH đúng key và status', () => {
      service.updateItemStatus('m1-REVIEW-abc12345', 'DONE').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/item/m1-REVIEW-abc12345`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'DONE' });
      req.flush({ success: true, data: { status: 'DONE' } });
    });

    it('chỉ gửi note khi thực sự truyền vào', () => {
      service
        .updateItemStatus('m1-NEW-abc12345', 'TODO', 'ghi chú')
        .subscribe();

      const req = httpMock.expectOne(`${apiUrl}/item/m1-NEW-abc12345`);
      expect(req.request.body).toEqual({ status: 'TODO', note: 'ghi chú' });
      req.flush({ success: true, data: { status: 'TODO' } });
    });

    it('encode key trước khi ghép vào URL', () => {
      service.updateItemStatus('m1/REVIEW', 'DONE').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/item/m1%2FREVIEW`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ success: true, data: { status: 'DONE' } });
    });
  });
});
