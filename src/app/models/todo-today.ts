/** Payload theo domain gắn trên mỗi việc — khớp ADR 0002 §5.3 ở backend. */
export interface TodoReadingMeta {
  kind: 'READING';
  readingBookId?: string | null;
  bookTitle?: string;
  unit?: 'MINUTES' | 'PAGES';
  targetMinutes?: number;
  targetPages?: number;
  cursor?: string;
  actualMinutes?: number;
  pagesRead?: number;
}

export interface TodoWorkoutExercise {
  name: string;
  sets?: number;
  reps?: string;
}

export interface TodoWorkoutMeta {
  kind: 'WORKOUT';
  group?: string;
  exercises?: TodoWorkoutExercise[];
  targetMinutes?: number;
  actualMinutes?: number;
  location?: 'HOME' | 'GYM';
}

export interface TodoOfficeMeta {
  kind: 'OFFICE';
  quotaPerMonth?: number;
  quotaAtRisk?: boolean;
  quotaShortfall?: number;
}

export interface TodoRoadmapMeta {
  kind: 'ROADMAP';
  sessionType?: 'SHORT' | 'LONG';
  milestoneKey?: string;
  itemKeys?: string[];
  weekKey?: string;
  tickItemOnDone?: boolean;
  learningSessionId?: string;
}

/**
 * `meta` là object tự do ở backend; ở đây khai báo union của những hình dạng
 * thực sự được sinh ra, cộng thêm chỉ mục mở để các trường phụ (variantLabel,
 * legacyContent, v2Backfill) không làm TypeScript kêu.
 */
export type TodoMeta = (
  | TodoReadingMeta
  | TodoWorkoutMeta
  | TodoOfficeMeta
  | TodoRoadmapMeta
  | { kind?: undefined }
) & {
  variantLabel?: string;
  [key: string]: unknown;
};

export type TodoBucket = 'DAY' | 'BACKLOG';
export type TodoSourceKind = 'MANUAL' | 'RECURRENCE' | 'ROADMAP' | 'TEMPLATE';

export class TodoToday {
  id?: number;
  date?: Date | string | null;
  user?: number;
  content?: string; // content
  status?: string;
  updateTime?: Date;
  order?: number;
  todoLabel?: string[];
  checked?: boolean;

  // --- Todo Today v2 ---
  /** 1..5. Doc cũ chưa backfill KHÔNG có trường này — đọc bằng `weight ?? 3`. */
  weight?: number;
  bucket?: TodoBucket;
  recurrenceId?: string | null;
  occurrenceKey?: string | null;
  originalDate?: Date | string | null;
  deferCount?: number;
  lastTriagedAt?: Date | string | null;
  completedAt?: Date | string | null;
  sourceKind?: TodoSourceKind;
  sourceRef?: string | null;
  meta?: TodoMeta;

  /** Chỉ có trên response của /defer — cho UI nói được lý do việc biến mất. */
  autoBacklogged?: boolean;
}
