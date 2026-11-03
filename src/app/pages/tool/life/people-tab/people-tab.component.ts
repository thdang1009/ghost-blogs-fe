import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  PeopleDashboard,
  Person,
  RELATION_TYPES,
  RelationType,
} from '@models/_index';
import { AlertService, PeopleService } from '@services/_index';
import { PersonSheetComponent } from '../person-sheet/person-sheet.component';
import { relativeDay } from '../life-date.util';
import { lastMetLabel, relationLabel } from '../people-format.util';

/**
 * Tab "Người quan trọng" (ADR 0003).
 *
 * Hai nhóm: có hẹn / chưa có hẹn. Thứ tự do server quyết theo mức "làm được
 * gì ngay" — quá nhịp của CHÍNH người đó nhiều nhất lên trước — và KHÔNG BAO
 * GIỜ theo `priority`. Chữ trung tính: "Chưa có hẹn", không đỏ, không đếm
 * ngược. Số lần gặp còn lại chỉ có trong thẻ của từng người.
 */
@Component({
  selector: 'app-people-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, PersonSheetComponent],
  templateUrl: './people-tab.component.html',
  styleUrls: ['./people-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleTabComponent implements OnInit {
  private readonly peopleService = inject(PeopleService);
  private readonly alertService = inject(AlertService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly relations = RELATION_TYPES;
  readonly relationLabel = relationLabel;
  readonly lastMetLabel = lastMetLabel;
  readonly relativeDay = relativeDay;

  dashboard: PeopleDashboard | null = null;
  loading = false;
  loadError = false;

  archived: Person[] | null = null;
  showArchived = false;

  formOpen = false;
  draft: { name: string; relationType: RelationType } = {
    name: '',
    relationType: 'family',
  };
  saving = false;

  selected: Person | null = null;

  ngOnInit(): void {
    this.load();
  }

  get withPlan(): Person[] {
    return (this.dashboard?.people || []).filter(p => p.stats.hasPlan);
  }

  get withoutPlan(): Person[] {
    return this.dashboard?.noPlan || [];
  }

  trackById(_: number, p: Person): string {
    return p._id;
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.cdr.markForCheck();
    this.peopleService.dashboard().subscribe({
      next: dashboard => {
        this.dashboard = dashboard;
        this.loading = false;
        // Thẻ đang mở thì thay bằng bản mới nhất của chính người đó.
        if (this.selected) {
          this.selected =
            dashboard.people.find(p => p._id === this.selected!._id) ||
            (this.archived || []).find(p => p._id === this.selected!._id) ||
            this.selected;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.cdr.markForCheck();
      },
    });
    if (this.showArchived) this.loadArchived();
  }

  loadArchived(): void {
    this.peopleService.list(true).subscribe({
      next: rows => {
        this.archived = rows;
        if (this.selected?.archived) {
          this.selected =
            rows.find(p => p._id === this.selected!._id) || this.selected;
        }
        this.cdr.markForCheck();
      },
      error: () =>
        this.alertService.showNoti(
          'Không tải được danh sách lưu trữ',
          'danger'
        ),
    });
  }

  toggleArchived(): void {
    this.showArchived = !this.showArchived;
    if (this.showArchived && !this.archived) this.loadArchived();
  }

  open(person: Person): void {
    this.selected = person;
  }

  closeSheet(): void {
    this.selected = null;
    this.cdr.markForCheck();
  }

  onSheetChanged(): void {
    this.load();
  }

  startAdd(): void {
    this.draft = { name: '', relationType: 'family' };
    this.formOpen = true;
  }

  save(): void {
    const name = (this.draft.name || '').trim();
    if (!name) {
      this.alertService.showNoti('Cần một cái tên', 'warning');
      return;
    }
    this.saving = true;
    this.peopleService
      .create({ name, relationType: this.draft.relationType })
      .subscribe({
        next: person => {
          this.saving = false;
          this.formOpen = false;
          // Mở luôn thẻ: việc tiếp theo hầu như luôn là đặt nhịp / ghi lần gặp.
          this.selected = person;
          this.load();
        },
        error: (err: { error?: { msg?: string } }) => {
          this.saving = false;
          this.cdr.markForCheck();
          this.alertService.showNoti(
            err?.error?.msg || 'Không lưu được',
            'danger'
          );
        },
      });
  }
}
