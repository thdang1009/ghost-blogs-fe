import { TodoRecurrence } from './todo-recurrence';

export type ReadingBookStatus = 'WISHLIST' | 'READING' | 'DONE' | 'DROPPED';

export class ReadingBook {
  _id?: string;
  user?: number;
  title = '';
  author = '';
  link = '';
  /** Ước lượng của chính chủ nhân, KHÔNG phải số đo — luôn hiển thị kèm "ước tính". */
  estimateHours?: number | null;
  status: ReadingBookStatus = 'WISHLIST';
  order = 0;
  cursor = '';
  /** Chỉ cộng dồn từ buổi đọc ghi qua todo, nên là cận DƯỚI. */
  minutesRead = 0;
  rating?: number | null;
  note = '';
  startedAt?: string | null;
  finishedAt?: string | null;
  bookId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Một mục của vòng đọc, đã nối với cuốn sách thật (GET /habit). */
export interface ReadingHabitEntry {
  index: number;
  label: string;
  readingBookId: string | null;
  cursor: string;
  /** null nếu cuốn sách đã bị xoá mà vòng xoay chưa dựng lại. */
  book: ReadingBook | null;
}

/**
 * Thói quen đọc: MỘT TodoRecurrence `meta.kind: 'READING'`, vòng xoay dựng
 * từ các cuốn READING theo `order`. `recurrence: null` = chưa có thói quen.
 */
export interface ReadingHabit {
  recurrence: TodoRecurrence | null;
  rotation: ReadingHabitEntry[];
  /** Cuốn mà lần sinh việc kế tiếp sẽ dùng — cùng phép chọn với cron. */
  nextIndex: number | null;
  nextBook: ReadingBook | null;
}

export interface ReadingBookProgress {
  percent: number | null;
  minutesRead: number;
  estimateMinutes: number | null;
}
