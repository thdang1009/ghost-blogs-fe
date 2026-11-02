import {
  RecurrencePattern,
  RecurrenceVariant,
  TodoRecurrence,
} from '@models/_index';

export const WEEKDAYS = [
  { iso: 1, label: 'T2' },
  { iso: 2, label: 'T3' },
  { iso: 3, label: 'T4' },
  { iso: 4, label: 'T5' },
  { iso: 5, label: 'T6' },
  { iso: 6, label: 'T7' },
  { iso: 7, label: 'CN' },
];

/**
 * Lịch của recurrence WEEKDAY, SUY RA từ các biến thể — cùng luật với
 * `weekdayPattern` ở backend (helper/todo-recurrence.js). Server tự suy ra lúc
 * ghi; ở đây chỉ để câu xem trước đúng TRƯỚC khi bấm Lưu.
 */
export function weekdayUnion(rotation: RecurrenceVariant[]): number[] {
  const days = new Set<number>();
  rotation.forEach(v => (v.daysOfWeek || []).forEach(d => days.add(d)));
  return [...days].sort((a, b) => a - b);
}

/** Pattern thực sự chạy: WEEKDAY thì suy từ biến thể, còn lại giữ nguyên. */
export function effectivePattern(rec: TodoRecurrence): RecurrencePattern {
  if (rec.rotationMode !== 'WEEKDAY') return rec.pattern;
  return { type: 'DAYS_OF_WEEK', daysOfWeek: weekdayUnion(rec.rotation) };
}

export function dayNames(days: number[]): string {
  return WEEKDAYS.filter(d => days.includes(d.iso))
    .map(d => d.label)
    .join(', ');
}

/**
 * Câu xem trước bằng tiếng người. Hàm thuần, dùng chung cho hộp thoại sửa
 * và danh sách "Repeats" — hai bản sao sẽ sớm nói hai câu khác nhau về cùng
 * một lịch.
 */
export function recurrencePreview(rec: TodoRecurrence): string {
  const p = effectivePattern(rec);
  const rotation = rec.rotation || [];

  let when = '';
  switch (p.type) {
    case 'NONE':
      return 'Never repeats — available as a quick-add chip only.';
    case 'DAILY':
      when = 'Every day';
      break;
    case 'EVERY_N_DAYS':
      when = `Every ${p.interval || 1} day(s)`;
      break;
    case 'WEEKDAYS':
      when = 'T2–T6';
      break;
    case 'WEEKENDS':
      when = 'T7, CN';
      break;
    case 'DAYS_OF_WEEK':
      when = dayNames(p.daysOfWeek || []) || '(no day chosen)';
      break;
    case 'MONTHLY_DAY':
      when = `Day ${p.dayOfMonth || '?'} of each month`;
      break;
    case 'MONTHLY_QUOTA':
      when = `${dayNames(p.daysOfWeek || []) || '(no day)'} · at least ${
        p.quotaPerMonth || '?'
      }/month`;
      break;
  }

  if (!rotation.length) return when + '.';

  if (rec.rotationMode === 'WEEKDAY') {
    const assigned = rotation
      .map(v => `${dayNames(v.daysOfWeek || [])} ${v.label}`.trim())
      .filter(Boolean)
      .join(', ');
    const restDays = WEEKDAYS.filter(
      d => !rotation.some(v => (v.daysOfWeek || []).includes(d.iso))
    )
      .map(d => d.label)
      .join(', ');
    return `${when} — ${assigned}.${restDays ? ` Nghỉ ${restDays}.` : ''}`;
  }

  // Quay vòng giống `selectVariant` ở server, để "Next" không nói khác cron.
  const n = rotation.length;
  const current = rotation[(((rec.rotationIndex || 0) % n) + n) % n];
  return (
    `${when} — cycling ${rotation.map(v => v.label).join(' → ')}, ` +
    `advancing ${
      rec.rotationAdvance === 'ON_DONE' ? 'when completed' : 'when spawned'
    }. Next: ${current ? current.label : '—'}.`
  );
}
