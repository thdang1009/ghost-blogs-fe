import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ApiConfigService } from './api-config.service';

describe('ApiConfigService', () => {
  let service: ApiConfigService;

  describe('Server-side rendering', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      service = TestBed.inject(ApiConfigService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should use localhost for SSR', () => {
      expect(service.apiUrl).toBe('http://localhost:3000');
    });

    it('should identify as server-side', () => {
      expect(service.isServerSide()).toBe(true);
      expect(service.isBrowserSide()).toBe(false);
    });

    it('should generate correct endpoint URLs for SSR', () => {
      expect(service.getApiUrl('/v1/post')).toBe('http://localhost:3000/v1/post');
      expect(service.getApiUrl('v1/auth')).toBe('http://localhost:3000/v1/auth');
      expect(service.getApiUrl()).toBe('http://localhost:3000');
    });
  });

  describe('Browser-side rendering', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(ApiConfigService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should identify as browser-side', () => {
      expect(service.isServerSide()).toBe(false);
      expect(service.isBrowserSide()).toBe(true);
    });

    it('should use environment API URL for browser', () => {
      // Note: This will use the test environment configuration
      expect(service.apiUrl).toMatch(/^https?:\/\//);
    });

    it('should generate correct endpoint URLs for browser', () => {
      const baseUrl = service.apiUrl;
      expect(service.getApiUrl('/v1/post')).toBe(`${baseUrl}/v1/post`);
      expect(service.getApiUrl('v1/auth')).toBe(`${baseUrl}/v1/auth`);
      expect(service.getApiUrl()).toBe(baseUrl);
    });
  });
});