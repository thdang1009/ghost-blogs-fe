import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '@services/_index';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['resetPassword', 'setNewPassword']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
    component.state = 2;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.resetPasswordForm.value).toEqual({
      email: null,
      password: null,
      confirmPassword: null,
      otp: null,
    });
  });

  it('should make the email field required and validate email format', () => {
    const emailControl = component.resetPasswordForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should make the password field required', () => {
    const passwordControl = component.resetPasswordForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
  });

  it('should make the confirm password field required', () => {
    const confirmPasswordControl = component.resetPasswordForm.get('confirmPassword');
    confirmPasswordControl?.setValue('');
    expect(confirmPasswordControl?.valid).toBeFalsy();
  });

  it('should validate that password and confirm password match', () => {
    component.resetPasswordForm.get('password')?.setValue('password123');
    component.resetPasswordForm.get('confirmPassword')?.setValue('password123');
    expect(component.resetPasswordForm.hasError('notSame')).toBeFalsy();

    component.resetPasswordForm.get('confirmPassword')?.setValue('differentPassword');
    expect(component.resetPasswordForm.hasError('notSame')).toBeTruthy();
  });

  it('should call resetPassword and navigate on successful submission', () => {
    authService.resetPassword.and.returnValue(of({})); // Mock successful response
    authService.setNewPassword.and.returnValue(of({})); // Mock successful response
    const fakeObj = {
      email: 'test@example.com',
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
      otp: '123456',
    }
    component.resetPasswordForm.setValue(fakeObj);

    component.callSentOTP(component.resetPasswordForm.value);

    expect(authService.resetPassword).toHaveBeenCalledWith(fakeObj);
    expect(authService.setNewPassword).not.toHaveBeenCalled();
  });

  it('should show error notification on failed submission', () => {
    authService.resetPassword.and.returnValue(throwError({ error: 'Reset failed' })); // Mock error response
    authService.setNewPassword.and.returnValue(throwError({ error: 'Reset failed' })); // Mock error response

    const fakeObj = {
      email: 'test@example.com',
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
      otp: '123456',
    }
    component.resetPasswordForm.setValue(fakeObj);

    component.callSentOTP(component.resetPasswordForm.value);

    expect(authService.resetPassword).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled(); // Should not navigate on error
  });
});
