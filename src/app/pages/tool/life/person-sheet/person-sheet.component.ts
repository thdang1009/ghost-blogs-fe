import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  CADENCE_PER_LABELS,
  Cadence,
  CadencePer,
  Person,
  PersonDraft,
  PersonMeeting,
  RELATION_TYPES,
  RelationType,
} from '@models/_index';
import { AlertService, PeopleService } from '@services/_index';
import { formatLongDay, ictDateKey, relativeDay } from '../life-date.util';
import {
  cadenceLabel,
  lastMetLabel,
  perYearLabel,
  relationLabel,
  remainingLabel,
} from '../people-format.util';

type Panel = 'none' | 'record' | 'schedule' | 'edit';

interface CadenceForm {
  count: number | null;
  per: CadencePer;
}

interface EditForm {
  name: string;
  relationType: RelationType;
  notes: string;
  cadence: CadenceForm;
  desired: CadenceForm;
  remainingYears: number | null;
}

const toCadenceForm = (c: Cadence | null): CadenceForm => ({
  count: c && c.count !== null ? c.count : null,
  per: (c && c.per) || 'MONTH',
});

/** Ô số để trống = chưa khai báo (null), không phải 0. */
const fromCadenceForm = (f: CadenceForm): Cadence | null =>
  f.count === null || f.count === undefined || (f.count as unknown) === ''
    ? null
    : { count: Number(f.count), per: f.per };

/**
 * Thẻ của MỘT người (ADR 0003).
 *
 * Đây là nơi DUY NHẤT hiển thị "≈ N lần nữa (ước tính)" — không bao giờ trên
 * bảng Todo Today. Con số chỉ hiện khi chủ nhân tự nhập số năm; app không tự
 * giả định. Tần suất tay và tần suất đo được đứng cạnh nhau, vì cả hai đều là
 * ước lượng theo những cách khác nhau.
 *
 * "Hẹn gặp" và "Nhắn tin" tạo việc thường trên Todo Today — không có lịch,
 * không có nhắc nhở.
 */
@Component({
  selector: 'app-person-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './person-sheet.component.html',
  styleUrls: ['./person-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonSheetComponent implements OnChanges {
  private readonly peopleService = inject(PeopleService);
  private readonly alertService = inject(AlertService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() person: Person | null = null;
  @Output() closed = new EventEmitter<void>();
  /** Có gì đổi ở server — trang cha tải lại danh sách. */
  @Output() changed = new EventEmitter<void>();

  readonly relations = RELATION_TYPES;
  readonly perOptions = (Object.keys(CADENCE_PER_LABELS) as CadencePer[]).map(
    value => ({ value, label: CADENCE_PER_LABELS[value] })
  );
  readonly today = ictDateKey();

  readonly relationLabel = relationLabel;
  readonly cadenceLabel = cadenceLabel;
  readonly perYearLabel = perYearLabel;
  readonly lastMetLabel = lastMetLabel;
  readonly remainingLabel = remainingLabel;
  readonly relativeDay = relativeDay;
  readonly formatLongDay = formatLongDay;

  meetings: PersonMeeting[] = [];
  meetingsLoading = false;
  meetingsError = false;
  busy = false;
  panel: Panel = 'none';

  record = {
    date: ictDateKey(),
    durationMinutes: null as number | null,
    note: '',
  };
  scheduleDate = ictDateKey();
  edit: EditForm | null = null;

  editingMeetingId: string | null = null;
  meetingDraft = { date: '', note: '' };

  ngOnChanges(changes: SimpleChanges): void {
    const prev = changes['person']?.previousValue as Person | null;
    // Đổi sang người khác (hoặc mở lần đầu) thì làm mới mọi thứ; cùng người
    // được tải lại sau một thao tác thì giữ nguyên panel đang mở.
    if (this.person && (!prev || prev._id !== this.person._id)) {
      this.panel = 'none';
      this.editingMeetingId = null;
      this.loadMeetings();
    }
  }

  // ==========================================================================
  // Tải
  // ==========================================================================

  loadMeetings(): void {
    if (!this.person) return;
    this.meetingsLoading = true;
    this.meetingsError = false;
    this.peopleService.meetings(this.person._id).subscribe({
      next: rows => {
        this.meetings = rows;
        this.meetingsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.meetingsLoading = false;
        this.meetingsError = true;
        this.cdr.markForCheck();
      },
    });
  }

  /** Sau mỗi thao tác ghi: lấy lại người này + lần gặp, báo trang cha. */
  private refresh(message?: string): void {
    this.busy = false;
    if (message) this.alertService.showNoti(message, 'success');
    this.changed.emit();
    this.loadMeetings();
    this.cdr.markForCheck();
  }

  private failed(fallback: string) {
    return (err: { error?: { msg?: string } }) => {
      this.busy = false;
      this.cdr.markForCheck();
      this.alertService.showNoti(err?.error?.msg || fallback, 'danger');
    };
  }

  // ==========================================================================
  // Hiển thị
  // ==========================================================================

  get desiredLabel(): string {
    return this.person ? cadenceLabel(this.person.desiredCadence) : '';
  }

  get basisLabel(): string {
    const p = this.person;
    if (!p) return '';
    if (p.stats.estimateBasis === 'MANUAL') {
      return `${cadenceLabel(p.cadence)} × ${p.remainingYears} năm`;
    }
    if (p.stats.estimateBasis === 'ACTUAL' && p.stats.actual) {
      return `${perYearLabel(p.stats.actual.perYear)} (đo được) × ${p.remainingYears} năm`;
    }
    return '';
  }

  trackById(_: number, m: PersonMeeting): string {
    return m._id;
  }

  toggle(panel: Panel): void {
    this.panel = this.panel === panel ? 'none' : panel;
    if (this.panel === 'record') {
      this.record = { date: this.today, durationMinutes: null, note: '' };
    }
    if (this.panel === 'schedule') this.scheduleDate = this.today;
    if (this.panel === 'edit' && this.person) {
      this.edit = {
        name: this.person.name,
        relationType: this.person.relationType,
        notes: this.person.notes || '',
        cadence: toCadenceForm(this.person.cadence),
        desired: toCadenceForm(this.person.desiredCadence),
        remainingYears: this.person.remainingYears,
      };
    }
  }

  // ==========================================================================
  // Hành động nhanh
  // ==========================================================================

  saveRecord(): void {
    if (!this.person) return;
    this.busy = true;
    this.peopleService
      .recordMeeting(this.person._id, {
        date: this.record.date || this.today,
        durationMinutes: this.record.durationMinutes,
        note: this.record.note,
      })
      .subscribe({
        next: () => {
          this.panel = 'none';
          this.refresh('Đã ghi lần gặp');
        },
        error: this.failed('Không ghi được lần gặp'),
      });
  }

  saveSchedule(): void {
    if (!this.person) return;
    const date = this.scheduleDate || this.today;
    this.busy = true;
    this.peopleService.schedule(this.person._id, date).subscribe({
      next: res => {
        this.panel = 'none';
        this.refresh(
          res.created
            ? `Đã thêm vào Todo Today: ${relativeDay(date)}`
            : 'Ngày đó đã có hẹn rồi'
        );
      },
      error: this.failed('Không hẹn được'),
    });
  }

  contact(): void {
    if (!this.person) return;
    this.busy = true;
    this.peopleService.contact(this.person._id).subscribe({
      next: () => this.refresh('Đã thêm "📞 Nhắn" vào Todo Today hôm nay'),
      error: this.failed('Không tạo được việc'),
    });
  }

  saveEdit(): void {
    if (!this.person || !this.edit) return;
    const name = (this.edit.name || '').trim();
    if (!name) {
      this.alertService.showNoti('Cần một cái tên', 'warning');
      return;
    }
    const years = this.edit.remainingYears;
    const body: PersonDraft = {
      name,
      relationType: this.edit.relationType,
      notes: this.edit.notes,
      cadence: fromCadenceForm(this.edit.cadence),
      desiredCadence: fromCadenceForm(this.edit.desired),
      remainingYears:
        years === null || years === undefined || (years as unknown) === ''
          ? null
          : Number(years),
    };
    this.busy = true;
    this.peopleService.update(this.person._id, body).subscribe({
      next: () => {
        this.panel = 'none';
        this.refresh('Đã lưu');
      },
      error: this.failed('Không lưu được'),
    });
  }

  // ==========================================================================
  // Lịch sử gặp
  // ==========================================================================

  startEditMeeting(m: PersonMeeting): void {
    this.editingMeetingId = m._id;
    this.meetingDraft = { date: ictDateKey(m.date), note: m.note || '' };
  }

  saveMeeting(m: PersonMeeting): void {
    this.busy = true;
    this.peopleService.updateMeeting(m._id, this.meetingDraft).subscribe({
      next: () => {
        this.editingMeetingId = null;
        this.refresh();
      },
      error: this.failed('Không lưu được'),
    });
  }

  deleteMeeting(m: PersonMeeting): void {
    if (!confirm(`Xoá lần gặp ngày ${formatLongDay(m.date)}?`)) return;
    this.busy = true;
    this.peopleService.deleteMeeting(m._id).subscribe({
      next: () => this.refresh('Đã xoá lần gặp'),
      error: this.failed('Không xoá được'),
    });
  }

  // ==========================================================================
  // Lưu trữ / xoá
  // ==========================================================================

  toggleArchive(): void {
    if (!this.person) return;
    const archived = !this.person.archived;
    this.busy = true;
    this.peopleService.archive(this.person._id, archived).subscribe({
      next: () => {
        this.refresh(archived ? 'Đã lưu trữ' : 'Đã khôi phục');
        this.closed.emit();
      },
      error: this.failed('Không cập nhật được'),
    });
  }

  removeForever(): void {
    const p = this.person;
    if (!p) return;
    // Hai bước có chủ ý: lưu trữ là lựa chọn mặc định, xoá hẳn mất cả lịch sử.
    if (
      !confirm(
        `Xoá hẳn "${p.name}" cùng ${this.meetings.length} lần gặp? Không hoàn tác được.\n\nMuốn giữ lịch sử thì chọn "Lưu trữ".`
      )
    ) {
      return;
    }
    this.busy = true;
    this.peopleService.removeForever(p._id).subscribe({
      next: () => {
        this.refresh('Đã xoá');
        this.closed.emit();
      },
      error: this.failed('Không xoá được'),
    });
  }
}
