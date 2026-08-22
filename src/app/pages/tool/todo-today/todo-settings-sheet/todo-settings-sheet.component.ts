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
import { UserTodoSettings } from '@models/_index';

export interface TodoRewardSettings {
  rewardFrom: number;
  rewardTo: number;
  rewardMultiplier: number;
}

/**
 * Bảng cài đặt trượt lên từ đáy.
 *
 * Đây là nơi SÁU ô số, nút mic và cụm reward chuyển tới. Ở bản cũ chúng nằm
 * ngay trên đầu thẻ và đẩy dòng việc đầu tiên xuống khoảng y≈520 trên màn
 * 360x640 — tức là chủ nhân phải cuộn để nhìn thấy việc quan trọng nhất của
 * ngày. Chúng vẫn ở đây đầy đủ, chỉ là sau một nút `⋯` (§10.2).
 */
@Component({
  selector: 'app-todo-settings-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './todo-settings-sheet.component.html',
  styleUrls: ['./todo-settings-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoSettingsSheetComponent {
  @Input() open = false;
  @Input({ required: true }) settings!: UserTodoSettings;
  @Input({ required: true }) rewardSettings!: TodoRewardSettings;
  @Input() isListening = false;
  @Input() voiceSupported = true;

  @Output() closed = new EventEmitter<void>();
  @Output() settingsChange = new EventEmitter<UserTodoSettings>();
  @Output() rewardSettingsChange = new EventEmitter<TodoRewardSettings>();
  @Output() toggleVoice = new EventEmitter<void>();
  @Output() generateReward = new EventEmitter<void>();

  onSettingsChange(): void {
    this.settingsChange.emit(this.settings);
  }

  onRewardChange(): void {
    this.rewardSettingsChange.emit(this.rewardSettings);
  }

  close(): void {
    this.closed.emit();
  }
}
