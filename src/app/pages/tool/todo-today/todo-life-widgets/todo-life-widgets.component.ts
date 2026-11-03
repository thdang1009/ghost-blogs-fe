import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { switchMap } from 'rxjs/operators';
import {
  NoveltyReflection,
  NoveltySuggestion,
  NoveltySummary,
  PeopleDashboard,
  Person,
  TodoToday,
} from '@models/_index';
import { AlertService, NoveltyService, PeopleService } from '@services/_index';
import { TDTD_STATUS } from '@shared/enum';
import { NoveltyReflectionSheetComponent } from '../../life/novelty-reflection-sheet/novelty-reflection-sheet.component';
import { ictDateKey, relativeDay } from '../../life/life-date.util';
import { lastMetLabel } from '../../life/people-format.util';

/**
 * Hai widget Life trên bảng Todo Today (ADR 0003): mỗi cái MỘT dòng, chạm để
 * mở rộng.
 *
 * Nằm DƯỚI danh sách việc (sau nút "Add task"), không phải ngay dưới widget
 * office: chỗ đó còn ở trên nếp gấp, và hai dòng chen vào sẽ đẩy danh sách
 * xuống — trái với ngân sách 360×640 ở đầu todo-today.component.html.
 *
 * Không bao giờ hiển thị số lần gặp còn lại — con số đó chỉ có trong thẻ của
 * từng người ở trang Life. "N người chưa có hẹn" chỉ đếm người QUÁ nhịp của
 * chính họ.
 *
 * Tự tải dữ liệu của mình; parent chỉ báo khi bảng đổi (`refresh`) và khi
 * một việc Life vừa được tick (`toggled`).
 */
@Component({
  selector: 'app-todo-life-widgets',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    NoveltyReflectionSheetComponent,
  ],
  templateUrl: './todo-life-widgets.component.html',
  styleUrls: ['./todo-life-widgets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoLifeWidgetsComponent implements OnInit, OnChanges {
  private readonly noveltyService = inject(NoveltyService);
  private readonly peopleService = inject(PeopleService);
  private readonly alertService = inject(AlertService);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Tăng mỗi lần bảng tải lại — widget tải lại theo. */
  @Input() refresh = 0;
  /** Việc vừa được tick / bỏ tick trên bảng. */
  @Input() toggled: TodoToday | null = null;
  /** Widget vừa tạo một việc cho hôm nay — bảng cần tải lại. */
  @Output() boardChanged = new EventEmitter<void>();

  readonly relativeDay = relativeDay;
  readonly lastMetLabel = lastMetLabel;

  summary: NoveltySummary | null = null;
  suggestions: NoveltySuggestion[] = [];
  noveltyError = false;
  noveltyOpen = false;

  dashboard: PeopleDashboard | null = null;
  peopleError = false;
  peopleOpen = false;

  busy = false;

  /** Trải nghiệm vừa tick xong — sheet suy ngẫm (tuỳ chọn) mở cho nó. */
  reflectFor: { id: string; title: string } | null = null;
  reflectBusy = false;

  get today(): string {
    return ictDateKey();
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refresh'] && !changes['refresh'].firstChange) this.load();

    const todo = changes['toggled']?.currentValue as TodoToday | null;
    if (
      todo &&
      (todo.sourceKind === 'NOVELTY' || todo.sourceKind === 'PERSON')
    ) {
      // Việc ĐÃ được lưu DONE trước khi sheet mở — suy ngẫm không bao giờ
      // chặn việc tick.
      if (
        todo.sourceKind === 'NOVELTY' &&
        todo.status === TDTD_STATUS.DONE &&
        todo.sourceRef
      ) {
        this.reflectFor = {
          id: todo.sourceRef,
          title: (todo.content || '').replace(/^✨\s*/, ''),
        };
      }
      this.load();
    }
  }

  // ==========================================================================
  // Tải
  // ==========================================================================

  load(): void {
    this.loadNovelty();
    this.loadPeople();
  }

  loadNovelty(): void {
    this.noveltyError = false;
    this.noveltyService.summary().subscribe({
      next: summary => {
        // Response thiếu `data` không được làm vỡ cả bảng Todo Today.
        this.summary = summary || null;
        this.cdr.markForCheck();
        // Gợi ý CHỈ khi chưa có gì được lên lịch.
        if (!summary || summary.planned) {
          this.suggestions = [];
          return;
        }
        this.noveltyService.suggestions(3).subscribe({
          next: rows => {
            this.suggestions = rows;
            this.cdr.markForCheck();
          },
          error: () => {
            this.suggestions = [];
            this.cdr.markForCheck();
          },
        });
      },
      error: () => {
        this.noveltyError = true;
        this.cdr.markForCheck();
      },
    });
  }

  loadPeople(): void {
    this.peopleError = false;
    this.peopleService.dashboard().subscribe({
      next: dashboard => {
        this.dashboard = dashboard || null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.peopleError = true;
        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================================
  // Hiển thị
  // ==========================================================================

  /** Người quá nhịp của chính họ và chưa có hẹn — đúng nhóm mà N đếm. */
  get attention(): Person[] {
    return (this.dashboard?.noPlan || []).filter(p => p.stats.needsAttention);
  }

  get nextMeeting() {
    return this.dashboard?.upcoming?.[0] || null;
  }

  /** Mở bộ chọn ngày ngay bằng một chạm; trình duyệt cũ thì hiện ô ngày. */
  pick(input: HTMLInputElement): void {
    try {
      input.showPicker();
    } catch {
      input.classList.add('is-visible');
      input.focus();
    }
  }

  private failed(fallback: string) {
    return (err: { error?: { msg?: string } }) => {
      this.busy = false;
      this.cdr.markForCheck();
      this.alertService.showNoti(err?.error?.msg || fallback, 'danger');
    };
  }

  private afterCreate(date: string, message: string): void {
    this.busy = false;
    this.alertService.showNoti(message, 'success');
    // Việc mới rơi vào hôm nay thì bảng phải hiện nó ngay — bảng tải lại sẽ
    // tăng `refresh`, và widget tải lại theo đó; không cần tải hai lần.
    if (date === this.today) this.boardChanged.emit();
    else this.load();
  }

  // ==========================================================================
  // Hành động
  // ==========================================================================

  /** Gợi ý → một trải nghiệm PLANNED → một việc trên ngày đã chọn. */
  planSuggestion(sg: NoveltySuggestion, date: string): void {
    if (!date) return;
    this.busy = true;
    this.noveltyService
      .create({ title: sg.title, category: sg.category, status: 'PLANNED' })
      .pipe(switchMap(exp => this.noveltyService.plan(exp._id, date)))
      .subscribe({
        next: () => this.afterCreate(date, `Đã lên lịch: ${relativeDay(date)}`),
        error: this.failed('Không lên lịch được'),
      });
  }

  schedulePerson(person: Person, date: string): void {
    if (!date) return;
    this.busy = true;
    this.peopleService.schedule(person._id, date).subscribe({
      next: () =>
        this.afterCreate(date, `Đã hẹn ${person.name}: ${relativeDay(date)}`),
      error: this.failed('Không hẹn được'),
    });
  }

  closeReflection(): void {
    this.reflectFor = null;
    this.cdr.markForCheck();
  }

  saveReflection(reflection: NoveltyReflection): void {
    const target = this.reflectFor;
    if (!target) return;
    this.reflectBusy = true;
    this.noveltyService.complete(target.id, reflection).subscribe({
      next: () => {
        this.reflectBusy = false;
        this.reflectFor = null;
        this.cdr.markForCheck();
        this.alertService.showNoti('Đã lưu suy ngẫm', 'success');
      },
      error: (err: { error?: { msg?: string } }) => {
        this.reflectBusy = false;
        this.cdr.markForCheck();
        this.alertService.showNoti(
          err?.error?.msg || 'Không lưu được suy ngẫm',
          'danger'
        );
      },
    });
  }
}
