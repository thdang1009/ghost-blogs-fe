/**
 * Life — Weekly Novelty và Important People (ADR 0003, backend).
 *
 * `plannedDate` / `nextMeetingAt` KHÔNG phải trường lưu trữ: server đọc ra từ
 * việc (TodoToday) đang mở mỗi lần trả về, vì việc có thể bị dời ở nhiều chỗ
 * — kể cả cron đêm.
 */

// ---------------------------------------------------------------- Novelty

export type NoveltyStatus = 'PLANNED' | 'DONE' | 'DROPPED';
export type NoveltyAgain = 'YES' | 'NO' | 'MAYBE';

export const NOVELTY_CATEGORIES: { value: string; label: string }[] = [
  { value: 'food', label: 'Ăn uống' },
  { value: 'place', label: 'Nơi chốn' },
  { value: 'skill', label: 'Kỹ năng' },
  { value: 'culture', label: 'Văn hoá' },
  { value: 'nature', label: 'Ngoài trời' },
  { value: 'social', label: 'Con người' },
  { value: 'create', label: 'Tự làm' },
  { value: 'other', label: 'Khác' },
];

/** Bốn ô, ô nào cũng bỏ trống được — suy ngẫm không bao giờ chặn việc tick. */
export interface NoveltyReflection {
  wasNew: boolean | null;
  feeling: string;
  again: NoveltyAgain | null;
  note: string;
}

export interface NoveltyExperience {
  _id: string;
  title: string;
  category: string;
  status: NoveltyStatus;
  doneAt: string | null;
  weekKey: string | null;
  reflection: NoveltyReflection;
  todoId: string | null;
  normalizedTitle: string;
  /** Ngày của việc đang mở; null = ý tưởng chưa có ngày. */
  plannedDate: string | null;
  openTodoId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoveltyDraft {
  title?: string;
  category?: string;
  status?: NoveltyStatus;
  /** 'YYYY-MM-DD' — chỉ dùng khi ghi lại một trải nghiệm đã làm. */
  doneDate?: string;
  reflection?: Partial<NoveltyReflection>;
}

export interface NoveltyWeek {
  weekKey: string;
  done: number;
}

export interface NoveltySummary {
  week: { weekKey: string; done: number; goal: number; met: boolean };
  planned: NoveltyExperience | null;
  streak: { current: number; longest: number; currentWeekMet: boolean };
  total: number;
  ideas: number;
  weeks: NoveltyWeek[];
}

export interface NoveltySuggestion {
  title: string;
  category: string;
}

export interface NoveltyDuplicateCheck {
  duplicate: boolean;
  matches: Pick<NoveltyExperience, '_id' | 'title' | 'status' | 'doneAt'>[];
}

// ---------------------------------------------------------------- People

export type RelationType =
  | 'family'
  | 'partner'
  | 'friend'
  | 'relative'
  | 'mentor'
  | 'colleague'
  | 'other';

export const RELATION_TYPES: { value: RelationType; label: string }[] = [
  { value: 'family', label: 'Gia đình' },
  { value: 'partner', label: 'Người thương' },
  { value: 'friend', label: 'Bạn bè' },
  { value: 'relative', label: 'Họ hàng' },
  { value: 'mentor', label: 'Người thầy' },
  { value: 'colleague', label: 'Đồng nghiệp' },
  { value: 'other', label: 'Khác' },
];

export type CadencePer = 'WEEK' | 'MONTH' | 'YEAR';

export const CADENCE_PER_LABELS: Record<CadencePer, string> = {
  WEEK: 'tuần',
  MONTH: 'tháng',
  YEAR: 'năm',
};

export interface Cadence {
  count: number | null;
  per: CadencePer | null;
}

/** Mọi con số ở đây là ƯỚC TÍNH — UI luôn gắn "≈ … (ước tính)". */
export interface PersonStats {
  manualPerYear: number | null;
  desiredPerYear: number | null;
  actual: { perYear: number; windowDays: number; meetings: number } | null;
  /** null khi chưa nhập remainingYears. 0 là giá trị thật — UI chọn ẩn. */
  estimatedRemaining: number | null;
  estimateBasis: 'MANUAL' | 'ACTUAL' | null;
  lastMetAt: string | null;
  daysSinceLast: number | null;
  nextMeetingAt: string | null;
  hasPlan: boolean;
  expectedIntervalDays: number | null;
  intervalSource: 'DESIRED' | 'MANUAL' | 'ACTUAL' | null;
  overdueRatio: number | null;
  needsAttention: boolean;
}

export interface Person {
  _id: string;
  name: string;
  relationType: RelationType;
  priority: number;
  notes: string;
  archived: boolean;
  cadence: Cadence | null;
  desiredCadence: Cadence | null;
  remainingYears: number | null;
  lastMetAt: string | null;
  nextMeetingAt: string | null;
  nextMeetingTodoId: string | null;
  stats: PersonStats;
  createdAt?: string;
}

export interface PersonDraft {
  name?: string;
  relationType?: RelationType;
  priority?: number;
  notes?: string;
  cadence?: Cadence | null;
  desiredCadence?: Cadence | null;
  remainingYears?: number | null;
}

export interface PersonMeeting {
  _id: string;
  personId: string;
  date: string;
  durationMinutes: number | null;
  note: string;
  source: 'MANUAL' | 'TODO';
  todoId: string | null;
}

export interface PersonMeetingDraft {
  date?: string;
  durationMinutes?: number | null;
  note?: string;
}

export interface UpcomingMeeting {
  todoId: string;
  personId: string;
  name: string;
  date: string;
}

export interface PeopleDashboard {
  upcoming: UpcomingMeeting[];
  noPlan: Person[];
  /** Chỉ người QUÁ nhịp của chính họ — không phải mọi người chưa có hẹn. */
  needsAttentionCount: number;
  people: Person[];
}
