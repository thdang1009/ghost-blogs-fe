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
  LearningSession,
  RoadmapSessions,
  RoadmapWithStats,
} from '@models/_index';

const sessionRow = (
  id: string,
  type: 'SHORT' | 'LONG' = 'SHORT'
): LearningSession => ({
  _id: id,
  user: 1,
  date: '2026-08-05T13:00:00.000Z',
  type,
  note: '',
});

/** Row tiến độ mà backend trả về sau PATCH. */
function progressRow(
  status: LearningItemStatus,
  doneAt: string | null = null
): LearningProgress {
  return { user: 1, itemKey: 'key', status, doneAt, note: '' };
}

function buildSessions(
  overrides: Partial<RoadmapSessions> = {}
): RoadmapSessions {
  return {
    thisWeek: [],
    week: {
      weekKey: '2026-08-03',
      short: 0,
      long: 0,
      total: 0,
      floor: 2,
      floorMet: false,
      targetMet: false,
    },
    streak: { current: 0, longest: 0, currentWeekMet: false },
    weeks: [],
    ...overrides,
  };
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
                  draft: null,
                  suggestedSeries: 'daily-depth',
                },
                {
                  key: 'm1-REVIEW-bbb',
                  order: 1,
                  text: 'LeetCode medium',
                  status: 'TODO',
                  doneAt: null,
                  draft: null,
                  suggestedSeries: 'daily-problem-solving',
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
      'getSeriesOptions',
      'createDraft',
      'logSession',
      'deleteSession',
      'getSessions',
    ]);
    alertSpy = jasmine.createSpyObj('AlertService', ['showNoti']);

    serviceSpy.getRoadmap.and.returnValue(of(buildRoadmap()));
    serviceSpy.getSessions.and.returnValue(of(buildSessions()));
    serviceSpy.getSeriesOptions.and.returnValue(
      of([
        {
          id: 'sid-ps',
          name: 'Daily Problem Solving',
          slug: 'daily-problem-solving',
        },
        { id: 'sid-depth', name: 'Daily Depth', slug: 'daily-depth' },
      ])
    );

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

  describe('cầu nối blog', () => {
    const draftResult = {
      postId: 'pid-1',
      id: 42,
      title: 'Daily Problem Solving #6 — LeetCode medium',
      postReference: 'daily-problem-solving-6-leetcode-medium',
      seriesName: 'Daily Problem Solving',
      number: 6,
    };

    beforeEach(() => fixture.detectChanges());

    it('nạp danh sách series khi khởi tạo', () => {
      expect(serviceSpy.getSeriesOptions).toHaveBeenCalled();
      expect(component.seriesOptions.length).toBe(2);
    });

    it('mở ô chọn thì chọn sẵn series được gợi ý', () => {
      component.openDraft(secondItem()); // gợi ý daily-problem-solving
      expect(component.draftingKey).toBe('m1-REVIEW-bbb');
      expect(component.selectedSeriesId).toBe('sid-ps');
    });

    it('không có gợi ý khớp thì lấy series đầu tiên', () => {
      const item = { ...secondItem(), suggestedSeries: 'không-tồn-tại' };
      component.openDraft(item);
      expect(component.selectedSeriesId).toBe('sid-ps');
    });

    it('hiện tên series được gợi ý', () => {
      expect(component.suggestedSeriesName(secondItem())).toBe(
        'Daily Problem Solving'
      );
      expect(component.suggestedSeriesName(firstItem())).toBe('Daily Depth');
    });

    it('tạo nháp xong thì gắn bài vào mục và đóng ô chọn', () => {
      serviceSpy.createDraft.and.returnValue(of(draftResult));

      component.openDraft(secondItem());
      component.createDraft(secondItem());

      expect(serviceSpy.createDraft).toHaveBeenCalledWith(
        'm1-REVIEW-bbb',
        'sid-ps'
      );
      expect(secondItem().draft?.id).toBe(42);
      expect(component.draftingKey).toBeNull();
      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        `Đã tạo bản nháp: ${draftResult.title}`,
        'success'
      );
    });

    it('mục đã có bài thì không cho tạo nữa', () => {
      expect(component.canDraft(secondItem())).toBe(true);
      secondItem().draft = { postId: 'pid-1', id: 42, title: 'x' };
      expect(component.canDraft(secondItem())).toBe(false);
    });

    it('không có series nào thì ẩn nút viết bài', () => {
      component.seriesOptions = [];
      expect(component.canDraft(secondItem())).toBe(false);
    });

    // 409 nghĩa là màn hình đang cũ, không phải hỏng — gắn lại bài đã có
    // để nút đổi thành "Bản nháp" thay vì báo lỗi đỏ vô nghĩa.
    it('409 thì gắn bài đã có và báo nhẹ, không báo lỗi', () => {
      serviceSpy.createDraft.and.returnValue(
        throwError(() => ({
          status: 409,
          error: { postId: 'pid-old', id: 7, title: 'Bài cũ' },
        }))
      );

      component.openDraft(secondItem());
      component.createDraft(secondItem());

      expect(secondItem().draft?.id).toBe(7);
      expect(component.draftingKey).toBeNull();
      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        'Mục này đã có bài nháp',
        'info'
      );
    });

    it('lỗi thật thì báo msg backend và giữ ô chọn để thử lại', () => {
      serviceSpy.createDraft.and.returnValue(
        throwError(() => ({ status: 500, error: { msg: 'Series not found.' } }))
      );

      component.openDraft(secondItem());
      component.createDraft(secondItem());

      expect(secondItem().draft).toBeFalsy();
      expect(component.draftingKey).toBe('m1-REVIEW-bbb');
      expect(component.isCreatingDraft).toBe(false);
      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        'Series not found.',
        'danger'
      );
    });

    it('chưa chọn series thì không gọi API', () => {
      component.draftingKey = 'm1-REVIEW-bbb';
      component.selectedSeriesId = '';
      component.createDraft(secondItem());
      expect(serviceSpy.createDraft).not.toHaveBeenCalled();
    });

    it('huỷ thì đóng ô chọn', () => {
      component.openDraft(secondItem());
      component.cancelDraft();
      expect(component.draftingKey).toBeNull();
      expect(component.selectedSeriesId).toBe('');
    });

    // Danh sách series hỏng chỉ mất nút viết bài, không được làm sập màn hình.
    it('lỗi tải series không làm hỏng màn hình chính', () => {
      serviceSpy.getSeriesOptions.and.returnValue(
        throwError(() => new Error('net'))
      );

      const other = TestBed.createComponent(LearningRoadmapComponent);
      other.detectChanges();

      expect(other.componentInstance.seriesOptions).toEqual([]);
      expect(other.componentInstance.loadFailed).toBe(false);
      expect(other.componentInstance.data).toBeTruthy();
    });
  });

  describe('ngân sách tuần & streak', () => {
    it('nạp buổi học khi khởi tạo', () => {
      fixture.detectChanges();
      expect(serviceSpy.getSessions).toHaveBeenCalled();
      expect(component.sessions).toBeTruthy();
    });

    it('tính số buổi còn thiếu để chạm sàn', () => {
      serviceSpy.getSessions.and.returnValue(
        of(
          buildSessions({
            week: {
              weekKey: '2026-08-03',
              short: 1,
              long: 0,
              total: 1,
              floor: 2,
              floorMet: false,
              targetMet: false,
            },
          })
        )
      );
      fixture.detectChanges();
      expect(component.sessionsToFloor).toBe(1);
    });

    it('chạm sàn rồi thì không còn thiếu buổi nào', () => {
      serviceSpy.getSessions.and.returnValue(
        of(
          buildSessions({
            week: {
              weekKey: '2026-08-03',
              short: 3,
              long: 1,
              total: 4,
              floor: 2,
              floorMet: true,
              targetMet: true,
            },
          })
        )
      );
      fixture.detectChanges();
      expect(component.sessionsToFloor).toBe(0);
    });

    // Lộ trình yêu cầu nhắc NHẸ: tuần nhẹ không phải thất bại, nên câu chữ
    // không được mang tính trách móc.
    describe('câu nhắc', () => {
      const withWeek = (week: Partial<RoadmapSessions['week']>) => {
        serviceSpy.getSessions.and.returnValue(
          of(
            buildSessions({
              week: {
                weekKey: '2026-08-03',
                short: 0,
                long: 0,
                total: 0,
                floor: 2,
                floorMet: false,
                targetMet: false,
                ...week,
              },
            })
          )
        );
        fixture.detectChanges();
      };

      it('chưa có buổi nào thì nói rõ sàn là bao nhiêu', () => {
        withWeek({ total: 0 });
        expect(component.weekMessage).toBe(
          'Tuần này chưa có buổi nào. 2 buổi là chạm sàn.'
        );
      });

      it('còn thiếu thì đếm ngược, không trách móc', () => {
        withWeek({ short: 1, total: 1 });
        expect(component.weekMessage).toBe('Còn 1 buổi nữa là chạm sàn.');
      });

      it('chạm sàn thì nói vượt sàn là bonus', () => {
        withWeek({ short: 2, total: 2, floorMet: true });
        expect(component.weekMessage).toContain('Đã chạm sàn');
        expect(component.weekMessage).toContain('bonus');
      });

      it('đạt mục tiêu thì khen', () => {
        withWeek({
          short: 3,
          long: 1,
          total: 4,
          floorMet: true,
          targetMet: true,
        });
        expect(component.weekMessage).toContain('vượt sàn');
      });
    });

    it('ghi buổi ngắn rồi tải lại để backend tính lại sàn/streak', () => {
      fixture.detectChanges();
      serviceSpy.logSession.and.returnValue(of(sessionRow('s1')));

      component.logSession('SHORT');

      expect(serviceSpy.logSession).toHaveBeenCalledWith('SHORT');
      // Không tự cộng ở client — streak là logic của backend.
      expect(serviceSpy.getSessions).toHaveBeenCalledTimes(2);
      expect(component.isLoggingSession).toBe(false);
    });

    it('ghi lỗi thì báo rõ và không tải lại', () => {
      fixture.detectChanges();
      serviceSpy.logSession.and.returnValue(throwError(() => new Error('net')));

      component.logSession('LONG');

      expect(component.isLoggingSession).toBe(false);
      expect(serviceSpy.getSessions).toHaveBeenCalledTimes(1);
      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        'Chưa ghi được buổi học',
        'danger'
      );
    });

    it('không gửi request thứ hai khi đang ghi', () => {
      fixture.detectChanges();
      component.isLoggingSession = true;
      component.logSession('SHORT');
      expect(serviceSpy.logSession).not.toHaveBeenCalled();
    });

    it('gỡ được buổi ghi nhầm rồi tải lại', () => {
      serviceSpy.getSessions.and.returnValue(
        of(buildSessions({ thisWeek: [sessionRow('s1')] }))
      );
      fixture.detectChanges();
      serviceSpy.deleteSession.and.returnValue(of(undefined));

      expect(component.thisWeekSessions.length).toBe(1);
      component.deleteSession(sessionRow('s1'));

      expect(serviceSpy.deleteSession).toHaveBeenCalledWith('s1');
      expect(serviceSpy.getSessions).toHaveBeenCalledTimes(2);
    });

    it('gỡ lỗi thì báo rõ', () => {
      fixture.detectChanges();
      serviceSpy.deleteSession.and.returnValue(
        throwError(() => new Error('net'))
      );

      component.deleteSession(sessionRow('s1'));

      expect(component.isLoggingSession).toBe(false);
      expect(alertSpy.showNoti).toHaveBeenCalledWith(
        'Chưa gỡ được buổi học',
        'danger'
      );
    });

    // Thẻ tuần hỏng không được kéo sập cả màn hình lộ trình.
    it('lỗi tải buổi học không dựng cờ lỗi toàn trang', () => {
      serviceSpy.getSessions.and.returnValue(
        throwError(() => new Error('net'))
      );
      fixture.detectChanges();

      expect(component.sessions).toBeNull();
      expect(component.loadFailed).toBe(false);
      expect(component.data).toBeTruthy();
      expect(component.weekMessage).toBe('');
      expect(component.sessionsToFloor).toBe(0);
    });
  });
});
