import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TodoToday, TriageAction, TriageDecision } from '@models/_index';
import { effectiveWeight, weightMetaOf } from '../todo-weight.util';

/**
 * Bảng phân loại cuối ngày (§10.5).
 *
 * Đây là PROMPT, không phải khoá: đóng được, mỗi ngày chỉ hỏi một lần, và
 * không có gì bắt buộc phải quyết. Việc nào không đụng tới sẽ nhận hành động
 * mặc định khi bấm nút ở chân bảng.
 *
 * "→ Ngày mai" là mặc định vì đó là lựa chọn ít hối tiếc nhất: nó không xoá
 * gì, không giấu gì, và cron 22:30 dù sao cũng sẽ làm đúng thế nếu chủ nhân
 * bỏ qua bảng này.
 */
@Component({
  selector: 'app-todo-triage-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './todo-triage-sheet.component.html',
  styleUrls: ['./todo-triage-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoTriageSheetComponent {
  @Input() open = false;
  @Input() items: TodoToday[] = [];
  @Input() date = '';
  /** 'LEFTOVERS' khi mở vì có việc quá hạn, 'END_OF_DAY' khi tới giờ. */
  @Input() mode: 'LEFTOVERS' | 'END_OF_DAY' = 'END_OF_DAY';
  @Input() busy = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<TriageDecision[]>();

  /** id -> hành động đã chọn. Không có trong map = chưa đụng tới. */
  chosen: Record<number, TriageAction> = {};
  datePick: Record<number, string> = {};

  readonly actions: { value: TriageAction; icon: string; label: string }[] = [
    { value: 'DONE', icon: 'check_circle', label: 'Done' },
    { value: 'DEFER_TOMORROW', icon: 'east', label: 'Tomorrow' },
    { value: 'DEFER_DATE', icon: 'event', label: 'Date' },
    { value: 'BACKLOG', icon: 'inbox', label: 'Backlog' },
    { value: 'DEMOTE', icon: 'south', label: 'Lower' },
    { value: 'DELETE', icon: 'delete', label: 'Delete' },
    { value: 'SKIP', icon: 'schedule', label: 'Skip' },
  ];

  get title(): string {
    return this.mode === 'LEFTOVERS' ? 'Leftovers' : 'End of day';
  }

  get subtitle(): string {
    return this.mode === 'LEFTOVERS'
      ? 'These are still open from earlier days.'
      : 'Anything you do not touch gets moved to tomorrow.';
  }

  trackById(_: number, todo: TodoToday): number | undefined {
    return todo.id;
  }

  weightOf(todo: TodoToday): number {
    return effectiveWeight(todo);
  }

  colorOf(todo: TodoToday): string {
    return weightMetaOf(todo).color;
  }

  pick(todo: TodoToday, action: TriageAction): void {
    // Bấm lại chính hành động đang chọn = bỏ chọn, quay về mặc định.
    if (this.chosen[todo.id!] === action) {
      delete this.chosen[todo.id!];
      return;
    }
    this.chosen[todo.id!] = action;
  }

  isPicked(todo: TodoToday, action: TriageAction): boolean {
    return this.chosen[todo.id!] === action;
  }

  get touchedCount(): number {
    return Object.keys(this.chosen).length;
  }

  /** Chỉ gửi những dòng ĐÃ chọn. */
  applyChosen(): void {
    this.submitted.emit(this.buildDecisions(false));
  }

  /** Gửi tất cả: dòng chưa đụng tới nhận mặc định "→ Ngày mai". */
  applyAll(): void {
    this.submitted.emit(this.buildDecisions(true));
  }

  private buildDecisions(includeUntouched: boolean): TriageDecision[] {
    const decisions: TriageDecision[] = [];
    for (const todo of this.items) {
      const action = this.chosen[todo.id!];
      if (!action && !includeUntouched) continue;
      const resolved: TriageAction = action || 'DEFER_TOMORROW';
      const decision: TriageDecision = { id: todo.id!, action: resolved };
      if (resolved === 'DEFER_DATE') {
        const date = this.datePick[todo.id!];
        // Không có ngày thì hạ về "ngày mai" thay vì gửi lên để server từ
        // chối — bảng này không nên trả lỗi cho một ô người dùng bỏ trống.
        if (!date) decision.action = 'DEFER_TOMORROW';
        else decision.payload = { date };
      }
      decisions.push(decision);
    }
    return decisions;
  }

  reset(): void {
    this.chosen = {};
    this.datePick = {};
  }
}
