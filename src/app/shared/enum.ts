export enum BookPermission {
  PUBLIC = 'PUBLIC',
  PROTECTED = 'PROTECTED',
  PRIVATE = 'PRIVATE',
  READONLY = 'READONLY',
}

export const TDTD_STATUS = {
  NONE: 'NONE',
  NEW: 'NEW',
  NOT_YET: 'NOT_YET',
  TOMORROW: 'TOMORROW',
  IN_PAST: 'IN_PAST',
  DONE: 'DONE',
};

/**
 * Todo Today v2 — độ quan trọng tường minh, thay cho việc suy ra từ vị trí
 * dòng. Vị trí (`order`) vẫn còn và vẫn kéo-thả được, nhưng thôi mang nghĩa
 * ưu tiên (ADR 0002 §1).
 */
export const TODO_WEIGHT = {
  MUST: 5,
  HIGH: 4,
  NORMAL: 3,
  LOW: 2,
  SOMEDAY: 1,
};

/** Nhãn + màu nền theo weight. Thứ tự giảm dần để render pill/menu. */
export const TODO_WEIGHT_META = [
  { value: 5, label: 'Must today', short: 'Must', color: '#FFE7E7' },
  { value: 4, label: 'High', short: 'High', color: '#E7FAFD' },
  { value: 3, label: 'Normal', short: 'Norm', color: '#F7FDFF' },
  { value: 2, label: 'Low', short: 'Low', color: '#DFEAF2' },
  { value: 1, label: 'Someday', short: 'Some', color: '#FFFFFF' },
];

/** Doc cũ chưa chạy backfill không có `weight` — đọc ở đâu cũng phải `?? 3`. */
export const TODO_DEFAULT_WEIGHT = 3;

export const TODO_BUCKET = {
  DAY: 'DAY',
  BACKLOG: 'BACKLOG',
};

export const RECURRENCE_PATTERN = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  EVERY_N_DAYS: 'EVERY_N_DAYS',
  WEEKDAYS: 'WEEKDAYS',
  WEEKENDS: 'WEEKENDS',
  DAYS_OF_WEEK: 'DAYS_OF_WEEK',
  MONTHLY_DAY: 'MONTHLY_DAY',
  MONTHLY_QUOTA: 'MONTHLY_QUOTA',
};

export const READING_BOOK_STATUS = {
  WISHLIST: 'WISHLIST',
  READING: 'READING',
  DONE: 'DONE',
  DROPPED: 'DROPPED',
};
export const POST_STATUS = {
  NONE: 'NONE',
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  PROTECTED: 'PROTECTED',
};
export const FILE_PERMISSION = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  PROTECTED: 'PROTECTED',
  SHARE_LINK_TO_ACCESS: 'SHARE_LINK_TO_ACCESS',
};
export const POST_TYPE = {
  // GHOST_EDITOR: 'GHOST_EDITOR',
  MARKDOWN: 'MARKDOWN',
};
