import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  RecurrencePatternType,
  RotationMode,
  TodoRecurrence,
} from '@models/_index';

const WEEKDAYS = [
  { iso: 1, label: 'T2' },
  { iso: 2, label: 'T3' },
  { iso: 3, label: 'T4' },
  { iso: 4, label: 'T5' },
  { iso: 5, label: 'T6' },
  { iso: 6, label: 'T7' },
  { iso: 7, label: 'CN' },
];

const PATTERNS: { value: RecurrencePatternType; label: string }[] = [
  { value: 'NONE', label: 'Never (template only)' },
  { value: 'DAILY', label: 'Every day' },
  { value: 'EVERY_N_DAYS', label: 'Every N days' },
  { value: 'WEEKDAYS', label: 'Weekdays' },
  { value: 'WEEKENDS', label: 'Weekends' },
  { value: 'DAYS_OF_WEEK', label: 'Specific days' },
  { value: 'MONTHLY_DAY', label: 'Day of month' },
  { value: 'MONTHLY_QUOTA', label: 'N times a month' },
];

/**
 * Trình sửa lịch lặp. KHÔNG có ô nào để gõ `[loop:...]` — đó là toàn bộ mục
 * đích (§10.4).
 *
 * Hai chế độ biến thể được hỏi TƯỜNG MINH, vì chúng hành xử rất khác nhau
 * (§D6). Ở chế độ "Theo thứ" có dải 7 ngày bên dưới, ngày trống ghi rõ
 * "nghỉ" — để gán nhầm thành thứ NHÌN THẤY ĐƯỢC, thay vì phải suy ra.
 */
@Component({
  selector: 'app-todo-recurrence-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDialogModule],
  templateUrl: './todo-recurrence-dialog.component.html',
  styleUrls: ['./todo-recurrence-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoRecurrenceDialogComponent {
  readonly weekdays = WEEKDAYS;
  readonly patterns = PATTERNS;

  model: TodoRecurrence;
  modeWarning = '';

  constructor(
    private dialogRef: MatDialogRef<TodoRecurrenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { recurrence?: TodoRecurrence }
  ) {
    const source = data?.recurrence;
    this.model = {
      ...new TodoRecurrence(),
      ...(source || {}),
      pattern: { type: 'DAILY', ...(source?.pattern || {}) },
      rotation: (source?.rotation || []).map(entry => ({
        ...entry,
        daysOfWeek: [...(entry.daysOfWeek || [])],
      })),
    };
  }

  get isEdit(): boolean {
    return !!this.model._id;
  }

  get patternType(): RecurrencePatternType {
    return this.model.pattern.type;
  }

  get needsInterval(): boolean {
    return this.patternType === 'EVERY_N_DAYS';
  }

  get needsDays(): boolean {
    return (
      this.patternType === 'DAYS_OF_WEEK' ||
      this.patternType === 'MONTHLY_QUOTA'
    );
  }

  get needsDayOfMonth(): boolean {
    return this.patternType === 'MONTHLY_DAY';
  }

  get needsQuota(): boolean {
    return this.patternType === 'MONTHLY_QUOTA';
  }

  get isWeekdayMode(): boolean {
    return this.model.rotationMode === 'WEEKDAY';
  }

  toggleDay(iso: number): void {
    const days = this.model.pattern.daysOfWeek || [];
    this.model.pattern.daysOfWeek = days.includes(iso)
      ? days.filter(d => d !== iso)
      : [...days, iso].sort((a, b) => a - b);
  }

  isDayOn(iso: number): boolean {
    return (this.model.pattern.daysOfWeek || []).includes(iso);
  }

  toggleVariantDay(index: number, iso: number): void {
    const entry = this.model.rotation[index];
    const days = entry.daysOfWeek || [];
    entry.daysOfWeek = days.includes(iso)
      ? days.filter(d => d !== iso)
      : [...days, iso].sort((a, b) => a - b);
  }

  isVariantDayOn(index: number, iso: number): boolean {
    return (this.model.rotation[index].daysOfWeek || []).includes(iso);
  }

  addVariant(): void {
    this.model.rotation = [
      ...this.model.rotation,
      { label: '', daysOfWeek: [], meta: {} },
    ];
  }

  removeVariant(index: number): void {
    this.model.rotation = this.model.rotation.filter((_, i) => i !== index);
    if (this.model.rotationIndex >= this.model.rotation.length) {
      this.model.rotationIndex = 0;
    }
  }

  moveVariant(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this.model.rotation.length) return;
    const next = [...this.model.rotation];
    [next[index], next[target]] = [next[target], next[index]];
    this.model.rotation = next;
  }

  /**
   * Đổi chế độ là thao tác KHÔNG hoàn tác được với một lịch đang chạy, nên
   * cảnh báo trước. Nhãn được giữ lại; chỉ trường riêng của chế độ bị xoá.
   */
  setMode(mode: RotationMode): void {
    if (mode === this.model.rotationMode) return;
    this.model.rotationMode = mode;
    this.modeWarning =
      mode === 'WEEKDAY'
        ? 'Weekday mode: the calendar decides. Give every variant its days — a day with none is a rest day.'
        : 'Cycle mode: variants advance one at a time. Weekday assignments are cleared.';
    if (mode === 'CYCLE') {
      this.model.rotation = this.model.rotation.map(entry => ({
        ...entry,
        daysOfWeek: [],
      }));
    }
    this.model.rotationIndex = 0;
  }

  /** Ngày nào thuộc biến thể nào — ngày trống hiện "nghỉ". */
  get weekStrip(): { label: string; variant: string; isRest: boolean }[] {
    return WEEKDAYS.map(day => {
      const entry = this.model.rotation.find(v =>
        (v.daysOfWeek || []).includes(day.iso)
      );
      return {
        label: day.label,
        variant: entry ? entry.label || '—' : 'nghỉ',
        isRest: !entry,
      };
    });
  }

  /** Câu xem trước bằng tiếng người, tính từ chính pattern đang chọn. */
  get preview(): string {
    const p = this.model.pattern;
    const dayNames = (days: number[]) =>
      WEEKDAYS.filter(d => days.includes(d.iso))
        .map(d => d.label)
        .join(', ');

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

    if (!this.model.rotation.length) return when + '.';

    if (this.isWeekdayMode) {
      const assigned = this.model.rotation
        .map(v => `${dayNames(v.daysOfWeek || [])} ${v.label}`.trim())
        .filter(Boolean)
        .join(', ');
      const restDays = WEEKDAYS.filter(
        d =>
          !this.model.rotation.some(v => (v.daysOfWeek || []).includes(d.iso))
      )
        .map(d => d.label)
        .join(', ');
      return `${when} — ${assigned}.${restDays ? ` Nghỉ ${restDays}.` : ''}`;
    }

    const current = this.model.rotation[this.model.rotationIndex];
    return (
      `${when} — cycling ${this.model.rotation.map(v => v.label).join(' → ')}, ` +
      `advancing ${
        this.model.rotationAdvance === 'ON_DONE'
          ? 'when completed'
          : 'when spawned'
      }. Next: ${current ? current.label : '—'}.`
    );
  }

  get canSave(): boolean {
    if (!this.model.title.trim()) return false;
    if (this.needsDays && !(this.model.pattern.daysOfWeek || []).length) {
      return false;
    }
    if (this.model.rotation.some(v => !v.label.trim())) return false;
    if (
      this.isWeekdayMode &&
      this.model.rotation.some(v => !(v.daysOfWeek || []).length)
    ) {
      return false;
    }
    return true;
  }

  save(): void {
    this.dialogRef.close(this.model);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
