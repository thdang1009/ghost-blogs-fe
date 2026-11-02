import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TodoRecurrence } from '@models/_index';
import { AlertService, TodoRecurrenceService } from '@services/_index';
import { recurrencePreview } from '../todo-recurrence-dialog/recurrence.util';
import { editRecurrence } from '../todo-recurrence-dialog/recurrence-editor';

/**
 * "Repeats" — danh sách MỌI lịch lặp, kể cả cái đang tắt.
 *
 * Lý do tồn tại: hộp thoại sửa lịch lặp có sẵn từ slice 7 nhưng không chỗ
 * nào mở nó với một lịch ĐÃ CÓ — "+ Repeat" chỉ tạo mới, chip quick-add chỉ
 * sinh việc. Lịch tập thay đổi mà không có đường nào sửa trên web.
 *
 * Tự nạp dữ liệu và tự mở hộp thoại sửa, để board chỉ phải mở nó ra; đóng
 * lại trả `true` nếu có gì đổi, để board biết mà tải lại.
 */
@Component({
  selector: 'app-todo-repeats-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  templateUrl: './todo-repeats-dialog.component.html',
  styleUrls: ['./todo-repeats-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoRepeatsDialogComponent implements OnInit {
  rows: TodoRecurrence[] = [];
  loading = false;
  busyId: string | null = null;
  private changed = false;

  constructor(
    private dialogRef: MatDialogRef<TodoRepeatsDialogComponent, boolean>,
    private dialog: MatDialog,
    private recurrenceService: TodoRecurrenceService,
    private alertService: AlertService,
    // OnPush: gán trong callback HTTP không đánh dấu bẩn gì cả.
    private cdr: ChangeDetectorRef
  ) {
    // Đóng bằng backdrop / Esc cũng phải báo `changed`, nếu không board không
    // tải lại sau khi vừa sửa xong một lịch.
    dialogRef.backdropClick().subscribe(() => this.close());
    dialogRef
      .keydownEvents()
      .pipe(filter(event => event.key === 'Escape'))
      .subscribe(() => this.close());
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.recurrenceService.list().subscribe({
      next: rows => {
        this.rows = rows;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.alertService.showNoti('Could not load your repeats', 'danger');
      },
    });
  }

  previewOf(rec: TodoRecurrence): string {
    return recurrencePreview(rec);
  }

  trackById(_: number, rec: TodoRecurrence): string | undefined {
    return rec._id;
  }

  /** Không truyền gì = tạo lịch mới. */
  edit(rec?: TodoRecurrence): void {
    editRecurrence(this.dialog, this.recurrenceService, rec).subscribe({
      next: saved => {
        if (!saved) return;
        this.changed = true;
        this.alertService.showNoti('Repeat saved', 'success');
        this.load();
      },
      error: err =>
        this.alertService.showNoti(
          err?.error?.msg || 'Could not save the repeat',
          'danger'
        ),
    });
  }

  toggleActive(rec: TodoRecurrence): void {
    this.run(
      rec,
      this.recurrenceService.update(rec._id!, { active: !rec.active }),
      rec.active ? 'Paused' : 'Resumed'
    );
  }

  /**
   * Xoá MỀM (server chỉ tắt): việc đã sinh vẫn trỏ tới lịch này qua
   * `recurrenceId`. Vì vậy sau khi xoá nó vẫn nằm trong danh sách, ở trạng
   * thái tắt — bật lại được.
   */
  remove(rec: TodoRecurrence): void {
    if (
      !confirm(
        `Delete "${rec.title}"? It stops repeating; tasks it already created stay.`
      )
    ) {
      return;
    }
    this.run(rec, this.recurrenceService.remove(rec._id!), 'Deleted');
  }

  close(): void {
    this.dialogRef.close(this.changed);
  }

  private run(
    rec: TodoRecurrence,
    request: Observable<unknown>,
    message: string
  ): void {
    this.busyId = rec._id || null;
    request.subscribe({
      next: () => {
        this.busyId = null;
        this.changed = true;
        this.alertService.showNoti(message, 'success');
        this.load();
      },
      error: err => {
        this.busyId = null;
        this.cdr.markForCheck();
        this.alertService.showNoti(
          err?.error?.msg || 'Could not update the repeat',
          'danger'
        );
      },
    });
  }
}
