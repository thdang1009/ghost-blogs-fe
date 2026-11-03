import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NoveltyAgain, NoveltyReflection } from '@models/_index';

const EMPTY: NoveltyReflection = {
  wasNew: null,
  feeling: '',
  again: null,
  note: '',
};

/**
 * Suy ngẫm sau một trải nghiệm (ADR 0003). TUỲ CHỌN hoàn toàn: bốn ô, ô nào
 * cũng bỏ trống được, và "Bỏ qua" đóng sheet mà không gửi gì. Việc đã được
 * tick xong TRƯỚC khi sheet này mở — nó không bao giờ chặn việc tick.
 *
 * Dùng chung cho trang Life và cho bảng Todo Today.
 */
@Component({
  selector: 'app-novelty-reflection-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './novelty-reflection-sheet.component.html',
  styleUrls: ['./novelty-reflection-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoveltyReflectionSheetComponent implements OnChanges {
  @Input() open = false;
  @Input() title = '';
  @Input() reflection: NoveltyReflection | null = null;
  @Input() busy = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<NoveltyReflection>();

  draft: NoveltyReflection = { ...EMPTY };

  readonly feelings = [
    '😊 Vui',
    '😌 Thư thái',
    '🤩 Hào hứng',
    '😐 Bình thường',
    '😬 Hơi ngại',
  ];
  readonly againOptions: { value: NoveltyAgain; label: string }[] = [
    { value: 'YES', label: 'Có' },
    { value: 'MAYBE', label: 'Có thể' },
    { value: 'NO', label: 'Không' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    // Mỗi lần mở là một bản nháp mới từ dữ liệu hiện có — không mang nháp
    // của trải nghiệm trước sang.
    if (changes['open'] && this.open) {
      this.draft = { ...EMPTY, ...(this.reflection || {}) };
    }
  }

  setWasNew(value: boolean): void {
    this.draft.wasNew = this.draft.wasNew === value ? null : value;
  }

  setAgain(value: NoveltyAgain): void {
    this.draft.again = this.draft.again === value ? null : value;
  }

  setFeeling(value: string): void {
    this.draft.feeling = this.draft.feeling === value ? '' : value;
  }

  save(): void {
    this.saved.emit({
      ...this.draft,
      feeling: (this.draft.feeling || '').trim(),
      note: (this.draft.note || '').trim(),
    });
  }
}
