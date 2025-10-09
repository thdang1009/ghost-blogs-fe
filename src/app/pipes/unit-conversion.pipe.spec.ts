import { UnitConversionPipe } from './unit-conversion.pipe';

describe('UnitConversionPipe', () => {
  let pipe: UnitConversionPipe;

  beforeEach(() => {
    pipe = new UnitConversionPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should convert bytes to kilobytes', () => {
    const result = pipe.transform(1024, 'B-kB');
    expect(result).toBe(1);
  });

  it('should convert kilobytes to bytes', () => {
    const result = pipe.transform(1, 'kB-B');
    expect(result).toBe(1024);
  });

  it('should convert bytes to megabytes', () => {
    const result = pipe.transform(1048576, 'B-MB'); // 1024 * 1024
    expect(result).toBe(1);
  });

  it('should convert megabytes to kilobytes', () => {
    const result = pipe.transform(1, 'MB-kB');
    expect(result).toBe(1024);
  });

  it('should convert bytes to gigabytes', () => {
    const result = pipe.transform(1073741824, 'B-GB'); // 1024^3
    expect(result).toBe(1);
  });

  it('should convert gigabytes to megabytes', () => {
    const result = pipe.transform(1, 'GB-MB');
    expect(result).toBe(1024);
  });

  it('should handle same unit conversion', () => {
    const result = pipe.transform(100, 'MB-MB');
    expect(result).toBe(100);
  });

  it('should floor the result', () => {
    // 1500 bytes = 1.46484375 kB, should be floored to 1
    const result = pipe.transform(1500, 'B-kB');
    expect(result).toBe(1);
  });

  it('should handle zero values', () => {
    const result = pipe.transform(0, 'B-MB');
    expect(result).toBe(0);
  });

  it('should convert large values correctly', () => {
    const result = pipe.transform(5, 'GB-MB');
    expect(result).toBe(5120); // 5 * 1024
  });
});
