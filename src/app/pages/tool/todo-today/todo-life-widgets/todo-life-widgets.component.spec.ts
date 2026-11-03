import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SimpleChange } from '@angular/core';
import { TodoLifeWidgetsComponent } from './todo-life-widgets.component';
import {
  NoveltySummary,
  PeopleDashboard,
  Person,
  PersonStats,
  TodoToday,
} from '@models/_index';
import { environment } from '@environments/environment';

const noveltyUrl = environment.apiUrl + '/v1/novelty';
const peopleUrl = environment.apiUrl + '/v1/people';

const summary = (extra: Partial<NoveltySummary> = {}): NoveltySummary => ({
  week: { weekKey: '2026-11-02', done: 0, goal: 1, met: false },
  planned: null,
  streak: { current: 0, longest: 0, currentWeekMet: false },
  total: 0,
  ideas: 0,
  weeks: [],
  ...extra,
});

const person = (name: string, stats: Partial<PersonStats> = {}): Person => ({
  _id: name,
  name,
  relationType: 'family',
  priority: 2,
  notes: '',
  archived: false,
  cadence: null,
  desiredCadence: null,
  remainingYears: 20,
  lastMetAt: null,
  nextMeetingAt: null,
  nextMeetingTodoId: null,
  stats: {
    manualPerYear: null,
    desiredPerYear: null,
    actual: null,
    estimatedRemaining: 80,
    estimateBasis: 'MANUAL',
    lastMetAt: null,
    daysSinceLast: 60,
    nextMeetingAt: null,
    hasPlan: false,
    expectedIntervalDays: 30,
    intervalSource: 'DESIRED',
    overdueRatio: 2,
    needsAttention: false,
    ...stats,
  },
});

describe('TodoLifeWidgetsComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TodoLifeWidgetsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const text = (el: HTMLElement) => el.textContent?.replace(/\s+/g, ' ') || '';

  const flushAll = (
    s: NoveltySummary,
    d: PeopleDashboard,
    suggestions = [{ title: 'Ăn bún mắm', category: 'food' }]
  ) => {
    httpMock
      .expectOne(`${noveltyUrl}/summary`)
      .flush({ success: true, data: s });
    httpMock
      .expectOne(`${peopleUrl}/dashboard`)
      .flush({ success: true, data: d });
    if (!s.planned) {
      httpMock
        .expectOne(`${noveltyUrl}/suggestions?limit=3`)
        .flush({ success: true, data: suggestions });
    }
  };

  const render = (s: NoveltySummary, d: PeopleDashboard) => {
    const fixture = TestBed.createComponent(TodoLifeWidgetsComponent);
    fixture.detectChanges();
    flushAll(s, d);
    fixture.detectChanges();
    return fixture;
  };

  const mom = person('Mẹ', { hasPlan: true });
  const friend = person('Bạn', { needsAttention: true });
  const dash: PeopleDashboard = {
    upcoming: [
      { todoId: 't', personId: 'Mẹ', name: 'Mẹ', date: '2026-11-06T17:00:00Z' },
    ],
    noPlan: [friend],
    needsAttentionCount: 1,
    people: [friend, mom],
  };

  it('hai dòng thu gọn; gợi ý chỉ khi chưa có kế hoạch', () => {
    const fixture = render(summary(), dash);
    const lines = fixture.nativeElement.querySelectorAll('.lw-line');
    expect(lines.length).toBe(2);
    expect(text(lines[0])).toContain('✨ Tuần này 0/1 · Thêm trải nghiệm');
    expect(text(lines[0])).toContain('gợi ý: Ăn bún mắm');
    expect(text(lines[1])).toContain('Hẹn sắp tới: Mẹ');
    expect(text(lines[1])).toContain('1 người chưa có hẹn');
  });

  it('đã có kế hoạch: hiện kế hoạch, không gọi gợi ý', () => {
    const planned = {
      _id: 'e',
      title: 'Đi bộ cầu Ba Son',
      plannedDate: '2026-11-06T17:00:00Z',
    } as NoveltySummary['planned'];
    const fixture = render(summary({ planned }), dash);
    expect(text(fixture.nativeElement)).toContain('Đi bộ cầu Ba Son');
    expect(text(fixture.nativeElement)).not.toContain('gợi ý');
  });

  it('KHÔNG BAO GIỜ hiện số lần gặp còn lại, kể cả khi mở rộng', () => {
    const fixture = render(summary(), dash);
    fixture.nativeElement.querySelectorAll('.lw-line')[1].click();
    fixture.detectChanges();
    const body = text(fixture.nativeElement);
    expect(body).toContain('Bạn');
    expect(body).not.toContain('lần nữa');
    expect(body).not.toContain('80');
  });

  it('chưa có ai: mời thêm người', () => {
    const fixture = render(summary(), {
      upcoming: [],
      noPlan: [],
      needsAttentionCount: 0,
      people: [],
    });
    expect(text(fixture.nativeElement)).toContain('👥 Thêm người quan trọng');
  });

  it('lỗi tải: dòng nói rõ, không làm vỡ bảng', () => {
    const fixture = TestBed.createComponent(TodoLifeWidgetsComponent);
    fixture.detectChanges();
    httpMock
      .expectOne(`${noveltyUrl}/summary`)
      .flush({}, { status: 500, statusText: 'Server Error' });
    httpMock
      .expectOne(`${peopleUrl}/dashboard`)
      .flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(text(fixture.nativeElement)).toContain('✨ Không tải được');
    expect(text(fixture.nativeElement)).toContain('👥 Không tải được');
  });

  it('tick một việc NOVELTY: mở sheet suy ngẫm (tuỳ chọn) và tải lại', () => {
    const fixture = render(summary(), dash);
    const todo: TodoToday = {
      id: 1,
      content: '✨ Ăn bánh căn',
      status: 'DONE',
      sourceKind: 'NOVELTY',
      sourceRef: 'exp1',
    };
    fixture.componentInstance.toggled = todo;
    fixture.componentInstance.ngOnChanges({
      toggled: new SimpleChange(null, todo, false),
    });
    flushAll(
      summary({ week: { ...summary().week, done: 1, met: true } }),
      dash
    );
    fixture.detectChanges();

    const sheet = fixture.nativeElement.querySelector('.rs');
    expect(sheet.classList).toContain('is-open');
    expect(text(sheet)).toContain('Ăn bánh căn');
    expect(text(fixture.nativeElement)).toContain('Tuần này 1/1');
  });

  it('bỏ tick NOVELTY: KHÔNG mở sheet', () => {
    const fixture = render(summary(), dash);
    const todo: TodoToday = {
      id: 1,
      content: '✨ x',
      status: 'NEW',
      sourceKind: 'NOVELTY',
      sourceRef: 'exp1',
    };
    fixture.componentInstance.ngOnChanges({
      toggled: new SimpleChange(null, todo, false),
    });
    flushAll(summary(), dash);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.rs').classList).not.toContain(
      'is-open'
    );
  });
});
