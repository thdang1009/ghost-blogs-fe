import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TodoToday } from '@models/_index';
import { TDTD_STATUS } from '@shared/enum';
import {
  TodoWeightMeta,
  WEIGHT_OPTIONS,
  effectiveWeight,
  weightMetaOf,
} from '../todo-weight.util';

/**
 * Một dòng việc.
 *
 * Cùng một component render cho cả điện thoại lẫn desktop — CSS quyết định
 * hình dạng, không phải hai template song song. Hai bản sao của cùng một dòng
 * là cách chắc chắn nhất để bản mobile lặng lẽ thiếu mất một nút.
 */
@Component({
  selector: 'app-todo-item-row',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutosizeModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    DragDropModule,
  ],
  templateUrl: './todo-item-row.component.html',
  styleUrls: ['./todo-item-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemRowComponent {
  @Input({ required: true }) todo!: TodoToday;
  @Input() disabled = false;
  /** Kéo-thả chỉ bật ở desktop; trên cảm ứng nó là thao tác phụ (§10.2). */
  @Input() draggable = true;

  @Output() toggle = new EventEmitter<TodoToday>();
  @Output() contentChange = new EventEmitter<TodoToday>();
  @Output() weightChange = new EventEmitter<{
    todo: TodoToday;
    weight: number;
  }>();
  @Output() remove = new EventEmitter<TodoToday>();
  @Output() deferTomorrow = new EventEmitter<TodoToday>();
  @Output() sendToBacklog = new EventEmitter<TodoToday>();

  readonly TDTD_STATUS = TDTD_STATUS;
  readonly weightOptions = WEIGHT_OPTIONS;

  get weight(): number {
    return effectiveWeight(this.todo);
  }

  get weightMeta(): TodoWeightMeta {
    return weightMetaOf(this.todo);
  }

  get isDone(): boolean {
    return this.todo.status === TDTD_STATUS.DONE;
  }

  /** Biến thể hôm nay (buổi tập / cuốn sách), hiện thành nhãn phụ nếu có. */
  get variantLabel(): string {
    return (this.todo.meta && (this.todo.meta as any).variantLabel) || '';
  }

  get isRecurring(): boolean {
    return !!this.todo.recurrenceId;
  }

  onToggle(): void {
    if (this.disabled) return;
    this.toggle.emit(this.todo);
  }

  onContentBlur(): void {
    this.contentChange.emit(this.todo);
  }

  pickWeight(weight: number): void {
    if (weight === this.weight) return;
    this.weightChange.emit({ todo: this.todo, weight });
  }

  bumpWeight(delta: number): void {
    const next = Math.min(5, Math.max(1, this.weight + delta));
    this.pickWeight(next);
  }
}
