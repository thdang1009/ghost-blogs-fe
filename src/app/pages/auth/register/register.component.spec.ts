// register.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { AuthService } from '@services/_index';
import { Router } from '@angular/router';
import { AlertService } from '@services/_index';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let alertService: jasmine.SpyObj<AlertService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['error']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AlertService, useValue: alertServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    alertService = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.registerForm.value).toEqual({
      fullName: null,
      username: null,
      password: null,
    });
  });

  it('should make the fullName field required', () => {
    const fullNameControl = component.registerForm.get('fullName');
    fullNameControl?.setValue('');
    expect(fullNameControl?.valid).toBeFalsy();
  });

  it('should make the username field required', () => {
    const usernameControl = component.registerForm.get('username');
    usernameControl?.setValue('');
    expect(usernameControl?.valid).toBeFalsy();
  });

  it('should make the password field required', () => {
    const passwordControl = component.registerForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
  });

  it('should call register and navigate on successful submission', () => {
    authService.register.and.returnValue(of({ token: 'test-token' })); // Mock successful response
    const fakeObj = {
      fullName: 'Test User',
      username: 'testuser',
      password: 'password123',
    }
    component.registerForm.setValue(fakeObj);

    component.onFormSubmit(component.registerForm.value);

    expect(authService.register).toHaveBeenCalledWith(fakeObj);
    expect(router.navigate).toHaveBeenCalledWith(['login'], {
      queryParams: { fromRegister: true }
    });
  });

  it('should show error notification on failed submission', () => {
    authService.register.and.returnValue(throwError({ error: 'Registration failed' })); // Mock error response
    spyOn(console, 'log'); // Mock console.log

    component.registerForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      password: 'password123',
    });

    component.onFormSubmit(component.registerForm.value);

    expect(authService.register).toHaveBeenCalled();
    expect(alertService.error).toHaveBeenCalledWith('Registration failed');
    expect(router.navigate).not.toHaveBeenCalled(); // Should not navigate on error
  });
});
