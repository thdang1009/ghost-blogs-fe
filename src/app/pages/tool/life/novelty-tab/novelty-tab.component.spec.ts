import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoveltyTabComponent } from './novelty-tab.component';
import { NoveltyExperience, NoveltySummary } from '@models/_index';
import { environment } from '@environments/environment';

const apiUrl = environment.apiUrl + '/v1/novelty';

const exp = (
  title: string,
  extra: Partial<NoveltyExperience> = {}
): NoveltyExperience => ({
  _id: title,
  title,
  category: 'food',
  status: 'PLANNED',
  doneAt: null,
  weekKey: null,
  reflection: { wasNew: null, feeling: '', again: null, note: '' },
  todoId: null,
  normalizedTitle: title.toLowerCase(),
  plannedDate: null,
  openTodoId: null,
  ...extra,
});

const summary = (extra: Partial<NoveltySummary> = {}): NoveltySummary => ({
  week: { weekKey: '2026-11-02', done: 0, goal: 1, met: false },
  planned: null,
  streak: { current: 0, longest: 0, currentWeekMet: false },
  total: 0,
  ideas: 0,
  weeks: Array.from({ length: 8 }, (_, i) => ({
    weekKey: `2026-09-${String(14 + i).padStart(2, '0')}`,
    done: 0,
  })),
  ...extra,
});

/**
 * Như reading-list.component.spec.ts: component OnPush, nên kiểm DOM SAU khi
 * request trả về — không kiểm thuộc tính của class.
 */
describe('NoveltyTabComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoveltyTabComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const render = () => {
    const fixture = TestBed.createComponent(NoveltyTabComponent);
    fixture.detectChanges();
    return fixture;
  };

  const text = (el: HTMLElement) => el.textContent?.replace(/\s+/g, ' ') || '';

  it('hiện trạng thái tải rồi danh sách', () => {
    const fixture = render();
    expect(text(fixture.nativeElement)).toContain('Đang tải');

    httpMock.expectOne(apiUrl).flush({
      success: true,
      data: [
        exp('Ăn bánh căn'),
        exp('Đi bộ cầu', { status: 'DONE', doneAt: '2026-11-03T03:00:00Z' }),
      ],
    });
    httpMock
      .expectOne(`${apiUrl}/summary`)
      .flush({ success: true, data: summary({ planned: exp('x') }) });
    fixture.detectChanges();

    const body = text(fixture.nativeElement);
    expect(body).not.toContain('Đang tải');
    expect(body).toContain('Ăn bánh căn');
    expect(body).toContain('Đi bộ cầu');
    expect(body).toContain('Sắp làm (1)');
    expect(body).toContain('Đã trải nghiệm (1)');
  });

  it('danh sách rỗng có trạng thái rỗng, và gợi ý khi chưa có kế hoạch', () => {
    const fixture = render();
    httpMock.expectOne(apiUrl).flush({ success: true, data: [] });
    httpMock
      .expectOne(`${apiUrl}/summary`)
      .flush({ success: true, data: summary() });
    httpMock.expectOne(`${apiUrl}/suggestions?limit=3`).flush({
      success: true,
      data: [{ title: 'Ăn bún mắm', category: 'food' }],
    });
    fixture.detectChanges();

    const body = text(fixture.nativeElement);
    expect(body).toContain('✨ Tuần này 0/1');
    expect(body).toContain('Chưa có ý tưởng nào');
    expect(body).toContain('+ Ăn bún mắm');
  });

  it('lỗi tải hiện nút thử lại', () => {
    const fixture = render();
    httpMock
      .expectOne(apiUrl)
      .flush({}, { status: 500, statusText: 'Server Error' });
    httpMock
      .expectOne(`${apiUrl}/summary`)
      .flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(text(fixture.nativeElement)).toContain('Không tải được');
  });

  it('dải 8 tuần không hiện số đếm "0"', () => {
    const fixture = render();
    httpMock.expectOne(apiUrl).flush({ success: true, data: [] });
    const weeks = summary().weeks.map((w, i) => ({
      ...w,
      done: i === 7 ? 2 : 0,
    }));
    httpMock.expectOne(`${apiUrl}/summary`).flush({
      success: true,
      data: summary({ weeks, planned: exp('x') }),
    });
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('.nv-strip-dot');
    expect(dots.length).toBe(8);
    expect(dots[0].textContent.trim()).toBe('');
    expect(dots[7].textContent.trim()).toBe('2');
  });
});
