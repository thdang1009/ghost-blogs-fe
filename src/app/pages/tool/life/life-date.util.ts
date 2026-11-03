/**
 * Ngày theo giờ Việt Nam (UTC+7, không DST) cho trang Life — cùng quy ước với
 * `helper/ict-date.util.js` ở backend. Server nhận và trả ngày dưới dạng
 * 'YYYY-MM-DD' giờ VN, nên client KHÔNG được dùng múi giờ của trình duyệt để
 * tạo khoá ngày: mở trang khi đang ở nước ngoài sẽ lệch một ngày.
 */

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** 'YYYY-MM-DD' theo giờ VN. */
export function ictDateKey(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.getTime() + ICT_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDaysKey(key: string, days: number): string {
  return new Date(new Date(`${key}T00:00:00.000Z`).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** 'T5 06/11' theo giờ VN. */
export function formatDay(date: Date | string | null): string {
  if (!date) return '';
  const key = ictDateKey(date);
  const [, month, day] = key.split('-');
  const weekday = new Date(`${key}T00:00:00.000Z`).getUTCDay();
  return `${WEEKDAYS[weekday]} ${day}/${month}`;
}

/** 'Hôm nay' / 'Ngày mai' / 'T5 06/11'. */
export function relativeDay(
  date: Date | string | null,
  now: Date = new Date()
): string {
  if (!date) return '';
  const key = ictDateKey(date);
  const today = ictDateKey(now);
  if (key === today) return 'Hôm nay';
  if (key === addDaysKey(today, 1)) return 'Ngày mai';
  return formatDay(date);
}

/** 'DD/MM/YYYY' cho lịch sử. */
export function formatLongDay(date: Date | string | null): string {
  if (!date) return '';
  const [year, month, day] = ictDateKey(date).split('-');
  return `${day}/${month}/${year}`;
}
