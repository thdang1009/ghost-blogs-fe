import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  LearningItem,
  LearningMilestone,
  LearningSection,
  MilestoneStats,
  RoadmapImportResult,
  RoadmapWithStats,
} from '@models/_index';
import { AlertService, LearningRoadmapService } from '@services/_index';

@Component({
  selector: 'app-learning-roadmap',
  templateUrl: './learning-roadmap.component.html',
  styleUrls: ['./learning-roadmap.component.scss'],
})
export class LearningRoadmapComponent implements OnInit, OnDestroy {
  data: RoadmapWithStats | null = null;
  isLoadingResults = true;
  /** Request đầu tiên đã lỗi — khác hẳn "chưa import", nên hiển thị khác. */
  loadFailed = false;

  // Import dialog
  showImport = false;
  markdownInput = '';
  isImporting = false;
  previewResult: RoadmapImportResult | null = null;

  /** Mốc đang mở trong accordion; mặc định mở mốc đang làm dở. */
  expandedMilestone: string | null = null;
  /** Các key đang chờ server trả lời — để khoá đúng checkbox đó thôi. */
  pendingKeys = new Set<string>();

  private destroy$ = new Subject<void>();

  constructor(
    private learningRoadmapService: LearningRoadmapService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadRoadmap();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoadmap(): void {
    this.isLoadingResults = true;
    this.loadFailed = false;

    this.learningRoadmapService
      .getRoadmap()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.data = data;
          this.isLoadingResults = false;
          if (data && !this.expandedMilestone) {
            this.expandedMilestone = this.currentMilestone?.key ?? null;
          }
        },
        error: err => {
          console.error('Failed to load learning roadmap', err);
          this.isLoadingResults = false;
          this.loadFailed = true;
          this.alertService.showNoti('Không tải được lộ trình', 'danger');
        },
      });
  }

  // --- Dẫn xuất cho template ------------------------------------------------

  get milestones(): LearningMilestone[] {
    return this.data?.roadmap?.milestones ?? [];
  }

  get overallPercent(): number {
    return this.data?.stats?.overall?.percent ?? 0;
  }

  get overallDone(): number {
    return this.data?.stats?.overall?.done ?? 0;
  }

  get overallTotal(): number {
    return this.data?.stats?.overall?.total ?? 0;
  }

  /** Mốc đầu tiên chưa xong; xong hết thì mốc cuối. Suy ra như backend. */
  get currentMilestone(): MilestoneStats | null {
    const stats = this.data?.stats?.milestones ?? [];
    if (!stats.length) {
      return null;
    }
    return stats.find(m => m.percent < 100) ?? stats[stats.length - 1];
  }

  statsFor(milestoneKey: string): MilestoneStats | null {
    return (
      this.data?.stats?.milestones?.find(m => m.key === milestoneKey) ?? null
    );
  }

  /** Nhãn tiếng Việt cho loại section. */
  sectionLabel(section: LearningSection): string {
    return (
      {
        REVIEW: 'Ôn tập',
        NEW: 'Học mới',
        OUTPUT: 'Đầu ra',
        OTHER: 'Khác',
      }[section.kind] || section.heading
    );
  }

  isDone(item: LearningItem): boolean {
    return item.status === 'DONE';
  }

  isPending(item: LearningItem): boolean {
    return this.pendingKeys.has(item.key);
  }

  // --- Tương tác ------------------------------------------------------------

  toggleMilestone(key: string): void {
    this.expandedMilestone = this.expandedMilestone === key ? null : key;
  }

  /**
   * Tick/bỏ tick. Cập nhật UI trước cho mượt, nhưng nếu server từ chối thì
   * trả lại trạng thái cũ và báo rõ — không để anh tưởng đã lưu.
   */
  toggleItem(item: LearningItem): void {
    if (this.pendingKeys.has(item.key)) {
      return;
    }

    const previous = item.status ?? 'TODO';
    const next = previous === 'DONE' ? 'TODO' : 'DONE';

    this.pendingKeys.add(item.key);
    this.applyStatusLocally(item, next);

    this.learningRoadmapService
      .updateItemStatus(item.key, next)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: row => {
          item.doneAt = row?.doneAt ?? null;
          this.pendingKeys.delete(item.key);
        },
        error: err => {
          console.error('Failed to update roadmap item', err);
          this.applyStatusLocally(item, previous);
          this.pendingKeys.delete(item.key);
          this.alertService.showNoti('Chưa lưu được, thử lại nhé', 'danger');
        },
      });
  }

  /** Đổi trạng thái tại chỗ và tính lại % mà không cần gọi lại API. */
  private applyStatusLocally(
    item: LearningItem,
    status: 'TODO' | 'DONE'
  ): void {
    item.status = status;
    if (status !== 'DONE') {
      item.doneAt = null;
    }
    this.recalculateStats();
  }

  private recalculateStats(): void {
    if (!this.data) {
      return;
    }

    const milestoneStats = this.milestones.map(milestone => {
      let total = 0;
      let done = 0;
      milestone.sections.forEach(section =>
        section.items.forEach(item => {
          total += 1;
          if (item.status === 'DONE') done += 1;
        })
      );
      return {
        key: milestone.key,
        number: milestone.number,
        title: milestone.title,
        timeframe: milestone.timeframe,
        goal: milestone.goal,
        total,
        done,
        percent: total ? Math.round((done / total) * 100) : 0,
      };
    });

    const total = milestoneStats.reduce((sum, m) => sum + m.total, 0);
    const done = milestoneStats.reduce((sum, m) => sum + m.done, 0);

    this.data.stats = {
      milestones: milestoneStats,
      overall: {
        total,
        done,
        percent: total ? Math.round((done / total) * 100) : 0,
      },
    };
  }

  // --- Import ---------------------------------------------------------------

  openImport(): void {
    this.showImport = true;
    this.previewResult = null;
  }

  closeImport(): void {
    this.showImport = false;
    this.markdownInput = '';
    this.previewResult = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.markdownInput = String(reader.result ?? '');
      this.previewResult = null;
    };
    reader.onerror = () => {
      this.alertService.showNoti('Không đọc được file', 'danger');
    };
    reader.readAsText(file);
  }

  /** Xem trước: gọi import với dryRun, server không ghi gì. */
  preview(): void {
    this.runImport(true);
  }

  confirmImport(): void {
    this.runImport(false);
  }

  private runImport(dryRun: boolean): void {
    if (!this.markdownInput.trim()) {
      this.alertService.showNoti('Chưa có nội dung markdown', 'warning');
      return;
    }

    this.isImporting = true;
    this.learningRoadmapService
      .importRoadmap(this.markdownInput, dryRun)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.isImporting = false;
          this.previewResult = result;

          if (dryRun) {
            this.alertService.showNoti(
              `Xem trước: ${result.itemCount} mục, ${result.diff.added} thêm / ${result.diff.removed} mất`,
              'info'
            );
            return;
          }

          this.alertService.showNoti(
            `Đã cập nhật lộ trình — giữ ${result.keptProgress ?? 0} mục đã học`,
            'success'
          );
          this.closeImport();
          this.expandedMilestone = null;
          this.loadRoadmap();
        },
        error: err => {
          console.error('Failed to import roadmap', err);
          this.isImporting = false;
          this.alertService.showNoti(
            err?.error?.msg || 'Import thất bại',
            'danger'
          );
        },
      });
  }
}
