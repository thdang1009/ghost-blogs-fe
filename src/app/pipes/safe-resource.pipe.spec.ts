import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafePipe } from './safe-resource.pipe';

describe('SafePipe', () => {
  let pipe: SafePipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SafePipe],
    });
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafePipe(sanitizer);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return a safe resource URL', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    const result = pipe.transform(url);

    // Result should be a SafeResourceUrl object
    expect(result).toBeTruthy();
    expect(typeof result).toBe('object');
  });

  it('should handle empty string', () => {
    const result = pipe.transform('');
    expect(result).toBeTruthy();
  });

  it('should handle various URL formats', () => {
    const urls = [
      'https://example.com',
      'http://localhost:4200',
      '/assets/video.mp4',
      'blob:https://example.com/video',
    ];

    urls.forEach(url => {
      const result = pipe.transform(url);
      expect(result).toBeTruthy();
    });
  });
});
