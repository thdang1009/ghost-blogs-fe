import {
  CADENCE_PER_LABELS,
  Cadence,
  Person,
  RELATION_TYPES,
} from '@models/_index';

/**
 * Chữ hiển thị cho module Người quan trọng (ADR 0003). Một chỗ duy nhất giữ
 * quy tắc "≈ … (ước tính)" để không component nào lỡ in ra một con số trần.
 */

export function relationLabel(value: string): string {
  return RELATION_TYPES.find(r => r.value === value)?.label || 'Khác';
}

/** '1 lần/tháng'; '' khi chưa khai báo. `count: 0` vẫn là một câu trả lời. */
export function cadenceLabel(cadence: Cadence | null | undefined): string {
  if (!cadence || cadence.count === null || !cadence.per) return '';
  return `${cadence.count} lần/${CADENCE_PER_LABELS[cadence.per]}`;
}

/** '≈ 3,2 lần/năm' — luôn có dấu ≈, làm tròn một chữ số. */
export function perYearLabel(perYear: number | null | undefined): string {
  if (perYear === null || perYear === undefined) return '';
  const rounded = Math.round(perYear * 10) / 10;
  return `≈ ${String(rounded).replace('.', ',')} lần/năm`;
}

export function lastMetLabel(person: Person): string {
  const days = person.stats?.daysSinceLast;
  if (days === null || days === undefined) return 'Chưa ghi lần gặp nào';
  if (days <= 0) return 'Gặp hôm nay';
  if (days === 1) return 'Gặp hôm qua';
  if (days < 60) return `Gặp ${days} ngày trước`;
  if (days < 730) return `Gặp ${Math.round(days / 30)} tháng trước`;
  return `Gặp ${Math.round(days / 365)} năm trước`;
}

/**
 * '≈ 80 lần nữa (ước tính)', hoặc null = KHÔNG hiển thị.
 *
 * Ẩn khi chưa nhập số năm (app không bao giờ tự giả định) và khi kết quả là
 * 0 — "≈ 0 lần nữa" không giúp ai làm gì cả.
 */
export function remainingLabel(person: Person): string | null {
  const n = person.stats?.estimatedRemaining;
  if (n === null || n === undefined || n <= 0) return null;
  return `≈ ${n} lần nữa (ước tính)`;
}
