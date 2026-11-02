import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { from, of } from 'rxjs';
import { concatMap, switchMap, toArray } from 'rxjs/operators';
import {
  ReadingBook,
  ReadingBookStatus,
  ReadingHabit,
  ReadingHabitEntry,
} from '@models/_index';
import {
  AlertService,
  ReadingBookService,
  TodoRecurrenceService,
} from '@services/_index';
import { readingProgress } from '@services/reading-book/reading-book.service';
import { editRecurrence } from '../todo-today/todo-recurrence-dialog/recurrence-editor';
import { ReadingHabitPanelComponent } from './reading-habit-panel/reading-habit-panel.component';

interface BookColumn {
  status: ReadingBookStatus;
  title: string;
  books: ReadingBook[];
}

/**
 * Danh sách sách (§9.5).
 *
 * KHÔNG phải thư viện ebook ở /admin/file/book — đó là kho file có phân quyền
 * và `MyFile` ref. Trang này chỉ theo dõi việc đọc: tên, link, ước lượng giờ,
 * bookmark.
 *
 * Đổi trạng thái sang/khỏi READING sẽ tự đồng bộ vòng xoay đọc ở server, nên
 * đọc xong một cuốn là ngày mai vòng xoay đổi mà không phải sửa lịch lặp.
 * Panel "Reading habit" ở đầu trang làm cơ chế đó NHÌN THẤY ĐƯỢC.
 */
@Component({
  selector: 'app-reading-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    ReadingHabitPanelComponent,
  ],
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingListComponent implements OnInit {
  books: ReadingBook[] = [];
  loading = false;
  editing: ReadingBook | null = null;
  draft: Partial<ReadingBook> = {};
  habit: ReadingHabit | null = null;
  habitBusy = false;

  readonly statuses: ReadingBookStatus[] = [
    'WISHLIST',
    'READING',
    'DONE',
    'DROPPED',
  ];

  constructor(
    private readingBookService: ReadingBookService,
    private alertService: AlertService,
    // OnPush chỉ kiểm tra lại khi component bị đánh dấu bẩn. Gán thuộc tính
    // trong callback HTTP KHÔNG đánh dấu gì cả, nên phải tự gọi markForCheck.
    // Thiếu nó thì sách vẫn tải về đúng mà màn hình trống trơn cho tới khi
    // bấm một nút bất kỳ — sự kiện mới là thứ đánh dấu bẩn.
    private cdr: ChangeDetectorRef,
    private recurrenceService: TodoRecurrenceService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
  }

  /** Sách và thói quen đọc luôn tải cùng nhau: đổi sách là đổi vòng đọc. */
  load(): void {
    this.loading = true;
    this.readingBookService.list().subscribe({
      next: books => {
        this.books = books;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.alertService.showNoti('Could not load your books', 'danger');
      },
    });
    this.loadHabit();
  }

  // ==========================================================================
  // Thói quen đọc
  // ==========================================================================

  loadHabit(): void {
    this.readingBookService.getHabit().subscribe({
      next: habit => this.showHabit(habit),
      error: () =>
        this.alertService.showNoti(
          'Could not load the reading habit',
          'danger'
        ),
    });
  }

  private showHabit(habit: ReadingHabit): void {
    this.habit = habit;
    this.habitBusy = false;
    this.cdr.markForCheck();
  }

  private habitFailed(fallback: string) {
    return (err: { error?: { msg?: string } }) => {
      this.habitBusy = false;
      this.cdr.markForCheck();
      this.alertService.showNoti(err?.error?.msg || fallback, 'danger');
    };
  }

  createHabit(): void {
    this.habitBusy = true;
    this.readingBookService.createHabit().subscribe({
      next: habit => {
        this.showHabit(habit);
        this.alertService.showNoti('Reading habit created', 'success');
      },
      error: this.habitFailed('Could not create the reading habit'),
    });
  }

  setNext(entry: ReadingHabitEntry): void {
    if (!entry.readingBookId) return;
    this.habitBusy = true;
    this.readingBookService.setNext(entry.readingBookId).subscribe({
      next: habit => this.showHabit(habit),
      error: this.habitFailed('Could not change the next book'),
    });
  }

  toggleHabitActive(): void {
    const recurrence = this.habit?.recurrence;
    if (!recurrence?._id) return;
    this.habitBusy = true;
    this.recurrenceService
      .update(recurrence._id, { active: !recurrence.active })
      .subscribe({
        next: () => this.loadHabit(),
        error: this.habitFailed('Could not update the reading habit'),
      });
  }

  /**
   * Lịch, phút, weight: cùng hộp thoại với mọi lịch lặp. Sau khi lưu thì
   * dựng lại vòng xoay một lần — bỏ các `targetMinutes` riêng từng cuốn mà
   * seed đã chép vào, nếu không số phút vừa sửa không có tác dụng.
   */
  editSchedule(): void {
    const recurrence = this.habit?.recurrence;
    if (!recurrence) return;
    editRecurrence(this.dialog, this.recurrenceService, recurrence)
      .pipe(
        switchMap(saved => {
          if (!saved) return of(null);
          return this.readingBookService
            .syncRotation()
            .pipe(switchMap(() => this.readingBookService.getHabit()));
        })
      )
      .subscribe({
        next: habit => {
          if (!habit) return;
          this.showHabit(habit);
          this.alertService.showNoti('Reading habit saved', 'success');
        },
        error: this.habitFailed('Could not save the reading habit'),
      });
  }

  /**
   * Đổi chỗ một cuốn trong vòng đọc bằng `order` — vòng xoay dựng theo đúng
   * trường đó, và server dựng lại mỗi khi nó đổi.
   *
   * Xếp lại TRONG dải `order` đang dùng, ép tăng ngặt: sách tạo trước đây
   * thường cùng `order: 0`, và tráo hai số 0 cho nhau thì không đổi gì. Gửi
   * TUẦN TỰ: mỗi PUT dựng lại vòng xoay, gửi song song thì hai lần dựng ghi
   * đè lên nhau.
   */
  moveInRotation(event: { entry: ReadingHabitEntry; delta: number }): void {
    const books = (this.habit?.rotation || [])
      .map(entry => entry.book)
      .filter((book): book is ReadingBook => !!book);
    const at = books.findIndex(book => book._id === event.entry.readingBookId);
    const to = at + event.delta;
    if (at === -1 || to < 0 || to >= books.length) return;

    const reordered = [...books];
    [reordered[at], reordered[to]] = [reordered[to], reordered[at]];

    const slots = books.map(book => book.order || 0).sort((a, b) => a - b);
    for (let i = 1; i < slots.length; i += 1) {
      if (slots[i] <= slots[i - 1]) slots[i] = slots[i - 1] + 1;
    }
    const updates = reordered
      .map((book, i) => ({ book, order: slots[i] }))
      .filter(({ book, order }) => book.order !== order);

    this.habitBusy = true;
    from(updates)
      .pipe(
        concatMap(({ book, order }) =>
          this.readingBookService.update(book._id!, { order })
        ),
        toArray()
      )
      .subscribe({
        next: () => this.load(),
        error: this.habitFailed('Could not reorder the books'),
      });
  }

  get columns(): BookColumn[] {
    return [
      {
        status: 'READING',
        title: 'Reading',
        books: this.books.filter(b => b.status === 'READING'),
      },
      {
        status: 'WISHLIST',
        title: 'Wishlist',
        books: this.books.filter(b => b.status === 'WISHLIST'),
      },
      {
        status: 'DONE',
        title: 'Finished',
        books: this.books.filter(
          b => b.status === 'DONE' || b.status === 'DROPPED'
        ),
      },
    ];
  }

  /**
   * Tiến độ là ƯỚC TÍNH: estimateHours do chủ nhân tự đoán và minutesRead chỉ
   * đếm buổi đọc ghi qua todo. Nhãn luôn phải nói rõ điều đó.
   */
  progressOf(book: ReadingBook): string {
    const { percent } = readingProgress(book);
    if (percent === null) return `${book.minutesRead || 0} min read`;
    return `≈ ${percent}% (ước tính)`;
  }

  startAdd(): void {
    this.editing = null;
    this.draft = { title: '', status: 'WISHLIST' };
  }

  startEdit(book: ReadingBook): void {
    this.editing = book;
    this.draft = { ...book };
  }

  cancelEdit(): void {
    this.editing = null;
    this.draft = {};
  }

  get isFormOpen(): boolean {
    return this.draft.title !== undefined;
  }

  save(): void {
    const title = (this.draft.title || '').trim();
    if (!title) return;

    const request = this.editing?._id
      ? this.readingBookService.update(this.editing._id, this.draft)
      : this.readingBookService.create(this.draft);

    request.subscribe({
      next: () => {
        this.alertService.showNoti('Saved', 'success');
        this.cancelEdit();
        this.load();
      },
      error: err =>
        this.alertService.showNoti(
          err?.error?.msg || 'Could not save the book',
          'danger'
        ),
    });
  }

  setStatus(book: ReadingBook, status: ReadingBookStatus): void {
    this.readingBookService.setStatus(book._id!, status).subscribe({
      next: () => {
        this.alertService.showNoti(`Moved to ${status}`, 'success');
        this.load();
      },
      error: () =>
        this.alertService.showNoti('Could not change status', 'danger'),
    });
  }

  remove(book: ReadingBook): void {
    if (!confirm(`Delete "${book.title}"?`)) return;
    this.readingBookService.remove(book._id!).subscribe({
      next: () => this.load(),
      error: () => this.alertService.showNoti('Could not delete', 'danger'),
    });
  }

  syncRotation(): void {
    this.readingBookService.syncRotation().subscribe({
      next: () => {
        this.alertService.showNoti('Reading rotation synced', 'success');
        this.load();
      },
      error: err =>
        this.alertService.showNoti(
          err?.error?.msg || 'Could not sync the rotation',
          'danger'
        ),
    });
  }

  trackById(_: number, book: ReadingBook): string | undefined {
    return book._id;
  }
}
