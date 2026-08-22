import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { TodoToday } from '@models/_index';
import { TodoItemRowComponent } from '../todo-item-row/todo-item-row.component';

/**
 * Danh sách việc.
 *
 * Thay `<table>` trong `.table-responsive` bằng `<ul>`: bọc bảng trong
 * `.table-responsive` sinh cuộn NGANG trên điện thoại, và đó chính là lỗi mà
 * slice này sinh ra để sửa. Cùng một component dòng render cho mọi bề rộng;
 * chỉ CSS đổi.
 */
@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatIconModule, TodoItemRowComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent {
  @Input() items: TodoToday[] = [];
  @Input() disabled = false;
  @Input() emptyText = 'Nothing here';
  /** Tắt khi đang sắp theo weight — kéo-thả lúc đó không đổi được thứ tự. */
  @Input() reorderable = true;

  @Output() toggle = new EventEmitter<TodoToday>();
  @Output() contentChange = new EventEmitter<TodoToday>();
  @Output() weightChange = new EventEmitter<{
    todo: TodoToday;
    weight: number;
  }>();
  @Output() remove = new EventEmitter<TodoToday>();
  @Output() deferTomorrow = new EventEmitter<TodoToday>();
  @Output() sendToBacklog = new EventEmitter<TodoToday>();
  @Output() reorder = new EventEmitter<CdkDragDrop<TodoToday[]>>();

  trackById(_: number, todo: TodoToday): number | undefined {
    return todo.id;
  }

  onDrop(event: CdkDragDrop<TodoToday[]>): void {
    if (!this.reorderable) return;
    this.reorder.emit(event);
  }
}
