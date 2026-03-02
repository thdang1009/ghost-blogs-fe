import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertComponent } from './alert.component';
import { AlertService } from './alert.service';
import { Alert, AlertType } from '@models/_index';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let alertSubject: Subject<Alert>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;

  beforeEach(async () => {
    alertSubject = new Subject<Alert>();
    alertServiceSpy = jasmine.createSpyObj('AlertService', [
      'onAlert',
      'clear',
      'error',
    ]);
    alertServiceSpy.onAlert.and.returnValue(alertSubject.asObservable());

    await TestBed.configureTestingModule({
      declarations: [AlertComponent],
      imports: [RouterTestingModule, BrowserAnimationsModule],
      providers: [{ provide: AlertService, useValue: alertServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Alert subscription ────────────────────────────────────────────────────────

  describe('alert subscription', () => {
    it('adds a new alert to the list when received', () => {
      const alert = new Alert({
        type: AlertType.Success,
        message: 'Saved!',
        autoClose: false,
      });
      alertSubject.next(alert);
      expect(component.alerts.length).toBe(1);
      expect(component.alerts[0].message).toBe('Saved!');
    });

    it('clears alerts without keepAfterRouteChange on empty message', () => {
      component.alerts = [
        new Alert({ message: 'A' }),
        new Alert({ message: 'B', keepAfterRouteChange: true }),
      ];
      alertSubject.next(new Alert({})); // empty message triggers clear
      expect(component.alerts.length).toBe(1);
      expect(component.alerts[0].message).toBe('B');
    });

    it('auto-closes an alert after its timer expires', fakeAsync(() => {
      const alert = new Alert({
        type: AlertType.Info,
        message: 'Auto close',
        autoClose: true,
        timer: 1000,
      });
      alertSubject.next(alert);
      expect(component.alerts.length).toBe(1);

      tick(1100);
      expect(component.alerts.length).toBe(0);
    }));
  });

  // ── removeAlert ───────────────────────────────────────────────────────────────

  describe('removeAlert()', () => {
    it('removes the specified alert', () => {
      const alert = new Alert({ message: 'Remove me', autoClose: false });
      component.alerts = [alert];
      component.removeAlert(alert);
      expect(component.alerts.length).toBe(0);
    });

    it('does nothing when alert is not in the list', () => {
      const alert = new Alert({ message: 'Not in list', autoClose: false });
      const other = new Alert({ message: 'Keep me', autoClose: false });
      component.alerts = [other];
      component.removeAlert(alert); // should be a no-op
      expect(component.alerts.length).toBe(1);
    });
  });

  // ── cssClass ──────────────────────────────────────────────────────────────────

  describe('cssClass()', () => {
    it('returns "alert alert-dismissible alert-success" for Success type', () => {
      const alert = new Alert({ type: AlertType.Success });
      expect(component.cssClass(alert)).toContain('alert-success');
    });

    it('returns "alert-danger" for Error type', () => {
      const alert = new Alert({ type: AlertType.Error });
      expect(component.cssClass(alert)).toContain('alert-danger');
    });

    it('returns "alert-info" for Info type', () => {
      const alert = new Alert({ type: AlertType.Info });
      expect(component.cssClass(alert)).toContain('alert-info');
    });

    it('returns "alert-warning" for Warning type', () => {
      const alert = new Alert({ type: AlertType.Warning });
      expect(component.cssClass(alert)).toContain('alert-warning');
    });

    it('includes "fade" class when alert.fade is true', () => {
      const alert = new Alert({ type: AlertType.Success, fade: true });
      expect(component.cssClass(alert)).toContain('fade');
    });

    it('returns empty string for a null/undefined alert', () => {
      expect(component.cssClass(null as unknown as Alert)).toBe('');
    });
  });

  // ── getIconClass ──────────────────────────────────────────────────────────────

  describe('getIconClass()', () => {
    it('returns "check_circle" for Success', () => {
      expect(
        component.getIconClass(new Alert({ type: AlertType.Success }))
      ).toBe('check_circle');
    });

    it('returns "error" for Error', () => {
      expect(component.getIconClass(new Alert({ type: AlertType.Error }))).toBe(
        'error'
      );
    });

    it('returns "info" for Info', () => {
      expect(component.getIconClass(new Alert({ type: AlertType.Info }))).toBe(
        'info'
      );
    });

    it('returns "warning" for Warning', () => {
      expect(
        component.getIconClass(new Alert({ type: AlertType.Warning }))
      ).toBe('warning');
    });

    it('returns "notifications" as fallback for undefined type', () => {
      expect(component.getIconClass(new Alert({}))).toBe('notifications');
    });
  });

  // ── lifecycle ─────────────────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('unsubscribes from alert service on destroy', () => {
      spyOn(component.alertSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.alertSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
