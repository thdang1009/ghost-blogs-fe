import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PeopleService } from './people.service';
import { environment } from '@environments/environment';

const apiUrl = environment.apiUrl + '/v1/people';

describe('PeopleService', () => {
  let service: PeopleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PeopleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('mở envelope', () => {
    let data: unknown;
    service.dashboard().subscribe(d => (data = d));
    httpMock
      .expectOne(`${apiUrl}/dashboard`)
      .flush({ success: true, data: { upcoming: [] } });
    expect(data).toEqual({ upcoming: [] });
  });

  it('xoá hẳn luôn kèm ?confirm=true', () => {
    service.removeForever('p1').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/p1?confirm=true`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: {} });
  });

  it('contact không gửi ngày thì body rỗng (server hiểu là hôm nay)', () => {
    service.contact('p1').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/p1/contact`);
    expect(req.request.body).toEqual({});
    req.flush({ success: true, data: { todo: {} } });
  });

  it('lần gặp đi qua /meetings/:id', () => {
    service.updateMeeting('m1', { note: 'x' }).subscribe();
    httpMock
      .expectOne(`${apiUrl}/meetings/m1`)
      .flush({ success: true, data: {} });
  });

  // ADR 0002 §D9.
  it('KHÔNG nuốt lỗi', () => {
    let failed = false;
    service.schedule('p1', '2026-11-05').subscribe({
      error: () => (failed = true),
    });
    httpMock
      .expectOne(`${apiUrl}/p1/schedule`)
      .flush({ success: false }, { status: 400, statusText: 'Bad Request' });
    expect(failed).toBeTrue();
  });
});
