import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReadingListComponent } from './reading-list.component';
import { ReadingBook } from '@models/_index';
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

  function renderWith(books: Partial<ReadingBook>[]) {
    const fixture = TestBed.createComponent(ReadingListComponent);
    fixture.detectChanges(); // kích hoạt ngOnInit -> GET
    httpMock.expectOne(apiUrl).flush({ success: true, data: books });
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
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.rl-book').length).toBe(1);
  });
});
