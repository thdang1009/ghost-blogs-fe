import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TodoRecurrence } from '@models/_index';
import { TodoRecurrenceService } from '@services/_index';
import { TodoRecurrenceDialogComponent } from './todo-recurrence-dialog.component';

/**
 * Mở hộp thoại sửa lịch lặp rồi LƯU (tạo hoặc sửa theo `_id`).
 *
 * Một chỗ duy nhất cho "mở rồi lưu", vì có ba nơi gọi: board Todo Today,
 * danh sách Repeats, và panel thói quen đọc trên Reading List. Phát `null`
 * khi người dùng huỷ; lỗi để nổi lên cho nơi gọi tự báo (ADR 0002 §D9) —
 * server đặt tên trường trong `err.error.msg` để hiện thẳng ra.
 */
export function editRecurrence(
  dialog: MatDialog,
  service: TodoRecurrenceService,
  recurrence?: TodoRecurrence
): Observable<TodoRecurrence | null> {
  return dialog
    .open(TodoRecurrenceDialogComponent, {
      data: { recurrence },
      width: '560px',
      maxWidth: '100vw',
      panelClass: 'todo-sheet-dialog',
    })
    .afterClosed()
    .pipe(
      switchMap((result?: TodoRecurrence | null) => {
        if (!result) return of(null);
        return result._id
          ? service.update(result._id, result)
          : service.create(result);
      })
    );
}
