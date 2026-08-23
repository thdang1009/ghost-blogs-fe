import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReadingBook, ReadingBookStatus } from '@models/_index';
import { AlertService, ReadingBookService } from '@services/_index';
import { readingProgress } from '@services/reading-book/reading-book.service';

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
 */
@Component({
  selector: 'app-reading-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingListComponent implements OnInit {
  books: ReadingBook[] = [];
  loading = false;
  editing: ReadingBook | null = null;
  draft: Partial<ReadingBook> = {};

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

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
