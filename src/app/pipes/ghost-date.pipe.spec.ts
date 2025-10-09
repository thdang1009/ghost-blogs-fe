import { DatePipe } from '@angular/common';
import { SimpleTimePipe } from './ghost-date.pipe';

describe('SimpleTimePipe', () => {
  let pipe: SimpleTimePipe;
  let datePipe: DatePipe;

  beforeEach(() => {
    datePipe = new DatePipe('en-US');
    pipe = new SimpleTimePipe(datePipe);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "Hôm nay" for today', () => {
    const today = new Date().toISOString();
    const result = pipe.transform(today);
    expect(result).toBe('Hôm nay');
  });

  it('should return "Hôm qua" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = pipe.transform(yesterday.toISOString());
    expect(result).toBe('Hôm qua');
  });

  it('should return "Ngày mai" for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = pipe.transform(tomorrow.toISOString());
    expect(result).toBe('Ngày mai');
  });

  it('should return formatted date (dd-MM) for other dates', () => {
    const date = new Date('2024-12-25');
    const result = pipe.transform(date.toISOString());
    expect(result).toBe('25-12');
  });

  it('should return formatted date for past dates', () => {
    const date = new Date('2024-01-15');
    const result = pipe.transform(date.toISOString());
    expect(result).toBe('15-01');
  });

  it('should return formatted date for future dates (not tomorrow)', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const result = pipe.transform(futureDate.toISOString());
    // Should return dd-MM format
    expect(result).toMatch(/^\d{2}-\d{2}$/);
  });
});
