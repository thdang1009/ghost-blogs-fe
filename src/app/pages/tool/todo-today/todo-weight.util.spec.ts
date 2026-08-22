import { TodoToday } from '@models/_index';
import { effectiveWeight, sortTodos, weightMeta } from './todo-weight.util';

const todo = (id: number, weight?: number, order?: number): TodoToday => ({
  id,
  weight,
  order,
});

describe('effectiveWeight', () => {
  it('treats a missing weight as 3, not 0', () => {
    // Pre-v2 rows have no `weight` at all until the backfill runs. Reading
    // them as 0 would sink every old task to the bottom and put the wrong
    // item in the Focus Bar.
    expect(effectiveWeight({})).toBe(3);
    expect(effectiveWeight({ weight: undefined })).toBe(3);
    expect(effectiveWeight(null)).toBe(3);
    expect(effectiveWeight(undefined)).toBe(3);
  });

  it('falls back to 3 for a non-numeric weight rather than leaking NaN', () => {
    expect(effectiveWeight({ weight: NaN })).toBe(3);
    expect(effectiveWeight({ weight: 'high' as unknown as number })).toBe(3);
  });

  it('keeps a real weight', () => {
    expect(effectiveWeight({ weight: 5 })).toBe(5);
    expect(effectiveWeight({ weight: 1 })).toBe(1);
  });
});

describe('weightMeta', () => {
  it('maps each level to its label and colour', () => {
    expect(weightMeta(5).label).toBe('Must today');
    expect(weightMeta(1).label).toBe('Someday');
    expect(weightMeta(4).color).toBe('#E7FAFD');
  });

  it('falls back to Normal for an out-of-range value', () => {
    expect(weightMeta(9).label).toBe('Normal');
    expect(weightMeta(0).label).toBe('Normal');
  });
});

describe('sortTodos', () => {
  it('orders by weight desc, then order asc', () => {
    const sorted = sortTodos([todo(1, 2, 1), todo(2, 5, 20), todo(3, 5, 10)]);
    expect(sorted.map(t => t.id)).toEqual([3, 2, 1]);
  });

  it('places an un-backfilled row at weight 3, not last', () => {
    const sorted = sortTodos([
      todo(1, 5, 1),
      todo(2, undefined, 1),
      todo(3, 1, 1),
    ]);
    expect(sorted.map(t => t.id)).toEqual([1, 2, 3]);
  });

  it('falls back to pure manual order when sortByWeight is off', () => {
    const sorted = sortTodos([todo(1, 1, 1), todo(2, 5, 9)], false);
    expect(sorted.map(t => t.id)).toEqual([1, 2]);
  });

  it('breaks ties by id so repeated sorts are stable', () => {
    const input = [todo(9, 3, 5), todo(2, 3, 5), todo(5, 3, 5)];
    expect(sortTodos(input).map(t => t.id)).toEqual([2, 5, 9]);
    expect(sortTodos(input).map(t => t.id)).toEqual([2, 5, 9]);
  });

  it('does not mutate the input array', () => {
    const input = [todo(2, 1, 1), todo(1, 5, 1)];
    sortTodos(input);
    expect(input.map(t => t.id)).toEqual([2, 1]);
  });
});

describe('Focus Bar selection', () => {
  // The Focus Bar always ranks by weight, even when the main list is in
  // manual drag order — otherwise it is just "the first row" and the whole
  // point of the feature is lost.
  const pickFocus = (items: TodoToday[], count: number) =>
    sortTodos(items, true).slice(0, count);

  it('picks the heaviest open item regardless of manual order', () => {
    const items = [todo(1, 1, 1), todo(2, 5, 99)];
    expect(pickFocus(items, 1).map(t => t.id)).toEqual([2]);
  });

  it('respects focusCount', () => {
    const items = [todo(1, 2, 1), todo(2, 5, 1), todo(3, 4, 1)];
    expect(pickFocus(items, 2).map(t => t.id)).toEqual([2, 3]);
  });

  it('returns nothing when there is nothing open', () => {
    expect(pickFocus([], 3)).toEqual([]);
  });
});
