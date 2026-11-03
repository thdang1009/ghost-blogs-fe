import {
  addDaysKey,
  formatDay,
  formatLongDay,
  ictDateKey,
  relativeDay,
} from './life-date.util';

const ict = (isoLocal: string) => new Date(`${isoLocal}+07:00`);

describe('life-date.util', () => {
  it('khoá ngày theo giờ VN, không theo múi giờ trình duyệt', () => {
    // 23:30 giờ VN = 16:30 UTC cùng ngày; 00:30 giờ VN = 17:30 UTC hôm trước.
    expect(ictDateKey(ict('2026-11-08T23:30:00'))).toBe('2026-11-08');
    expect(ictDateKey(ict('2026-11-09T00:30:00'))).toBe('2026-11-09');
  });

  it('cộng ngày qua ranh giới năm', () => {
    expect(addDaysKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysKey('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('định dạng thứ + ngày/tháng', () => {
    expect(formatDay(ict('2026-11-05T10:00:00'))).toBe('T5 05/11');
    expect(formatDay(ict('2026-11-08T23:59:00'))).toBe('CN 08/11');
    expect(formatDay(null)).toBe('');
    expect(formatLongDay(ict('2026-01-02T08:00:00'))).toBe('02/01/2026');
  });

  it('Hôm nay / Ngày mai / còn lại', () => {
    const now = ict('2026-11-04T09:00:00');
    expect(relativeDay(ict('2026-11-04T00:00:00'), now)).toBe('Hôm nay');
    expect(relativeDay(ict('2026-11-05T00:00:00'), now)).toBe('Ngày mai');
    expect(relativeDay(ict('2026-11-07T00:00:00'), now)).toBe('T7 07/11');
  });
});
