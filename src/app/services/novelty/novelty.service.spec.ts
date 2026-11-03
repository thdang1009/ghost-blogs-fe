import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NoveltyService } from './novelty.service';
import { environment } from '@environments/environment';

const apiUrl = environment.apiUrl + '/v1/novelty';

describe('NoveltyService', () => {
  let service: NoveltyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(NoveltyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('mở envelope {success, data}', () => {
    let rows: unknown;
    service.list().subscribe(r => (rows = r));
    httpMock.expectOne(apiUrl).flush({ success: true, data: [{ _id: 'a' }] });
    expect(rows).toEqual([{ _id: 'a' }]);
  });

  it('lọc theo trạng thái', () => {
    service.list('DONE').subscribe();
    httpMock
      .expectOne(`${apiUrl}?status=DONE`)
      .flush({ success: true, data: [] });
  });

  it('plan gửi ngày dạng YYYY-MM-DD', () => {
    service.plan('x', '2026-11-05').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/x/plan`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ date: '2026-11-05' });
    req.flush({ success: true, data: {} });
  });

  it('complete không gửi ô trống', () => {
    service.complete('x').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/x/complete`);
    expect(req.request.body).toEqual({});
    req.flush({ success: true, data: {} });
  });

  it('checkDuplicate mã hoá tiêu đề qua HttpParams', () => {
    service.checkDuplicate('Ăn phở & bún', 'id1').subscribe();
    const req = httpMock.expectOne(r => r.url === `${apiUrl}/check-duplicate`);
    expect(req.request.params.get('title')).toBe('Ăn phở & bún');
    expect(req.request.params.get('excludeId')).toBe('id1');
    req.flush({ success: true, data: { duplicate: false, matches: [] } });
  });

  // ADR 0002 §D9: lỗi phải nổi lên, không bị nuốt thành giá trị mặc định.
  it('KHÔNG nuốt lỗi', () => {
    let failed = false;
    service.summary().subscribe({ error: () => (failed = true) });
    httpMock
      .expectOne(`${apiUrl}/summary`)
      .flush({ success: false }, { status: 500, statusText: 'Server Error' });
    expect(failed).toBeTrue();
  });
});
