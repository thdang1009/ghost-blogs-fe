import { TodoToday } from '@models/_index';
import {
  FOCUS_BAR_RENDERED,
  TodoFocusBarComponent,
  focusBarItems,
  listBelowFocusBar,
} from './todo-focus-bar.component';

const todo = (id: number, content = `task ${id}`): TodoToday => ({
  id,
  content,
  weight: 6 - id,
});

const ids = (todos: TodoToday[]) => todos.map(t => t.id);

/**
 * Sinh ra sau một lỗi thật: danh sách bỏ MỌI id trong `focus`, nhưng thẻ chỉ
 * vẽ `focus[0]`. Với `focusCount` = 3, việc số 2 và số 3 không nằm trên thẻ
 * mà cũng không nằm trong danh sách — biến mất khỏi màn hình.
 */
describe('listBelowFocusBar — chỉ bỏ việc thẻ THỰC SỰ vẽ', () => {
  const today = [todo(1), todo(2), todo(3), todo(4)];

  it('thẻ chỉ vẽ một việc', () => {
    expect(FOCUS_BAR_RENDERED).toBe(1);
    expect(ids(focusBarItems(today.slice(0, 3)))).toEqual([1]);
  });

  it('focusCount = 1: bỏ đúng việc trên thẻ', () => {
    const focus = today.slice(0, 1);
    expect(ids(listBelowFocusBar(today, focus, true))).toEqual([2, 3, 4]);
  });

  it('focusCount = 3: việc số 2 và 3 VẪN nằm trong danh sách', () => {
    const focus = today.slice(0, 3);
    expect(ids(listBelowFocusBar(today, focus, true))).toEqual([2, 3, 4]);
  });

  it('mọi việc hôm nay xuất hiện đúng MỘT lần trên màn hình', () => {
    for (const focusCount of [1, 2, 3]) {
      const focus = today.slice(0, focusCount);
      const onScreen = [
        ...ids(focusBarItems(focus)),
        ...ids(listBelowFocusBar(today, focus, true)),
      ];
      expect(onScreen.sort()).toEqual([1, 2, 3, 4]);
    }
  });

  it('kéo-thả thủ công: trả ĐỦ danh sách để chỉ số kéo-thả khớp mảng thật', () => {
    const focus = today.slice(0, 3);
    expect(ids(listBelowFocusBar(today, focus, false))).toEqual([1, 2, 3, 4]);
  });

  it('không có việc nào trên thẻ thì không bỏ gì', () => {
    expect(ids(listBelowFocusBar(today, [], true))).toEqual([1, 2, 3, 4]);
  });
});

describe('TodoFocusBarComponent — thao tác trên thẻ', () => {
  let bar: TodoFocusBarComponent;

  beforeEach(() => {
    bar = new TodoFocusBarComponent();
    bar.focus = [todo(1, 'Viết ADR'), todo(2)];
  });

  it('contextLine đếm việc còn lại SAU thẻ', () => {
    bar.openCount = 4;
    expect(bar.contextLine).toBe('1 more at high weight · 4 open today');
  });

  it('sửa xong thì ghi vào chính object và phát contentChange', () => {
    const emitted: TodoToday[] = [];
    bar.contentChange.subscribe(t => emitted.push(t));

    bar.startEdit();
    bar.draft = '  Viết ADR 0003  ';
    bar.commitEdit();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toBe(bar.focus[0]);
    expect(bar.focus[0].content).toBe('Viết ADR 0003');
    expect(bar.editing).toBe(false);
  });

  it('không đổi gì, hoặc xoá trắng, thì không lưu', () => {
    const emitted: TodoToday[] = [];
    bar.contentChange.subscribe(t => emitted.push(t));

    bar.startEdit();
    bar.commitEdit();
    bar.startEdit();
    bar.draft = '   ';
    bar.commitEdit();

    expect(emitted.length).toBe(0);
    expect(bar.focus[0].content).toBe('Viết ADR');
  });

  it('blur sau Enter không lưu hai lần', () => {
    const emitted: TodoToday[] = [];
    bar.contentChange.subscribe(t => emitted.push(t));

    bar.startEdit();
    bar.draft = 'Mới';
    bar.commitEdit();
    bar.commitEdit();

    expect(emitted.length).toBe(1);
  });

  it('chọn weight phát cùng payload với todo-item-row; chọn lại mức cũ thì thôi', () => {
    const emitted: { todo: TodoToday; weight: number }[] = [];
    bar.weightChange.subscribe(e => emitted.push(e));

    bar.pickWeight(5); // đang là 5
    bar.pickWeight(2);

    expect(emitted).toEqual([{ todo: bar.focus[0], weight: 2 }]);
  });

  it('đang khoá thì không vào chế độ sửa', () => {
    bar.disabled = true;
    bar.startEdit();
    expect(bar.editing).toBe(false);
  });
});
