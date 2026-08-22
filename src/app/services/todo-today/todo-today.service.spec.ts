import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TodoTodayService } from './todo-today.service';
import { TodoBoard } from '@models/_index';
import { environment } from '@environments/environment';

const apiUrl = environment.apiUrl + '/v1/todotoday';

describe('TodoTodayService — v2 endpoints', () => {
  let service: TodoTodayService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoTodayService],
    });
    service = TestBed.inject(TodoTodayService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const board = (): TodoBoard => ({
    date: '2026-08-21',
    focus: [{ id: 1, content: 'a', weight: 5 }],
    today: [{ id: 1, content: 'a', weight: 5 }],
    overdue: [],
    scheduled: [],
    backlog: { count: 0, items: [] },
    softCap: { cap: 3, high: 1, exceeded: false },
    settings: {
      todayCount: 3,
      weeklyCount: 5,
      monthlyCount: 2,
      sortByWeight: true,
      focusCount: 1,
      endOfDayHour: 20,
      autoDeferAtNight: true,
      maxDeferBeforeBacklog: 3,
    },
    quickAdd: [],
    stats: null,
  });

  describe('getBoard', () => {
    it('unwraps data out of the {success, data} envelope', () => {
      let result: TodoBoard | undefined;
      service.getBoard('2026-08-21').subscribe(res => (result = res));

      const req = httpMock.expectOne(`${apiUrl}/board?date=2026-08-21`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: board() });

      expect(result!.date).toBe('2026-08-21');
      expect(result!.focus.length).toBe(1);
    });

    it('omits the date param when none is given', () => {
      service.getBoard().subscribe();
      httpMock.expectOne(`${apiUrl}/board`).flush({
        success: true,
        data: board(),
      });
    });

    it('LETS ERRORS PROPAGATE instead of swallowing them', () => {
      // The old methods use handleError(), which returns of(default) — a
      // failed request then looks exactly like "no tasks today". New methods
      // must not do that, so the component can actually report the failure.
      let errored = false;
      service.getBoard().subscribe({
        next: () => fail('should not emit a value on error'),
        error: () => (errored = true),
      });

      httpMock
        .expectOne(`${apiUrl}/board`)
        .flush('boom', { status: 500, statusText: 'Server Error' });

      expect(errored).toBe(true);
    });
  });

  describe('defer', () => {
    it('posts the target and unwraps the updated todo', () => {
      let result: any;
      service.defer(7, { to: 'TOMORROW' }).subscribe(res => (result = res));

      const req = httpMock.expectOne(`${apiUrl}/7/defer`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ to: 'TOMORROW' });
      req.flush({ success: true, data: { id: 7, deferCount: 1 } });

      expect(result.deferCount).toBe(1);
    });

    it('carries autoBacklogged through so the UI can explain itself', () => {
      let result: any;
      service.defer(7, { to: 'TOMORROW' }).subscribe(res => (result = res));

      httpMock.expectOne(`${apiUrl}/7/defer`).flush({
        success: true,
        data: { id: 7, bucket: 'BACKLOG', autoBacklogged: true, weight: 2 },
      });

      expect(result.autoBacklogged).toBe(true);
      expect(result.bucket).toBe('BACKLOG');
    });

    it('sends the date for a DATE defer', () => {
      service.defer(7, { to: 'DATE', date: '2026-09-01' }).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/7/defer`);
      expect(req.request.body).toEqual({ to: 'DATE', date: '2026-09-01' });
      req.flush({ success: true, data: {} });
    });

    it('propagates errors', () => {
      let errored = false;
      service.defer(7, { to: 'BACKLOG' }).subscribe({
        next: () => fail('should not emit'),
        error: () => (errored = true),
      });
      httpMock
        .expectOne(`${apiUrl}/7/defer`)
        .flush('nope', { status: 404, statusText: 'Not Found' });
      expect(errored).toBe(true);
    });
  });

  describe('schedule', () => {
    it('posts the chosen date', () => {
      service.schedule(3, '2026-09-01').subscribe();
      const req = httpMock.expectOne(`${apiUrl}/3/schedule`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ date: '2026-09-01' });
      req.flush({ success: true, data: {} });
    });
  });

  describe('setWeight', () => {
    it('PATCHes the new weight', () => {
      let result: any;
      service.setWeight(3, 5).subscribe(res => (result = res));

      const req = httpMock.expectOne(`${apiUrl}/3/weight`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ weight: 5 });
      req.flush({ success: true, data: { id: 3, weight: 5 } });

      expect(result.weight).toBe(5);
    });
  });

  describe('getBacklog', () => {
    it('passes limit and offset', () => {
      service.getBacklog(10, 20).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/backlog?limit=10&offset=20`);
      expect(req.request.method).toBe('GET');
      req.flush({
        success: true,
        data: { count: 0, limit: 10, offset: 20, items: [] },
      });
    });
  });

  describe('existing endpoints', () => {
    it('getTodoTodays still swallows errors — unchanged on purpose', () => {
      // The old methods keep handleError(); changing them is a separate,
      // riskier commit (§D9). Pinned here so the split stays deliberate.
      let result: any;
      service.getTodoTodays().subscribe(res => (result = res));
      httpMock
        .expectOne(apiUrl)
        .flush('boom', { status: 500, statusText: 'Server Error' });
      expect(result).toEqual([]);
    });
  });
});
