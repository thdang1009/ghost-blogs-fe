import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReadingHabit, ReadingHabitEntry } from '@models/_index';
import { scheduleLabel } from '../../todo-today/todo-recurrence-dialog/recurrence.util';

/**
 * Panel "Reading habit" trên đầu Reading List.
 *
 * Lý do tồn tại: việc "📖 Read" hằng ngày được quyết định hoàn toàn ở server
 * (một TodoRecurrence READING, vòng xoay dựng từ các cuốn đang đọc) và trước
 * đây không hiện ở đâu cả — không thấy cuốn nào kế tiếp, không sửa được lịch.
 * Panel này nói cách nó chạy bằng một câu, rồi cho xem và đổi đúng những thứ
 * đó. Chỉ hiển thị; mọi lời gọi server nằm ở ReadingListComponent.
 */
@Component({
  selector: 'app-reading-habit-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './reading-habit-panel.component.html',
  styleUrls: ['./reading-habit-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingHabitPanelComponent {
  @Input() habit: ReadingHabit | null = null;
  @Input() busy = false;

  @Output() create = new EventEmitter<void>();
  @Output() editSchedule = new EventEmitter<void>();
  @Output() toggleActive = new EventEmitter<void>();
  @Output() setNext = new EventEmitter<ReadingHabitEntry>();
  @Output() move = new EventEmitter<{
    entry: ReadingHabitEntry;
    delta: number;
  }>();

  get recurrence() {
    return this.habit?.recurrence || null;
  }

  get active(): boolean {
    return !!this.recurrence?.active;
  }

  get schedule(): string {
    return this.recurrence ? scheduleLabel(this.recurrence.pattern) : '';
  }

  /** Số phút một buổi — đúng con số được cộng vào cuốn sách khi tick. */
  get targetMinutes(): number | null {
    const value = this.recurrence?.meta?.['targetMinutes'];
    return typeof value === 'number' ? value : null;
  }

  get nextTitle(): string {
    const habit = this.habit;
    if (!habit || habit.nextIndex === null) return '';
    const entry = habit.rotation[habit.nextIndex];
    return entry?.book?.title || entry?.label || '';
  }

  isNext(entry: ReadingHabitEntry): boolean {
    return this.habit?.nextIndex === entry.index;
  }

  trackByIndex(_: number, entry: ReadingHabitEntry): string {
    return entry.readingBookId || String(entry.index);
  }
}
