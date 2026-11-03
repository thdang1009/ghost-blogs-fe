import { Person, PersonStats } from '@models/_index';
import {
  cadenceLabel,
  lastMetLabel,
  perYearLabel,
  relationLabel,
  remainingLabel,
} from './people-format.util';

const stats = (extra: Partial<PersonStats> = {}): PersonStats => ({
  manualPerYear: null,
  desiredPerYear: null,
  actual: null,
  estimatedRemaining: null,
  estimateBasis: null,
  lastMetAt: null,
  daysSinceLast: null,
  nextMeetingAt: null,
  hasPlan: false,
  expectedIntervalDays: null,
  intervalSource: null,
  overdueRatio: null,
  needsAttention: false,
  ...extra,
});

const person = (s: Partial<PersonStats> = {}): Person => ({
  _id: 'p',
  name: 'Mẹ',
  relationType: 'family',
  priority: 2,
  notes: '',
  archived: false,
  cadence: null,
  desiredCadence: null,
  remainingYears: null,
  lastMetAt: null,
  nextMeetingAt: null,
  nextMeetingTodoId: null,
  stats: stats(s),
});

describe('people-format.util', () => {
  it('cadence', () => {
    expect(cadenceLabel({ count: 1, per: 'MONTH' })).toBe('1 lần/tháng');
    expect(cadenceLabel({ count: 0, per: 'YEAR' })).toBe('0 lần/năm');
    expect(cadenceLabel(null)).toBe('');
    expect(cadenceLabel({ count: null, per: 'WEEK' })).toBe('');
  });

  it('tần suất luôn có ≈ và một chữ số thập phân', () => {
    expect(perYearLabel(3.25)).toBe('≈ 3,3 lần/năm');
    expect(perYearLabel(12)).toBe('≈ 12 lần/năm');
    expect(perYearLabel(null)).toBe('');
  });

  it('lần gặp gần nhất', () => {
    expect(lastMetLabel(person())).toBe('Chưa ghi lần gặp nào');
    expect(lastMetLabel(person({ daysSinceLast: 0 }))).toBe('Gặp hôm nay');
    expect(lastMetLabel(person({ daysSinceLast: 1 }))).toBe('Gặp hôm qua');
    expect(lastMetLabel(person({ daysSinceLast: 12 }))).toBe(
      'Gặp 12 ngày trước'
    );
    expect(lastMetLabel(person({ daysSinceLast: 95 }))).toBe(
      'Gặp 3 tháng trước'
    );
  });

  it('số lần còn lại: ẩn khi null hoặc 0, luôn ghi ước tính', () => {
    expect(remainingLabel(person())).toBeNull();
    expect(remainingLabel(person({ estimatedRemaining: 0 }))).toBeNull();
    expect(remainingLabel(person({ estimatedRemaining: 80 }))).toBe(
      '≈ 80 lần nữa (ước tính)'
    );
  });

  it('nhãn quan hệ', () => {
    expect(relationLabel('family')).toBe('Gia đình');
    expect(relationLabel('zzz')).toBe('Khác');
  });
});
