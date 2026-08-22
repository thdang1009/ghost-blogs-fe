import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TodoSoftCap, TodoToday } from '@models/_index';
import { TDTD_STATUS } from '@shared/enum';
import { effectiveWeight, weightMetaOf } from '../todo-weight.util';

/**
 * Focus Bar — thẻ dính đầu màn hình giữ việc quan trọng nhất.
 *
 * Lý do tồn tại: trên màn 360x640, dòng việc đầu tiên của bản cũ bắt đầu ở
 * khoảng y≈520, tức là nằm dưới nếp gấp. Thẻ này bảo đảm việc nặng nhất luôn
 * nhìn thấy mà không phải cuộn, và nó xếp theo weight KỂ CẢ khi danh sách
 * chính đang ở chế độ kéo-thả thủ công (§D2) — nếu nó đi theo thứ tự thủ công
 * thì nó chỉ là dòng đầu danh sách, và cả tính năng mất nghĩa.
 */
@Component({
  selector: 'app-todo-focus-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './todo-focus-bar.component.html',
  styleUrls: ['./todo-focus-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFocusBarComponent {
  /** Đã được server xếp theo weight; component không sắp lại. */
  @Input() focus: TodoToday[] = [];
  @Input() openCount = 0;
  @Input() doneCount = 0;
  @Input() totalCount = 0;
  @Input() softCap: TodoSoftCap | null = null;
  @Input() disabled = false;

  @Output() toggle = new EventEmitter<TodoToday>();
  @Output() openSettings = new EventEmitter<void>();

  readonly TDTD_STATUS = TDTD_STATUS;

  get primary(): TodoToday | null {
    return this.focus[0] || null;
  }

  get others(): TodoToday[] {
    return this.focus.slice(1);
  }

  get hasFocus(): boolean {
    return !!this.primary;
  }

  weightOf(todo: TodoToday): number {
    return effectiveWeight(todo);
  }

  colorOf(todo: TodoToday): string {
    return weightMetaOf(todo).color;
  }

  labelOf(todo: TodoToday): string {
    return weightMetaOf(todo).label;
  }

  isDone(todo: TodoToday): boolean {
    return todo.status === TDTD_STATUS.DONE;
  }

  /**
   * Một dòng ngữ cảnh, không phải một bảng thống kê. Giữ ngắn để thẻ không
   * vượt ngân sách 150px.
   */
  get contextLine(): string {
    const parts: string[] = [];
    if (this.others.length) {
      parts.push(`${this.others.length} more at high weight`);
    }
    parts.push(`${this.openCount} open today`);
    return parts.join(' · ');
  }
}
