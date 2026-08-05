import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { LearningRoadmapComponent } from './learning-roadmap.component';
import { AlertService, LearningRoadmapService } from '@services/_index';
import {
  LearningItem,
  LearningItemStatus,
  LearningProgress,
  RoadmapWithStats,
} from '@models/_index';

/** Row tiến độ mà backend trả về sau PATCH. */
function progressRow(
  status: LearningItemStatus,
  doneAt: string | null = null
): LearningProgress {
  return { user: 1, itemKey: 'key', status, doneAt, note: '' };
}

function buildRoadmap(): RoadmapWithStats {
  return {
    roadmap: {
      user: 1,
      title: 'Lộ trình test',
      sourceHash: 'hash',
      importedAt: '2026-08-05T00:00:00.000Z',
      weeklyBudget: {
        shortPerWeek: 3,
        shortFloor: 2,
        longPerWeek: 1,
        raw: '',
      },
      notes: [{ heading: 'Nguyên tắc', markdown: '- giữ chuỗi' }],
      milestones: [
        {
          key: 'm1',
          number: 1,
          order: 0,
          title: 'Bật chế độ phỏng vấn',
          timeframe: 'Tuần 1–2',
          goal: 'sẵn sàng phỏng vấn thử',
          ratioReview: 70,
          ratioNew: 30,
          sections: [
            {
              kind: 'REVIEW',
              heading: 'Ôn tập (70%)',
              order: 0,
              ratio: 70,
              items: [
                {
                  key: 'm1-REVIEW-aaa',
                  order: 0,
                  text: 'Event loop',
                  status: 'DONE',
                  doneAt: '2026-08-01T00:00:00.000Z',
                },
                {
                  key: 'm1-REVIEW-bbb',
                  order: 1,
                  text: 'LeetCode medium',
                  status: 'TODO',
                  doneAt: null,
                },
              ],
            },
          ],
        },
        {
          key: 'm2',
          number: 2,
          order: 1,
          title: 'Đào sâu',
          timeframe: 'Tháng 2–3',
          goal: 'apply thật',
          ratioReview: 40,
          ratioNew: 60,
          sections: [
            {
              kind: 'NEW',
              heading: 'Học mới (60%)',
              order: 0,
              ratio: 60,
              items: [
                {
                  key: 'm2-NEW-ccc',
                  order: 0,
                  text: 'Outbox pattern',
                  status: 'TODO',
                  doneAt: null,
                },
              ],
            },
          ],
        },
      ],
    },
    stats: {
      milestones: [
        {
          key: 'm1',
          number: 1,
          title: 'Bật chế độ phỏng vấn',
          timeframe: 'Tuần 1–2',
          goal: '',
          total: 2,
          done: 1,
          percent: 50,
        },
        {
          key: 'm2',
          number: 2,
          title: 'Đào sâu',
          timeframe: 'Tháng 2–3',
          goal: '',
          total: 1,
          done: 0,
          percent: 0,
        },
      ],
      overall: { total: 3, done: 1, percent: 33 },
    },
  };
}

describe('LearningRoadmapComponent', () => {
  let component: LearningRoadmapComponent;
  let fixture: ComponentFixture<LearningRoadmapComponent>;
  let serviceSpy: jasmine.SpyObj<LearningRoadmapService>;
  let alertSpy: jasmine.SpyObj<AlertService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('LearningRoadmapService', [
      'getRoadmap',
      'getDashboard',
      'importRoadmap',
      'updateItemStatus',
    ]);
    alertSpy = jasmine.createSpyObj('AlertService', ['showNoti']);

    serviceSpy.getRoadmap.and.returnValue(of(buildRoadmap()));

    await TestBed.configureTestingModule({
      declarations: [LearningRoadmapComponent],
      imports: [FormsModule],
      providers: [
        { provide: LearningRoadmapService, useValue: serviceSpy },
        { provide: AlertService, useValue: alertSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LearningRoadmapComponent);
    component = fixture.componentInstance;
  });

  const firstItem = (): LearningItem =>
    component.data!.roadmap.milestones[0].sections[0].items[0];
  const secondItem = (): LearningItem =>
    component.data!.roadmap.milestones[0].sections[0].items[1];

  describe('nạp dữ liệu', () => {
    it('tải lộ trình khi khởi tạo', () => {
      fixture.detectChanges();
      expect(serviceSpy.getRoadmap).toHaveBeenCalled();
      expect(component.data).toBeTruthy();
      expect(component.isLoadingResults).toBe(false);
    });

    it('mở sẵn mốc đang làm dở', () => {
      fixture.detectChanges();
      expect(component.expandedMilestone).toBe('m1');
    });

    it('chưa import thì data null nhưng không coi là lỗi', () => {
      serviceSpy.getRoadmap.and.returnValue(of(null));
      fixture.detectChanges();
      expect(component.data).toBeNull();
      expect(component.loadFailed).toBe(false);
    });

    // Phân biệt "chưa import" với "lỗi mạng" — hai màn hình khác nhau.
    it('lỗi tải thì bật loadFailed và báo noti', () => {
      serviceSpy.getRoadmap.and.returnValue(throwError(() => new Error('net')));
      fixture.detectChanges();
      expect(component.loadFailed).toBe(true);
      expect(component.data).toBeNull();
      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        'Không tải được lộ trình',
        'danger'
      );
    });
  });

  describe('mốc hiện tại và thống kê', () => {
    beforeEach(() => fixture.detectChanges());

    it('mốc hiện tại là mốc đầu tiên chưa xong', () => {
      expect(component.currentMilestone?.key).toBe('m1');
    });

    it('xong hết thì đứng ở mốc cuối, không trả null', () => {
      component.data!.stats.milestones.forEach(m => (m.percent = 100));
      expect(component.currentMilestone?.key).toBe('m2');
    });

    it('phơi ra % tổng thể cho template', () => {
      expect(component.overallPercent).toBe(33);
      expect(component.overallDone).toBe(1);
      expect(component.overallTotal).toBe(3);
    });

    it('statsFor tìm đúng mốc', () => {
      expect(component.statsFor('m2')?.percent).toBe(0);
      expect(component.statsFor('không-có')).toBeNull();
    });

    it('dịch nhãn section sang tiếng Việt', () => {
      const section = component.data!.roadmap.milestones[0].sections[0];
      expect(component.sectionLabel(section)).toBe('Ôn tập');
    });
  });

  describe('accordion', () => {
    beforeEach(() => fixture.detectChanges());

    it('bấm lần nữa thì đóng lại', () => {
      component.toggleMilestone('m1');
      expect(component.expandedMilestone).toBeNull();
    });

    it('bấm mốc khác thì chuyển sang mốc đó', () => {
      component.toggleMilestone('m2');
      expect(component.expandedMilestone).toBe('m2');
    });
  });

  describe('tick mục', () => {
    beforeEach(() => fixture.detectChanges());

    it('tick TODO -> DONE và gọi API', () => {
      serviceSpy.updateItemStatus.and.returnValue(
        of(progressRow('DONE', '2026-08-05T00:00:00.000Z'))
      );

      component.toggleItem(secondItem());

      expect(serviceSpy.updateItemStatus).toHaveBeenCalledWith(
        'm1-REVIEW-bbb',
        'DONE'
      );
      expect(secondItem().status).toBe('DONE');
    });

    it('bỏ tick DONE -> TODO và xoá doneAt', () => {
      serviceSpy.updateItemStatus.and.returnValue(of(progressRow('TODO')));

      component.toggleItem(firstItem());

      expect(serviceSpy.updateItemStatus).toHaveBeenCalledWith(
        'm1-REVIEW-aaa',
        'TODO'
      );
      expect(firstItem().status).toBe('TODO');
      expect(firstItem().doneAt).toBeNull();
    });

    it('tính lại % ngay mà không cần gọi lại API', () => {
      serviceSpy.updateItemStatus.and.returnValue(of(progressRow('DONE')));

      component.toggleItem(secondItem());

      expect(component.statsFor('m1')?.percent).toBe(100);
      expect(component.overallPercent).toBe(67);
      expect(serviceSpy.getRoadmap).toHaveBeenCalledTimes(1);
    });

    // Điểm quan trọng nhất: lỗi không được im lặng, và không được để lại
    // dấu tick giả khiến anh tưởng đã lưu.
    it('API lỗi thì trả lại trạng thái cũ và báo rõ', () => {
      serviceSpy.updateItemStatus.and.returnValue(
        throwError(() => new Error('fail'))
      );

      component.toggleItem(secondItem());

      expect(secondItem().status).toBe('TODO');
      expect(component.statsFor('m1')?.percent).toBe(50);
      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        'Chưa lưu được, thử lại nhé',
        'danger'
      );
    });

    it('bỏ khoá sau khi API trả lời', () => {
      serviceSpy.updateItemStatus.and.returnValue(of(progressRow('DONE')));

      component.toggleItem(secondItem());
      expect(component.isPending(secondItem())).toBe(false);
    });

    it('không gửi request thứ hai khi mục đang chờ', () => {
      component.pendingKeys.add('m1-REVIEW-bbb');
      component.toggleItem(secondItem());
      expect(serviceSpy.updateItemStatus).not.toHaveBeenCalled();
    });
  });

  describe('import', () => {
    beforeEach(() => fixture.detectChanges());

    it('không gọi API khi chưa nhập gì', () => {
      component.markdownInput = '   ';
      component.confirmImport();
      expect(serviceSpy.importRoadmap).not.toHaveBeenCalled();
      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        'Chưa có nội dung markdown',
        'warning'
      );
    });

    it('xem trước gọi với dryRun=true và không tải lại lộ trình', () => {
      serviceSpy.importRoadmap.and.returnValue(
        of({
          dryRun: true,
          title: 'Lộ trình',
          milestoneCount: 5,
          itemCount: 41,
          sourceUnchanged: false,
          diff: { unchanged: 40, added: 1, removed: 0, remapped: 0 },
          remapped: [],
        })
      );

      component.markdownInput = '# Lộ trình';
      component.preview();

      expect(serviceSpy.importRoadmap).toHaveBeenCalledWith('# Lộ trình', true);
      expect(component.previewResult?.itemCount).toBe(41);
      expect(component.showImport).toBe(false);
      expect(serviceSpy.getRoadmap).toHaveBeenCalledTimes(1);
    });

    it('import thật thì đóng dialog và tải lại', () => {
      serviceSpy.importRoadmap.and.returnValue(
        of({
          dryRun: false,
          title: 'Lộ trình',
          milestoneCount: 5,
          itemCount: 41,
          sourceUnchanged: false,
          diff: { unchanged: 40, added: 1, removed: 0, remapped: 0 },
          remapped: [],
          keptProgress: 7,
        })
      );

      component.openImport();
      component.markdownInput = '# Lộ trình';
      component.confirmImport();

      expect(component.showImport).toBe(false);
      expect(component.markdownInput).toBe('');
      expect(serviceSpy.getRoadmap).toHaveBeenCalledTimes(2);
      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        'Đã cập nhật lộ trình — giữ 7 mục đã học',
        'success'
      );
    });

    it('import lỗi thì hiện msg của backend, giữ nguyên nội dung đã dán', () => {
      serviceSpy.importRoadmap.and.returnValue(
        throwError(() => ({ error: { msg: 'Không tìm thấy mốc nào.' } }))
      );

      component.openImport();
      component.markdownInput = 'rác';
      component.confirmImport();

      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        'Không tìm thấy mốc nào.',
        'danger'
      );
      expect(component.showImport).toBe(true);
      expect(component.markdownInput).toBe('rác');
      expect(component.isImporting).toBe(false);
    });

    it('đóng dialog thì xoá nội dung và bản xem trước', () => {
      component.openImport();
      component.markdownInput = '# abc';
      component.closeImport();

      expect(component.showImport).toBe(false);
      expect(component.markdownInput).toBe('');
      expect(component.previewResult).toBeNull();
    });
  });
});
