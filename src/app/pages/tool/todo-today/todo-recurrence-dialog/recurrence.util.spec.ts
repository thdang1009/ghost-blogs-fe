import { MatDialogRef } from '@angular/material/dialog';
import { TodoRecurrence } from '@models/_index';
import {
  effectivePattern,
  recurrencePreview,
  weekdayUnion,
} from './recurrence.util';
import { TodoRecurrenceDialogComponent } from './todo-recurrence-dialog.component';

const gym = (): TodoRecurrence => ({
  ...new TodoRecurrence(),
  _id: 'gym',
  title: '🏋️ Tập',
  // Cố tình LỆCH khỏi biến thể — đúng kiểu dữ liệu đã gây ra lỗi.
  pattern: { type: 'DAYS_OF_WEEK', daysOfWeek: [1, 2, 3, 4, 6] },
  rotationMode: 'WEEKDAY',
  rotation: [
    {
      label: 'Đẩy',
      daysOfWeek: [1, 5],
      meta: {
        targetMinutes: 50,
        exercises: [{ name: 'Hít đất', sets: 3, reps: 'tối đa' }],
      },
    },
    { label: 'Kéo', daysOfWeek: [2] },
  ],
  meta: { kind: 'WORKOUT' },
});

describe('recurrence.util — lịch WEEKDAY suy ra từ biến thể', () => {
  it('weekdayUnion là hợp các thứ, sắp tăng dần', () => {
    expect(weekdayUnion(gym().rotation)).toEqual([1, 2, 5]);
    expect(weekdayUnion([])).toEqual([]);
  });

  it('effectivePattern bỏ qua pattern đã lưu ở chế độ WEEKDAY', () => {
    expect(effectivePattern(gym())).toEqual({
      type: 'DAYS_OF_WEEK',
      daysOfWeek: [1, 2, 5],
    });
  });

  it('CYCLE giữ nguyên pattern', () => {
    const rec = { ...gym(), rotationMode: 'CYCLE' as const };
    expect(effectivePattern(rec)).toBe(rec.pattern);
  });

  it('câu xem trước nói đúng lịch sẽ chạy, kể cả ngày nghỉ', () => {
    expect(recurrencePreview(gym())).toBe(
      'T2, T3, T6 — T2, T6 Đẩy, T3 Kéo. Nghỉ T4, T5, T7, CN.'
    );
  });

  it('CYCLE: "Next" quay vòng giống server', () => {
    const rec: TodoRecurrence = {
      ...new TodoRecurrence(),
      title: '📖 Read',
      pattern: { type: 'DAILY' },
      rotation: [{ label: 'DDIA' }, { label: 'Essentialism' }],
      rotationIndex: 3,
    };
    expect(recurrencePreview(rec)).toContain('Next: Essentialism.');
  });
});

describe('TodoRecurrenceDialogComponent — sửa lịch tập', () => {
  let closed: TodoRecurrence | null | undefined;
  const ref = {
    close: (value: TodoRecurrence | null) => (closed = value),
  } as unknown as MatDialogRef<TodoRecurrenceDialogComponent>;

  const open = (recurrence: TodoRecurrence) =>
    new TodoRecurrenceDialogComponent(ref, { recurrence });

  beforeEach(() => (closed = undefined));

  it('lưu ở chế độ WEEKDAY thì pattern = hợp các thứ của biến thể', () => {
    const dialog = open(gym());
    dialog.toggleVariantDay(1, 4); // Kéo thêm T5
    dialog.save();

    expect(closed!.pattern).toEqual({
      type: 'DAYS_OF_WEEK',
      daysOfWeek: [1, 2, 4, 5],
    });
  });

  it('thêm bài tập chỉ chạm vào `exercises`, giữ các khoá meta khác', () => {
    const dialog = open(gym());
    const push = dialog.model.rotation[0];
    dialog.addExercise(push);
    dialog.exercisesOf(push)[1].name = 'Đẩy vai';
    dialog.save();

    expect(closed!.rotation[0].meta).toEqual({
      targetMinutes: 50,
      exercises: [
        { name: 'Hít đất', sets: 3, reps: 'tối đa' },
        { name: 'Đẩy vai', sets: 3, reps: '' },
      ],
    });
  });

  it('dòng bài tập chưa đặt tên bị bỏ khi lưu', () => {
    const dialog = open(gym());
    dialog.addExercise(dialog.model.rotation[1]);
    dialog.save();
    expect(closed!.rotation[1].meta).toEqual({ exercises: [] });
  });

  it('sửa rồi Huỷ KHÔNG làm đổi object gốc', () => {
    const source = gym();
    const dialog = open(source);
    dialog.exercisesOf(dialog.model.rotation[0])[0].name = 'Đã sửa';
    dialog.removeExercise(dialog.model.rotation[0], 0);
    dialog.cancel();

    expect(closed).toBeNull();
    expect(
      (source.rotation[0].meta!['exercises'] as { name: string }[])[0].name
    ).toBe('Hít đất');
  });

  it('WEEKDAY mà không còn biến thể nào thì không cho lưu', () => {
    const dialog = open(gym());
    dialog.removeVariant(1);
    dialog.removeVariant(0);
    expect(dialog.canSave).toBe(false);
  });

  it('vòng đọc sách không hiện ô bài tập', () => {
    const dialog = open({
      ...new TodoRecurrence(),
      title: '📖 Read',
      meta: { kind: 'READING' },
    });
    expect(dialog.showsExercises).toBe(false);
    expect(open(gym()).showsExercises).toBe(true);
  });
});
