import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import {
  NOVELTY_CATEGORIES,
  NoveltyDraft,
  NoveltyDuplicateCheck,
  NoveltyExperience,
  NoveltyReflection,
  NoveltySuggestion,
  NoveltySummary,
  NoveltyWeek,
} from '@models/_index';
import { AlertService, NoveltyService } from '@services/_index';
import { NoveltyReflectionSheetComponent } from '../novelty-reflection-sheet/novelty-reflection-sheet.component';
import {
  formatDay,
  formatLongDay,
  ictDateKey,
  relativeDay,
} from '../life-date.util';

interface NoveltyForm {
  title: string;
  category: string;
  alreadyDone: boolean;
  doneDate: string;
}

const emptyForm = (): NoveltyForm => ({
  title: '',
  category: 'other',
  alreadyDone: false,
  doneDate: ictDateKey(),
});

/**
 * Tab "Trải nghiệm mới" (ADR 0003).
 *
 * Trơn có chủ ý: tuần này 0/1, dải 8 tuần, chuỗi — không điểm, không huy
 * hiệu, không màu đỏ. Tuần chưa xong chỉ là chưa xong.
 *
 * "Lên lịch" = một việc thường trên bảng Todo Today; tick việc đó là xong.
 * Ngày dự định luôn đọc lại từ server (từ việc đang mở), nên dời việc trên
 * bảng thì trang này tự đúng theo.
 */
@Component({
  selector: 'app-novelty-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NoveltyReflectionSheetComponent,
  ],
  templateUrl: './novelty-tab.component.html',
  styleUrls: ['./novelty-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoveltyTabComponent implements OnInit {
  private readonly noveltyService = inject(NoveltyService);
  private readonly alertService = inject(AlertService);
  // OnPush: gán thuộc tính trong callback HTTP không đánh dấu bẩn — xem
  // reading-list.component.spec.ts về lỗi "dữ liệu về mà màn hình trống".
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = NOVELTY_CATEGORIES;

  summary: NoveltySummary | null = null;
  experiences: NoveltyExperience[] = [];
  suggestions: NoveltySuggestion[] = [];
  loading = false;
  loadError = false;
  busyId: string | null = null;

  formOpen = false;
  editingId: string | null = null;
  form: NoveltyForm = emptyForm();
  duplicate: NoveltyDuplicateCheck | null = null;
  saving = false;
  showDropped = false;

  /** id -> 'YYYY-MM-DD' đang chọn trong ô ngày của từng ý tưởng. */
  planDate: Record<string, string> = {};

  reflectionFor: NoveltyExperience | null = null;
  reflectionBusy = false;

  private readonly titleChanges = new Subject<string>();

  readonly today = ictDateKey();
  readonly formatDay = formatDay;
  readonly formatLongDay = formatLongDay;
  readonly relativeDay = relativeDay;

  ngOnInit(): void {
    // Cảnh báo "đã từng làm" — chỉ cảnh báo, không bao giờ chặn lưu.
    this.titleChanges
      .pipe(
        debounceTime(350),
        switchMap(title =>
          title.trim().length < 2
            ? of(null)
            : this.noveltyService
                .checkDuplicate(title, this.editingId || undefined)
                .pipe(catchError(() => of(null)))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.duplicate = result && result.duplicate ? result : null;
        this.cdr.markForCheck();
      });

    this.load();
  }

  // ==========================================================================
  // Tải
  // ==========================================================================

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.cdr.markForCheck();

    this.noveltyService.list().subscribe({
      next: rows => {
        this.experiences = rows;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.cdr.markForCheck();
      },
    });
    this.loadSummary();
  }

  private loadSummary(): void {
    this.noveltyService.summary().subscribe({
      next: summary => {
        this.summary = summary;
        this.cdr.markForCheck();
        // Gợi ý chỉ khi tuần này chưa có gì được lên lịch.
        if (!summary.planned) this.loadSuggestions();
        else this.suggestions = [];
      },
      error: () => {
        this.summary = null;
        this.cdr.markForCheck();
      },
    });
  }

  private loadSuggestions(): void {
    this.noveltyService.suggestions(3).subscribe({
      next: rows => {
        this.suggestions = rows;
        this.cdr.markForCheck();
      },
      // Gợi ý là phụ: hỏng thì thôi, không báo lỗi.
      error: () => {
        this.suggestions = [];
        this.cdr.markForCheck();
      },
    });
  }

  /** Sau mỗi thao tác ghi: tải lại cả danh sách lẫn tóm tắt. */
  private refreshAfter(message?: string): void {
    this.busyId = null;
    if (message) this.alertService.showNoti(message, 'success');
    this.load();
  }

  private failed(fallback: string) {
    return (err: { error?: { msg?: string } }) => {
      this.busyId = null;
      this.saving = false;
      this.reflectionBusy = false;
      this.cdr.markForCheck();
      this.alertService.showNoti(err?.error?.msg || fallback, 'danger');
    };
  }

  // ==========================================================================
  // Danh sách
  // ==========================================================================

  get ideas(): NoveltyExperience[] {
    // Có ngày trước (gần nhất trước), rồi tới ý tưởng chưa có ngày.
    return this.experiences
      .filter(e => e.status === 'PLANNED')
      .sort((a, b) => {
        if (a.plannedDate && b.plannedDate) {
          return a.plannedDate.localeCompare(b.plannedDate);
        }
        if (a.plannedDate) return -1;
        if (b.plannedDate) return 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }

  get history(): NoveltyExperience[] {
    return this.experiences
      .filter(e => e.status === 'DONE')
      .sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));
  }

  get dropped(): NoveltyExperience[] {
    return this.experiences.filter(e => e.status === 'DROPPED');
  }

  categoryLabel(value: string): string {
    return this.categories.find(c => c.value === value)?.label || 'Khác';
  }

  weekLabel(week: NoveltyWeek): string {
    const [, month, day] = week.weekKey.split('-');
    return `${day}/${month}`;
  }

  trackById(_: number, exp: NoveltyExperience): string {
    return exp._id;
  }

  againLabel(value: string | null): string {
    return value === 'YES'
      ? 'muốn làm lại'
      : value === 'NO'
        ? 'không làm lại'
        : value === 'MAYBE'
          ? 'có thể làm lại'
          : '';
  }

  hasReflection(exp: NoveltyExperience): boolean {
    const r = exp.reflection;
    return !!r && (r.wasNew !== null || !!r.feeling || !!r.again || !!r.note);
  }

  // ==========================================================================
  // Form thêm / sửa
  // ==========================================================================

  startAdd(prefill?: NoveltySuggestion): void {
    this.editingId = null;
    this.form = {
      ...emptyForm(),
      title: prefill?.title || '',
      category: prefill?.category || 'other',
    };
    this.duplicate = null;
    this.formOpen = true;
    if (prefill) this.titleChanges.next(prefill.title);
  }

  startEdit(exp: NoveltyExperience): void {
    this.editingId = exp._id;
    this.form = {
      title: exp.title,
      category: exp.category,
      alreadyDone: exp.status === 'DONE',
      doneDate: exp.doneAt ? ictDateKey(exp.doneAt) : ictDateKey(),
    };
    this.duplicate = null;
    this.formOpen = true;
  }

  cancelForm(): void {
    this.formOpen = false;
    this.editingId = null;
    this.duplicate = null;
  }

  onTitleChange(title: string): void {
    this.titleChanges.next(title || '');
  }

  save(): void {
    const title = (this.form.title || '').trim();
    if (!title) {
      this.alertService.showNoti('Cần một tiêu đề', 'warning');
      return;
    }
    const body: NoveltyDraft = { title, category: this.form.category };
    if (this.form.alreadyDone) {
      body.status = 'DONE';
      body.doneDate = this.form.doneDate || this.today;
    } else if (!this.editingId) {
      body.status = 'PLANNED';
    }

    this.saving = true;
    const request = this.editingId
      ? this.noveltyService.update(this.editingId, body)
      : this.noveltyService.create(body);
    request.subscribe({
      next: () => {
        this.saving = false;
        this.formOpen = false;
        this.editingId = null;
        this.duplicate = null;
        this.refreshAfter('Đã lưu');
      },
      error: this.failed('Không lưu được'),
    });
  }

  // ==========================================================================
  // Hành động trên từng trải nghiệm
  // ==========================================================================

  plan(exp: NoveltyExperience): void {
    const date = this.planDate[exp._id] || this.today;
    this.busyId = exp._id;
    this.noveltyService.plan(exp._id, date).subscribe({
      next: () =>
        this.refreshAfter(`Đã thêm vào Todo Today: ${relativeDay(date)}`),
      error: this.failed('Không lên lịch được'),
    });
  }

  unplan(exp: NoveltyExperience): void {
    this.busyId = exp._id;
    this.noveltyService.unplan(exp._id).subscribe({
      next: () => this.refreshAfter(),
      error: this.failed('Không bỏ ngày được'),
    });
  }

  /** Xong ngay từ trang này, rồi mở sheet suy ngẫm (tuỳ chọn). */
  complete(exp: NoveltyExperience): void {
    this.busyId = exp._id;
    this.noveltyService.complete(exp._id).subscribe({
      next: saved => {
        this.reflectionFor = saved;
        this.refreshAfter();
      },
      error: this.failed('Không đánh dấu xong được'),
    });
  }

  openReflection(exp: NoveltyExperience): void {
    this.reflectionFor = exp;
    this.cdr.markForCheck();
  }

  closeReflection(): void {
    this.reflectionFor = null;
    this.cdr.markForCheck();
  }

  saveReflection(reflection: NoveltyReflection): void {
    const exp = this.reflectionFor;
    if (!exp) return;
    this.reflectionBusy = true;
    this.noveltyService.complete(exp._id, reflection).subscribe({
      next: () => {
        this.reflectionBusy = false;
        this.reflectionFor = null;
        this.refreshAfter('Đã lưu suy ngẫm');
      },
      error: this.failed('Không lưu được suy ngẫm'),
    });
  }

  setStatus(exp: NoveltyExperience, status: 'PLANNED' | 'DROPPED'): void {
    this.busyId = exp._id;
    this.noveltyService.update(exp._id, { status }).subscribe({
      next: () => this.refreshAfter(),
      error: this.failed('Không cập nhật được'),
    });
  }

  remove(exp: NoveltyExperience): void {
    if (!confirm(`Xoá "${exp.title}"?`)) return;
    this.busyId = exp._id;
    this.noveltyService.remove(exp._id).subscribe({
      next: () => this.refreshAfter('Đã xoá'),
      error: this.failed('Không xoá được'),
    });
  }
}
