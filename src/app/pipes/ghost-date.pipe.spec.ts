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

  // ── Edge cases ──────────────────────────────────────────────────────────────

  it('should handle an ISO date string without a time component', () => {
    const result = pipe.transform('2020-03-15T00:00:00.000Z');
    expect(result).toMatch(/^\d{2}-\d{2}$/);
  });

  it('should return null for an empty string input', () => {
    // new Date('') is an Invalid Date; DatePipe returns null for it
    const result = pipe.transform('');
    expect(result).toBeNull();
  });

  it('should return a dd-MM string for a very old date', () => {
    const result = pipe.transform('2000-01-01T00:00:00.000Z');
    expect(result).toMatch(/^\d{2}-\d{2}$/);
  });

  it('should return a dd-MM string for a far-future date', () => {
    const result = pipe.transform('2099-12-31T00:00:00.000Z');
    expect(result).toMatch(/^\d{2}-\d{2}$/);
  });
});
