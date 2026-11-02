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
  RecurrenceVariant,
  RotationMode,
  TodoRecurrence,
  TodoWorkoutExercise,
} from '@models/_index';
import {
  WEEKDAYS,
  dayNames,
  recurrencePreview,
  weekdayUnion,
} from './recurrence.util';

function copyVariantMeta(
  entry: RecurrenceVariant
): Record<string, unknown> | undefined {
  if (!entry.meta) return entry.meta;
  const meta: Record<string, unknown> = { ...entry.meta };
  if (Array.isArray(meta['exercises'])) {
    meta['exercises'] = (meta['exercises'] as TodoWorkoutExercise[]).map(
      ex => ({ ...ex })
    );
  }
  return meta;
}

/** Bỏ dòng bài tập chưa có tên — một dòng trống trên thẻ tập là nhiễu. */
function cleanExercises(entry: RecurrenceVariant): RecurrenceVariant {
  const list = entry.meta?.['exercises'];
  if (!Array.isArray(list)) return entry;
  return {
    ...entry,
    meta: {
      ...entry.meta,
      exercises: (list as TodoWorkoutExercise[])
        .map(ex => ({ ...ex, name: (ex.name || '').trim() }))
        .filter(ex => ex.name),
    },
  };
}

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
 *
 * Ở chế độ "Theo thứ", các thứ của lịch KHÔNG chọn riêng nữa: chúng là hợp
 * các thứ của biến thể (server cũng tự suy ra như vậy). Hai nơi chọn thứ cho
 * cùng một lịch là cách chắc chắn để một buổi tập lặng lẽ biến mất.
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
    // Chép SÂU tới từng bài tập: object truyền vào là bản đang hiện trên màn
    // hình gọi; sửa nông rồi bấm Huỷ thì bản đó vẫn bị đổi.
    this.model = {
      ...new TodoRecurrence(),
      ...(source || {}),
      pattern: { type: 'DAILY', ...(source?.pattern || {}) },
      rotation: (source?.rotation || []).map(entry => ({
        ...entry,
        daysOfWeek: [...(entry.daysOfWeek || [])],
        meta: copyVariantMeta(entry),
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

  /** Thứ của lịch ở chế độ "Theo thứ" — chỉ đọc, suy từ biến thể. */
  get derivedDaysLabel(): string {
    return dayNames(weekdayUnion(this.model.rotation)) || '(no day yet)';
  }

  /**
   * Thói quen đọc: vòng xoay do Reading List dựng lại từ các cuốn đang đọc
   * mỗi khi sách đổi. Sửa tay ở đây sẽ bị lần dựng kế tiếp ghi đè trong im
   * lặng, nên danh sách chỉ đọc và KHÔNG được gửi lên khi lưu.
   */
  get isReading(): boolean {
    return this.model.meta?.['kind'] === 'READING';
  }

  /**
   * Bài tập sửa được ở mọi biến thể, trừ vòng đọc sách — ở đó biến thể là
   * một cuốn sách, không phải một buổi tập.
   */
  get showsExercises(): boolean {
    return !this.isReading;
  }

  /** Số phút một buổi đọc — con số được cộng vào cuốn sách khi tick. */
  get targetMinutes(): number | null {
    const value = this.model.meta?.['targetMinutes'];
    return typeof value === 'number' ? value : null;
  }

  set targetMinutes(value: number | null) {
    // Object MỚI: `model.meta` vẫn đang trỏ vào meta của recurrence gốc.
    const minutes = Number(value);
    this.model.meta = {
      ...(this.model.meta || {}),
      targetMinutes:
        value === null || !Number.isFinite(minutes) || minutes <= 0
          ? undefined
          : minutes,
    };
  }

  exercisesOf(variant: RecurrenceVariant): TodoWorkoutExercise[] {
    const list = variant.meta?.['exercises'];
    return Array.isArray(list) ? (list as TodoWorkoutExercise[]) : [];
  }

  addExercise(variant: RecurrenceVariant): void {
    // Chỉ chạm vào `exercises`; mọi khoá meta khác (targetMinutes…) giữ y.
    variant.meta = {
      ...(variant.meta || {}),
      exercises: [
        ...this.exercisesOf(variant),
        { name: '', sets: 3, reps: '' },
      ],
    };
  }

  removeExercise(variant: RecurrenceVariant, index: number): void {
    variant.meta = {
      ...(variant.meta || {}),
      exercises: this.exercisesOf(variant).filter((_, i) => i !== index),
    };
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

  /** Câu xem trước bằng tiếng người, tính từ chính lịch đang sửa. */
  get preview(): string {
    return recurrencePreview(this.model);
  }

  get canSave(): boolean {
    if (!this.model.title.trim()) return false;
    if (this.model.rotation.some(v => !v.label.trim())) return false;
    if (this.isWeekdayMode) {
      // Lịch "Theo thứ" chạy đúng các thứ của biến thể: không biến thể nào
      // thì không bao giờ chạy, và biến thể không có thứ là biến thể chết.
      return (
        this.model.rotation.length > 0 &&
        this.model.rotation.every(v => (v.daysOfWeek || []).length)
      );
    }
    if (this.needsDays && !(this.model.pattern.daysOfWeek || []).length) {
      return false;
    }
    return true;
  }

  save(): void {
    const result: TodoRecurrence = {
      ...this.model,
      rotation: this.model.rotation.map(cleanExercises),
    };
    if (this.isWeekdayMode) {
      result.pattern = {
        type: 'DAYS_OF_WEEK',
        daysOfWeek: weekdayUnion(this.model.rotation),
      };
    }
    if (this.isReading) {
      // Không gửi `rotation`: server giữ nguyên bản Reading List đã dựng. Bản
      // trong hộp thoại có thể đã cũ (một buổi đọc vừa ghi bookmark chẳng hạn).
      delete (result as Partial<TodoRecurrence>).rotation;
    }
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
