export type RecurrencePatternType =
  | 'NONE'
  | 'DAILY'
  | 'EVERY_N_DAYS'
  | 'WEEKDAYS'
  | 'WEEKENDS'
  | 'DAYS_OF_WEEK'
  | 'MONTHLY_DAY'
  | 'MONTHLY_QUOTA';

export interface RecurrencePattern {
  type: RecurrencePatternType;
  interval?: number;
  /** ISO: 1 = thứ Hai … 7 = Chủ nhật. */
  daysOfWeek?: number[];
  dayOfMonth?: number | null;
  quotaPerMonth?: number | null;
}

export interface RecurrenceVariant {
  label: string;
  /** CHỈ có nghĩa ở chế độ WEEKDAY. */
  daysOfWeek?: number[];
  meta?: Record<string, unknown>;
}

/**
 * HAI CHẾ ĐỘ, KHÔNG THAY THẾ NHAU ĐƯỢC (ADR 0002 §D6):
 *
 * - `WEEKDAY`: lịch cố định theo thứ. Hôm nay chạy biến thể nào là do tờ lịch
 *   quyết định. Không thứ nào khớp = ngày nghỉ, không sinh việc.
 * - `CYCLE`: vòng xoay tiến dần theo `rotationIndex`, không liên quan tới thứ.
 */
export type RotationMode = 'CYCLE' | 'WEEKDAY';
export type RotationAdvance = 'ON_DONE' | 'ON_SPAWN';

export class TodoRecurrence {
  _id?: string;
  user?: number;
  title = '';
  active = true;
  pinned = false;
  weight = 3;
  estimateMinutes?: number | null;
  pattern: RecurrencePattern = { type: 'NONE' };
  rotationMode: RotationMode = 'CYCLE';
  rotation: RecurrenceVariant[] = [];
  rotationIndex = 0;
  rotationAdvance: RotationAdvance = 'ON_DONE';
  meta?: Record<string, unknown>;
  lastSpawnedDate?: string | null;
  nextRunDate?: string | null;
  legacyMarker?: string | null;
  createdAt?: string;
  updatedAt?: string;

  /** Chỉ có trên response của /rotate. */
  currentVariant?: string | null;
}

export type RotateDirection = 'NEXT' | 'PREV' | 'SET';
