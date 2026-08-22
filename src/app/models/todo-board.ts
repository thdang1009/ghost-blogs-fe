import { TodoToday } from './todo-today';

/** Envelope của các endpoint Todo Today v2 (giống /v1/learning-roadmap). */
export interface TodoApiResponse<T> {
  success: boolean;
  data: T;
  msg?: string;
}

export interface UserTodoSettings {
  _id?: string;
  user?: number;
  createdAt?: Date;
  updatedAt?: Date;

  todayCount: number;
  weeklyCount: number;
  monthlyCount: number;
  // v2
  sortByWeight: boolean;
  focusCount: number;
  endOfDayHour: number;
  autoDeferAtNight: boolean;
  maxDeferBeforeBacklog: number;
}

/**
 * Hạn mức MỀM: chỉ để hiện một dòng nhắc, không bao giờ chặn thao tác nào.
 * Tính ở server để luật `weight ?? 3` chỉ tồn tại ở một nơi.
 */
export interface TodoSoftCap {
  cap: number;
  high: number;
  exceeded: boolean;
}

export interface TodoScheduledDay {
  date: string; // 'YYYY-MM-DD'
  count: number;
  items: TodoToday[];
}

export interface TodoBacklogPreview {
  count: number;
  items: TodoToday[];
}

export interface QuickAddChip {
  kind: 'RECURRENCE' | 'FREQUENT';
  recurrenceId?: string;
  title: string;
  weight: number;
  meta?: Record<string, unknown>;
  alreadyToday: boolean;
}

/**
 * Một lần gọi dựng cả màn hình.
 *
 * LƯU Ý: `focus` là TẬP CON của `today`, không phải danh sách riêng. Khi render
 * phải khử trùng theo `id` (hoặc render `today` trừ đi các id trong `focus`),
 * nếu không việc quan trọng nhất sẽ hiện hai lần.
 */
export interface TodoBoard {
  date: string;
  focus: TodoToday[];
  today: TodoToday[];
  overdue: TodoToday[];
  scheduled: TodoScheduledDay[];
  backlog: TodoBacklogPreview;
  softCap: TodoSoftCap;
  settings: UserTodoSettings;
  quickAdd: QuickAddChip[];
  /** null cho tới khi slice 10 lấp — khoá có sẵn để response không đổi hình. */
  stats: TodoBoardStats | null;
}

export interface TodoBoardStats {
  reading?: unknown;
  workout?: unknown;
  office?: unknown;
  roadmap?: unknown;
  completion?: unknown;
}

export type TodoDeferTarget = 'TOMORROW' | 'DATE' | 'BACKLOG';

export interface TodoDeferPayload {
  to: TodoDeferTarget;
  date?: string; // 'YYYY-MM-DD', bắt buộc khi to === 'DATE'
}

export interface TodoBacklogPage {
  count: number;
  limit: number;
  offset: number;
  items: TodoToday[];
}
