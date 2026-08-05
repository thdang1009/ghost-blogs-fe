/** Learning Roadmap — khớp với `/v1/learning-roadmap` ở backend. */

/**
 * Envelope của các route mới (`/v1/learning-roadmap`, `/v1/omni`).
 * Khác `ApiResponse<T>` trong api.ts — route cũ trả `{status, data}`.
 */
export interface LearningApiResponse<T> {
  success: boolean;
  data: T;
  msg?: string;
}

export type LearningItemStatus = 'TODO' | 'DONE';
export type LearningSectionKind = 'REVIEW' | 'NEW' | 'OUTPUT' | 'OTHER';

/** Một mục tick được. `status`/`doneAt`/`note` do GET / ghép vào từ tiến độ. */
export interface LearningItem {
  key: string;
  order: number;
  text: string;
  status?: LearningItemStatus;
  doneAt?: string | null;
  note?: string;
  /** Bài blog nháp đã sinh từ mục này, null nếu chưa viết. */
  draft?: RoadmapItemDraft | null;
  /** Slug series backend gợi ý — chỉ là gợi ý, user vẫn tự chọn. */
  suggestedSeries?: string | null;
}

/**
 * Bài nháp gắn với một mục.
 * `id` là `Post.id` dạng số — CMS mở bài bằng `/admin/blog/post-list?id=`,
 * không dùng ObjectId.
 */
export interface RoadmapItemDraft {
  postId: string;
  id: number;
  title: string;
}

/** Series để chọn khi tạo bài nháp. */
export interface RoadmapSeriesOption {
  id: string;
  name: string;
  slug: string;
}

/** Kết quả POST /item/:key/draft */
export interface RoadmapDraftResult {
  postId: string;
  id: number;
  title: string;
  postReference: string;
  seriesName: string;
  number: number;
}

export interface LearningSection {
  kind: LearningSectionKind;
  heading: string;
  order: number;
  /** % ôn/mới đọc từ heading, null nếu heading không ghi. */
  ratio: number | null;
  items: LearningItem[];
}

export interface LearningMilestone {
  key: string;
  number: number;
  order: number;
  title: string;
  timeframe: string;
  goal: string;
  ratioReview: number | null;
  ratioNew: number | null;
  sections: LearningSection[];
}

/** Phần `##` không phải mốc (nguyên tắc, track LeetCode…) — render, không tick. */
export interface LearningNote {
  heading: string;
  markdown: string;
}

export interface WeeklyBudget {
  shortPerWeek: number | null;
  shortFloor: number | null;
  longPerWeek: number | null;
  raw: string;
}

export interface LearningRoadmap {
  user: number;
  title: string;
  sourceHash: string;
  importedAt: string;
  weeklyBudget: WeeklyBudget;
  milestones: LearningMilestone[];
  notes: LearningNote[];
}

/** Thống kê hoàn thành của một mốc. */
export interface MilestoneStats {
  key: string;
  number: number;
  title: string;
  timeframe: string;
  goal: string;
  total: number;
  done: number;
  percent: number;
}

export interface RoadmapStats {
  milestones: MilestoneStats[];
  overall: { total: number; done: number; percent: number };
}

/** Trả về từ GET /v1/learning-roadmap */
export interface RoadmapWithStats {
  roadmap: LearningRoadmap;
  stats: RoadmapStats;
}

/** Trả về từ GET /v1/learning-roadmap/dashboard */
export interface RoadmapDashboard {
  title: string;
  importedAt: string;
  currentMilestone: MilestoneStats | null;
  milestones: MilestoneStats[];
  overall: { total: number; done: number; percent: number };
  weeklyBudget: WeeklyBudget | null;
}

/** Một mục bị đổi key khi re-import, kèm độ giống đã dùng để khớp. */
export interface RoadmapRemap {
  from: string;
  to: string;
  similarity: number;
}

/** Kết quả POST /v1/learning-roadmap/import */
export interface RoadmapImportResult {
  dryRun: boolean;
  title: string;
  milestoneCount: number;
  itemCount: number;
  /** File giống hệt lần import trước. */
  sourceUnchanged: boolean;
  diff: {
    unchanged: number;
    added: number;
    removed: number;
    remapped: number;
  };
  remapped: RoadmapRemap[];
  /** Số row tiến độ đã dời sang key mới — chỉ có khi không phải dryRun. */
  progressMoved?: number;
  /** Số mục đang DONE sau khi import — chỉ có khi không phải dryRun. */
  keptProgress?: number;
}

export interface LearningProgress {
  user: number;
  itemKey: string;
  status: LearningItemStatus;
  doneAt: string | null;
  note: string;
}
