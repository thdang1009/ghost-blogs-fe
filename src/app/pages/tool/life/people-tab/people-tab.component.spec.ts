import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PeopleTabComponent } from './people-tab.component';
import { PeopleDashboard, Person, PersonStats } from '@models/_index';
import { environment } from '@environments/environment';

const apiUrl = environment.apiUrl + '/v1/people';

const person = (
  name: string,
  stats: Partial<PersonStats> = {},
  extra: Partial<Person> = {}
): Person => ({
  _id: name,
  name,
  relationType: 'family',
  priority: 3,
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
    estimatedRemaining: null,
    estimateBasis: null,
    lastMetAt: null,
    daysSinceLast: null,
    nextMeetingAt: null,
    hasPlan: false,
    expectedIntervalDays: null,
    intervalSource: null,
    overdueRatio: null,
    needsAttention: false,
    ...stats,
  },
  ...extra,
});

/** OnPush: kiểm DOM sau khi request trả về, như reading-list.component.spec. */
describe('PeopleTabComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PeopleTabComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const text = (el: HTMLElement) => el.textContent?.replace(/\s+/g, ' ') || '';

  const render = (data: PeopleDashboard) => {
    const fixture = TestBed.createComponent(PeopleTabComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${apiUrl}/dashboard`).flush({ success: true, data });
    fixture.detectChanges();
    return fixture;
  };

  it('nhóm "Có hẹn" / "Chưa có hẹn" theo thứ tự server', () => {
    const planned = person('Mẹ', {
      hasPlan: true,
      nextMeetingAt: '2026-11-06T17:00:00Z',
    });
    const overdue = person('Bạn', { daysSinceLast: 60, needsAttention: true });
    const fixture = render({
      upcoming: [],
      noPlan: [overdue],
      needsAttentionCount: 1,
      people: [overdue, planned],
    });

    const body = text(fixture.nativeElement);
    expect(body).toContain('Có hẹn (1)');
    expect(body).toContain('Chưa có hẹn (1)');
    expect(body).toContain('Gặp 60 ngày trước');
  });

  it('danh sách KHÔNG hiển thị số lần gặp còn lại', () => {
    const p = person('Bố', { estimatedRemaining: 80 });
    const fixture = render({
      upcoming: [],
      noPlan: [p],
      needsAttentionCount: 0,
      people: [p],
    });
    expect(text(fixture.nativeElement)).not.toContain('lần nữa');
  });

  it('trạng thái rỗng', () => {
    const fixture = render({
      upcoming: [],
      noPlan: [],
      needsAttentionCount: 0,
      people: [],
    });
    expect(text(fixture.nativeElement)).toContain('Chưa có ai');
  });

  it('lỗi tải có nút thử lại', () => {
    const fixture = TestBed.createComponent(PeopleTabComponent);
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiUrl}/dashboard`)
      .flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(text(fixture.nativeElement)).toContain('Không tải được');
  });
});
