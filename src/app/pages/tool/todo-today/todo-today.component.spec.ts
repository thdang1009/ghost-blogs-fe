import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToolModule } from '../tool.module';
import { TodoTodayComponent } from './todo-today.component';

/**
 * Smoke test cấu trúc màn hình.
 *
 * Sinh ra sau một lỗi thật: khối huy hiệu thưởng thiếu MỘT thẻ `</div>`, nên
 * toàn bộ phần còn lại của card bị lồng vào `*ngIf="savedRewardSeconds > 0"`.
 * Ví thưởng bằng 0 => cả trang trắng, mà template vẫn cân bằng thẻ và AOT vẫn
 * biên dịch sạch. Không có gì trong build bắt được lỗi đó — chỉ có việc dựng
 * component lên và nhìn xem cái gì thực sự hiện ra.
 */
describe('TodoTodayComponent — cấu trúc màn hình', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ToolModule,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify({ ignoreCancelled: true }));

  function render() {
    const fixture = TestBed.createComponent(TodoTodayComponent);
    fixture.detectChanges();
    // Nuốt các request khởi động; test này chỉ quan tâm tới cấu trúc DOM.
    httpMock
      .match(() => true)
      .forEach(req => req.flush({}, { status: 200, statusText: 'OK' }));
    fixture.detectChanges();
    return fixture;
  }

  it('hiện Focus Bar và danh sách NGAY CẢ KHI ví thưởng bằng 0', () => {
    const fixture = render();
    fixture.componentInstance.savedRewardSeconds = 0;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-todo-focus-bar')).toBeTruthy();
    expect(el.querySelector('app-todo-list')).toBeTruthy();
    expect(el.querySelector('.todo-strip')).toBeTruthy();
    expect(el.querySelector('.todo-add')).toBeTruthy();
  });

  it('Focus Bar là con TRỰC TIẾP của card, không nằm trong khối thưởng', () => {
    // Đây chính là hình dạng sai đã gây ra trang trắng.
    const el: HTMLElement = render().nativeElement;
    const focus = el.querySelector('app-todo-focus-bar');
    expect(focus).toBeTruthy();
    expect(focus!.closest('.todo-badges')).toBeNull();
    expect(focus!.closest('.reward-overlay')).toBeNull();
    expect(focus!.parentElement!.classList.contains('card')).toBe(true);
  });

  it('vẫn gắn được bảng cài đặt và bảng triage', () => {
    const el: HTMLElement = render().nativeElement;
    expect(el.querySelector('app-todo-settings-sheet')).toBeTruthy();
    expect(el.querySelector('app-todo-triage-sheet')).toBeTruthy();
  });

  it('không còn dấu vết của bảng cũ gây cuộn ngang', () => {
    const el: HTMLElement = render().nativeElement;
    expect(el.querySelector('.table-responsive')).toBeNull();
    expect(el.querySelector('table')).toBeNull();
  });
});
