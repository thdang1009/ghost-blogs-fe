// change-password.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password.component';
import { AuthService } from '@services/_index';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['changePassword']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ChangePasswordComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.changePasswordForm.value).toEqual({
      oldPassword: null,
      password: null,
      confirmPassword: null,
    });
  });

  it('should make the old password field required', () => {
    const oldPasswordControl = component.changePasswordForm.get('oldPassword');
    oldPasswordControl?.setValue('');
    expect(oldPasswordControl?.valid).toBeFalsy();
  });

  it('should make the password field required and have a minimum length', () => {
    const passwordControl = component.changePasswordForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should make the confirm password field required', () => {
    const confirmPasswordControl = component.changePasswordForm.get('confirmPassword');
    confirmPasswordControl?.setValue('');
    expect(confirmPasswordControl?.valid).toBeFalsy();
  });

  it('should validate that password and confirm password match', () => {
    component.changePasswordForm.get('oldPassword')?.setValue('password123');
    component.changePasswordForm.get('password')?.setValue('password123');
    component.changePasswordForm.get('confirmPassword')?.setValue('password123');
    expect(component.changePasswordForm.valid).toBeTruthy();

    component.changePasswordForm.get('confirmPassword')?.setValue('differentPassword');
    expect(component.changePasswordForm.valid).toBeFalsy();
  });

  it('should call changePassword and navigate on successful submission', () => {
    authService.changePassword.and.returnValue(of({})); // Mock successful response
    component.changePasswordForm.setValue({
      oldPassword: 'oldPassword123',
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    component.onFormSubmit(component.changePasswordForm.value);

    expect(authService.changePassword).toHaveBeenCalledWith(component.changePasswordForm.value);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should show error notification on failed submission', () => {
    authService.changePassword.and.returnValue(throwError('Error')); // Mock error response
    spyOn(window, 'alert'); // Mock notification function

    component.changePasswordForm.setValue({
      oldPassword: 'oldPassword123',
      password: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    component.onFormSubmit(component.changePasswordForm.value);

    expect(authService.changePassword).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled(); // Should not navigate on error
  });
});
