import { TodoToday } from '@models/_index';
import { TODO_DEFAULT_WEIGHT, TODO_WEIGHT_META } from '@shared/enum';

export interface TodoWeightMeta {
  value: number;
  label: string;
  short: string;
  color: string;
}

export const WEIGHT_OPTIONS = TODO_WEIGHT_META as TodoWeightMeta[];

/**
 * Weight thực dụng.
 *
 * Việc tạo từ trước v2 KHÔNG có trường `weight`, và sẽ không có cho tới khi
 * `backfill-todo-fields.js` chạy xong trên DB thật. Coi thiếu là 3 (bình
 * thường) chứ không phải 0, nếu không mọi việc cũ rơi xuống đáy danh sách và
 * Focus Bar hiện nhầm việc.
 */
export function effectiveWeight(todo: TodoToday | null | undefined): number {
  const weight = todo?.weight;
  return typeof weight === 'number' && isFinite(weight)
    ? weight
    : TODO_DEFAULT_WEIGHT;
}

export function weightMeta(weight: number): TodoWeightMeta {
  return (
    WEIGHT_OPTIONS.find(option => option.value === weight) || WEIGHT_OPTIONS[2] // Normal
  );
}

export function weightMetaOf(todo: TodoToday): TodoWeightMeta {
  return weightMeta(effectiveWeight(todo));
}

/**
 * Sắp việc giống hệt server: weight giảm dần, rồi `order` tăng dần, chốt bằng
 * `id`. Client tự sắp lại sau mỗi thao tác lạc quan để danh sách không nhảy
 * khác với lần tải kế tiếp.
 */
export function sortTodos(
  todos: TodoToday[],
  sortByWeight = true
): TodoToday[] {
  return [...todos].sort((a, b) => {
    if (sortByWeight) {
      const byWeight = effectiveWeight(b) - effectiveWeight(a);
      if (byWeight) return byWeight;
    }
    const byOrder = (a.order || 0) - (b.order || 0);
    if (byOrder) return byOrder;
    return (a.id || 0) - (b.id || 0);
  });
}
