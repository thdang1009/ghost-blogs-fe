import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SimpleChange } from '@angular/core';
import { PersonSheetComponent } from './person-sheet.component';
import { Person, PersonStats } from '@models/_index';
import { environment } from '@environments/environment';

const apiUrl = environment.apiUrl + '/v1/people';

const person = (stats: Partial<PersonStats> = {}): Person => ({
  _id: 'p1',
  name: 'Bố',
  relationType: 'family',
  priority: 2,
  notes: '',
  archived: false,
  cadence: { count: 4, per: 'YEAR' },
  desiredCadence: null,
  remainingYears: 20,
  lastMetAt: null,
  nextMeetingAt: null,
  nextMeetingTodoId: null,
  stats: {
    manualPerYear: 4,
    desiredPerYear: null,
    actual: null,
    estimatedRemaining: null,
    estimateBasis: 'MANUAL',
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
});

describe('PersonSheetComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PersonSheetComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const text = (el: HTMLElement) => el.textContent?.replace(/\s+/g, ' ') || '';

  const render = (p: Person) => {
    const fixture = TestBed.createComponent(PersonSheetComponent);
    fixture.componentInstance.person = p;
    fixture.componentInstance.ngOnChanges({
      person: new SimpleChange(null, p, true),
    });
    fixture.detectChanges();
    httpMock
      .expectOne(`${apiUrl}/p1/meetings`)
      .flush({ success: true, data: [] });
    fixture.detectChanges();
    return fixture;
  };

  it('hiện "≈ N lần nữa (ước tính)" kèm cơ sở tính', () => {
    const fixture = render(person({ estimatedRemaining: 80 }));
    const body = text(fixture.nativeElement);
    expect(body).toContain('≈ 80 lần nữa (ước tính)');
    expect(body).toContain('4 lần/năm × 20 năm');
  });

  it('chưa nhập số năm hoặc ra 0: không hiện gì', () => {
    expect(text(render(person()).nativeElement)).not.toContain('lần nữa');
  });

  it('remainingYears = 0: ẩn', () => {
    const fixture = render(person({ estimatedRemaining: 0 }));
    expect(text(fixture.nativeElement)).not.toContain('lần nữa');
  });

  it('tần suất tay và đo được đứng cạnh nhau', () => {
    const fixture = render(
      person({ actual: { perYear: 3.2, windowDays: 365, meetings: 3 } })
    );
    const body = text(fixture.nativeElement);
    expect(body).toContain('4 lần/năm');
    expect(body).toContain('≈ 3,2 lần/năm');
  });

  it('chưa có hẹn: chữ trung tính, lịch sử rỗng', () => {
    const body = text(render(person()).nativeElement);
    expect(body).toContain('Chưa có hẹn');
    expect(body).toContain('Chưa có lần gặp nào được ghi');
  });
});
