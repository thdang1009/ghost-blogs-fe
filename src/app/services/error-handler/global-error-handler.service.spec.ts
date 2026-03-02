import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { GlobalErrorHandlerService } from './global-error-handler.service';
import { AlertService } from '@components/alert/alert.service';

describe('GlobalErrorHandlerService', () => {
  let service: GlobalErrorHandlerService;
  let alertSpy: jasmine.SpyObj<AlertService>;
  let zone: NgZone;

  beforeEach(() => {
    alertSpy = jasmine.createSpyObj('AlertService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandlerService,
        { provide: AlertService, useValue: alertSpy },
      ],
    });

    service = TestBed.inject(GlobalErrorHandlerService);
    zone = TestBed.inject(NgZone);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Non-HTTP errors ───────────────────────────────────────────────────────────

  describe('handleError() — non-HTTP errors', () => {
    it('logs unexpected errors to the console without alerting the user', () => {
      spyOn(console, 'error');
      service.handleError(new Error('something broke'));
      expect(console.error).toHaveBeenCalled();
      expect(alertSpy.error).not.toHaveBeenCalled();
    });

    it('handles string errors gracefully', () => {
      expect(() => service.handleError('a plain string error')).not.toThrow();
    });

    it('handles null/undefined gracefully', () => {
      expect(() => service.handleError(null)).not.toThrow();
    });
  });

  // ── HTTP errors — alert messages ──────────────────────────────────────────────

  const httpCases: Array<{ status: number; fragment: string }> = [
    { status: 0, fragment: 'Network error' },
    { status: 400, fragment: 'Invalid request' },
    { status: 401, fragment: 'Session expired' },
    { status: 403, fragment: 'permission' },
    { status: 404, fragment: 'not found' },
    { status: 409, fragment: 'Conflict' },
    { status: 422, fragment: 'Validation failed' },
    { status: 429, fragment: 'Too many requests' },
    { status: 500, fragment: 'Server error' },
    { status: 502, fragment: 'unavailable' },
    { status: 503, fragment: 'unavailable' },
    { status: 418, fragment: '418' }, // unknown → default message
  ];

  describe('handleError() — HTTP errors', () => {
    httpCases.forEach(({ status, fragment }) => {
      it(`shows an alert containing "${fragment}" for HTTP ${status}`, () => {
        const error = new HttpErrorResponse({
          status,
          url: '/api/test',
          error: 'Error',
        });
        zone.run(() => service.handleError(error));
        expect(alertSpy.error).toHaveBeenCalledWith(
          jasmine.stringContaining(fragment)
        );
      });
    });

    it('logs HTTP errors to the console', () => {
      spyOn(console, 'error');
      const error = new HttpErrorResponse({ status: 500, url: '/api/test' });
      zone.run(() => service.handleError(error));
      expect(console.error).toHaveBeenCalled();
    });
  });
});
