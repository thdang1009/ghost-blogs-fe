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

export interface ReadingBookProgress {
  percent: number | null;
  minutesRead: number;
  estimateMinutes: number | null;
}
