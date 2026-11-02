import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReadingListComponent } from './reading-list.component';
import { ReadingBook, ReadingHabit, TodoRecurrence } from '@models/_index';
import { environment } from '@environments/environment';

const apiUrl = environment.apiUrl + '/v1/reading-book';

const book = (title: string, status = 'READING'): Partial<ReadingBook> => ({
  _id: title,
  title,
  status: status as ReadingBook['status'],
  minutesRead: 0,
  order: 0,
  author: '',
  link: '',
  cursor: '',
  note: '',
});

/**
 * Sinh ra sau một lỗi thật: component dùng OnPush và gán `this.books` trong
 * callback HTTP mà không `markForCheck()`. Sách tải về đúng nhưng màn hình
 * trống, cho tới khi bấm một nút bất kỳ — vì SỰ KIỆN mới là thứ đánh dấu
 * component bẩn. Tải lại trang là trắng lại.
 *
 * Nên các test dưới đây kiểm DOM SAU khi request trả về, chứ không kiểm
 * thuộc tính của class. Kiểm `component.books` sẽ xanh trong khi người dùng
 * vẫn nhìn vào một trang trống.
 */
describe('ReadingListComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReadingListComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const NO_HABIT: ReadingHabit = {
    recurrence: null,
    rotation: [],
    nextIndex: null,
    nextBook: null,
  };

  /** Thói quen đọc có `titles` trong vòng xoay, cuốn `next` tới lượt. */
  const habitOf = (titles: string[], next = 0): ReadingHabit => ({
    recurrence: {
      ...new TodoRecurrence(),
      _id: 'rec',
      title: '📖 Read',
      pattern: { type: 'DAILY' },
      weight: 3,
      meta: { kind: 'READING', targetMinutes: 20 },
    },
    rotation: titles.map((title, index) => ({
      index,
      label: title,
      readingBookId: title,
      cursor: '',
      book: { ...book(title), order: index } as ReadingBook,
    })),
    nextIndex: titles.length ? next : null,
    nextBook: titles.length ? (book(titles[next]) as ReadingBook) : null,
  });

  const flushHabit = (habit: ReadingHabit = NO_HABIT) =>
    httpMock.expectOne(`${apiUrl}/habit`).flush({ success: true, data: habit });

  function renderWith(
    books: Partial<ReadingBook>[],
    habit: ReadingHabit = NO_HABIT
  ) {
    const fixture = TestBed.createComponent(ReadingListComponent);
    fixture.detectChanges(); // kích hoạt ngOnInit -> GET sách + GET thói quen
    httpMock.expectOne(apiUrl).flush({ success: true, data: books });
    flushHabit(habit);
    fixture.detectChanges();
    return fixture;
  }

  it('HIỆN sách ngay sau lần tải đầu, không cần bấm gì', () => {
    const el: HTMLElement = renderWith([
      book('Designing Data-Intensive Applications'),
      book('Essentialism'),
    ]).nativeElement;

    const titles = Array.from(el.querySelectorAll('.rl-book strong')).map(n =>
      n.textContent!.trim()
    );
    expect(titles).toContain('Designing Data-Intensive Applications');
    expect(titles).toContain('Essentialism');
  });

  it('xếp sách vào đúng cột theo trạng thái', () => {
    const el: HTMLElement = renderWith([
      book('Đang đọc', 'READING'),
      book('Muốn đọc', 'WISHLIST'),
      book('Đã xong', 'DONE'),
    ]).nativeElement;

    const columns = Array.from(el.querySelectorAll('.rl-column')).map(col => ({
      heading: col.querySelector('h5')!.textContent!.trim(),
      titles: Array.from(col.querySelectorAll('.rl-book strong')).map(n =>
        n.textContent!.trim()
      ),
    }));

    expect(columns[0].heading).toContain('Reading');
    expect(columns[0].titles).toEqual(['Đang đọc']);
    expect(columns[1].titles).toEqual(['Muốn đọc']);
    expect(columns[2].titles).toEqual(['Đã xong']);
  });

  it('danh sách rỗng thì hiện dòng trống, không phải khoảng trắng', () => {
    const el: HTMLElement = renderWith([]).nativeElement;
    expect(el.querySelectorAll('.rl-empty').length).toBe(3);
  });

  it('link sách luôn kèm rel="noopener noreferrer"', () => {
    // Link do chủ nhân tự nhập và nằm trên trang đang đăng nhập.
    const el: HTMLElement = renderWith([
      { ...book('Có link'), link: 'https://example.com/ddia' },
    ]).nativeElement;

    const anchor = el.querySelector('.rl-book a') as HTMLAnchorElement;
    expect(anchor).toBeTruthy();
    expect(anchor.rel).toContain('noopener');
    expect(anchor.rel).toContain('noreferrer');
    expect(anchor.target).toBe('_blank');
  });

  it('tiến độ luôn gắn nhãn ước tính, không trình bày như số đo', () => {
    const el: HTMLElement = renderWith([
      { ...book('Có ước lượng'), estimateHours: 10, minutesRead: 300 },
    ]).nativeElement;

    const progress = el.querySelector('.rl-book-progress span')!.textContent!;
    expect(progress).toContain('50%');
    expect(progress).toContain('ước tính');
  });

  it('sau khi đồng bộ vòng xoay thì nạp lại danh sách', () => {
    const fixture = renderWith([book('DDIA')]);
    fixture.componentInstance.syncRotation();

    httpMock
      .expectOne(`${apiUrl}/sync-rotation`)
      .flush({ success: true, data: {} });
    httpMock.expectOne(apiUrl).flush({ success: true, data: [book('DDIA')] });
    flushHabit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.rl-book').length).toBe(1);
  });

  describe('panel "Reading habit"', () => {
    it('nói cuốn nào tới lượt và hiện vòng đọc theo thứ tự', () => {
      const el: HTMLElement = renderWith(
        [book('DDIA'), book('Essentialism')],
        habitOf(['DDIA', 'Essentialism'], 1)
      ).nativeElement;

      expect(el.querySelector('.rh-next')!.textContent).toContain(
        'Essentialism'
      );
      const order = Array.from(el.querySelectorAll('.rh-title')).map(n =>
        n.textContent!.trim()
      );
      expect(order).toEqual(['DDIA', 'Essentialism']);
      expect(el.querySelector('.rh-facts')!.textContent).toContain('20 min');
    });

    it('chưa có thói quen thì có nút tạo, bấm là POST /habit', () => {
      const fixture = renderWith([book('DDIA')]);
      const create = Array.from(
        fixture.nativeElement.querySelectorAll('.rh-btn')
      ).find(b =>
        (b as HTMLElement).textContent!.includes('Create reading habit')
      ) as HTMLButtonElement;
      expect(create).toBeTruthy();

      create.click();
      const req = httpMock.expectOne(`${apiUrl}/habit`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, data: habitOf(['DDIA']) });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.rh-next')).toBeTruthy();
    });

    it('"Set as next" gửi id SÁCH, không gửi chỉ số', () => {
      const fixture = renderWith(
        [book('DDIA'), book('Essentialism')],
        habitOf(['DDIA', 'Essentialism'], 0)
      );
      (fixture.nativeElement.querySelector('.rh-link') as HTMLElement).click();

      const req = httpMock.expectOne(`${apiUrl}/habit/next`);
      expect(req.request.body).toEqual({ readingBookId: 'Essentialism' });
      req.flush({ success: true, data: habitOf(['DDIA', 'Essentialism'], 1) });
    });

    it('đổi chỗ hai cuốn cùng `order` vẫn thật sự đổi được', () => {
      // Sách tạo trước đây thường cùng order 0; tráo hai số 0 thì không đổi gì.
      const habit = habitOf(['A', 'B']);
      habit.rotation.forEach(entry => (entry.book!.order = 0));
      const fixture = renderWith([book('A'), book('B')], habit);

      fixture.componentInstance.moveInRotation({
        entry: habit.rotation[0],
        delta: 1,
      });

      // Thứ tự mới B, A trong dải 0..1 — chỉ A phải đổi (0 -> 1).
      const put = httpMock.expectOne(`${apiUrl}/A`);
      expect(put.request.method).toBe('PUT');
      expect(put.request.body).toEqual({ order: 1 });
      put.flush({ success: true, data: { ...book('A'), order: 1 } });

      httpMock.expectOne(apiUrl).flush({ success: true, data: [] });
      flushHabit(habitOf(['B', 'A']));
    });

    it('form sửa sách có ô bookmark', () => {
      const fixture = renderWith([book('DDIA')]);
      fixture.componentInstance.startEdit(book('DDIA') as ReadingBook);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('input[aria-label="Bookmark"]')
      ).toBeTruthy();
    });
  });
});
