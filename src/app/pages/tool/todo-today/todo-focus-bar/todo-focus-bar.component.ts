import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TodoSoftCap, TodoToday } from '@models/_index';
import { TDTD_STATUS } from '@shared/enum';
import {
  WEIGHT_OPTIONS,
  effectiveWeight,
  weightMetaOf,
} from '../todo-weight.util';

/**
 * Số việc thẻ Focus Bar THỰC SỰ vẽ ra. Ngân sách 150px chỉ đủ cho một thẻ;
 * `focusCount` 2–3 chỉ đổi dòng ngữ cảnh, không vẽ thêm thẻ.
 */
export const FOCUS_BAR_RENDERED = 1;

/** Những việc đang nằm trên thẻ Focus Bar. */
export function focusBarItems(focus: TodoToday[]): TodoToday[] {
  return focus.slice(0, FOCUS_BAR_RENDERED);
}

/**
 * Danh sách dưới Focus Bar.
 *
 * Chỉ bỏ những việc thẻ ĐÃ VẼ. Bản cũ bỏ cả `focus` — nên với `focusCount`
 * = 3, việc số 2 và số 3 không nằm trên thẻ mà cũng không nằm trong danh
 * sách: biến mất khỏi màn hình.
 *
 * Ở chế độ kéo-thả thủ công thì trả ĐỦ: việc trên thẻ có thể nằm giữa danh
 * sách, và bỏ nó đi sẽ làm chỉ số kéo-thả lệch khỏi mảng thật.
 */
export function listBelowFocusBar(
  today: TodoToday[],
  focus: TodoToday[],
  sortByWeight: boolean
): TodoToday[] {
  if (!sortByWeight) return today;
  const shown = new Set(focusBarItems(focus).map(el => el.id));
  return today.filter(el => !shown.has(el.id));
}

/**
 * Focus Bar — thẻ dính đầu màn hình giữ việc quan trọng nhất.
 *
 * Lý do tồn tại: trên màn 360x640, dòng việc đầu tiên của bản cũ bắt đầu ở
 * khoảng y≈520, tức là nằm dưới nếp gấp. Thẻ này bảo đảm việc nặng nhất luôn
 * nhìn thấy mà không phải cuộn, và nó xếp theo weight KỂ CẢ khi danh sách
 * chính đang ở chế độ kéo-thả thủ công (§D2) — nếu nó đi theo thứ tự thủ công
 * thì nó chỉ là dòng đầu danh sách, và cả tính năng mất nghĩa.
 *
 * Việc trên thẻ KHÔNG nằm trong danh sách bên dưới, nên thẻ phải có đủ thao
 * tác của một dòng (sửa, weight, dời, backlog, xoá) — nếu không, muốn xoá việc
 * số 1 thì phải nâng weight việc khác để đẩy nó xuống. Các thao tác nằm sau
 * MỘT nút menu để thẻ không vượt 150px, và phát ĐÚNG các event của
 * `todo-item-row` để cha dùng lại handler cũ.
 */
@Component({
  selector: 'app-todo-focus-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ],
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
  // Cùng tên, cùng payload với todo-item-row.
  @Output() contentChange = new EventEmitter<TodoToday>();
  @Output() weightChange = new EventEmitter<{
    todo: TodoToday;
    weight: number;
  }>();
  @Output() remove = new EventEmitter<TodoToday>();
  @Output() deferTomorrow = new EventEmitter<TodoToday>();
  @Output() sendToBacklog = new EventEmitter<TodoToday>();
  @Output() editRepeat = new EventEmitter<TodoToday>();

  readonly TDTD_STATUS = TDTD_STATUS;
  readonly weightOptions = WEIGHT_OPTIONS;

  editing = false;
  draft = '';

  /**
   * Ô sửa vừa hiện ra thì lấy focus ngay. Đợi một nhịp vì menu vừa đóng cũng
   * đang xử lý focus; trigger đã tắt `restoreFocus`, nếu không menu trả focus
   * về nút `⋮`, textarea bị blur và lưu luôn chuỗi chưa sửa.
   */
  @ViewChild('editBox') set editBox(
    el: ElementRef<HTMLTextAreaElement> | undefined
  ) {
    if (el) setTimeout(() => el.nativeElement.focus());
  }

  get primary(): TodoToday | null {
    return focusBarItems(this.focus)[0] || null;
  }

  get others(): TodoToday[] {
    return this.focus.slice(FOCUS_BAR_RENDERED);
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

  // Sửa tại chỗ thay vì hộp thoại: textarea 2 dòng chiếm đúng chỗ của tiêu
  // đề, nên thẻ không cao thêm.
  startEdit(): void {
    if (!this.primary || this.disabled) return;
    this.draft = this.primary.content || '';
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.draft = '';
  }

  /**
   * Ghi thẳng vào `todo.content` rồi phát event, y như ngModel của dòng việc
   * — cha lưu từ CHÍNH object đó. Xoá trắng thì coi như huỷ: thẻ Focus Bar
   * rỗng chữ là trạng thái không ai muốn.
   */
  commitEdit(): void {
    if (!this.editing) return;
    const todo = this.primary;
    const next = this.draft.trim();
    this.cancelEdit();
    if (!todo || !next || next === (todo.content || '').trim()) return;
    todo.content = next;
    this.contentChange.emit(todo);
  }

  pickWeight(weight: number): void {
    const todo = this.primary;
    if (!todo || weight === this.weightOf(todo)) return;
    this.weightChange.emit({ todo, weight });
  }
}
