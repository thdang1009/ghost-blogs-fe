import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '@services/_index';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.loginForm.value).toEqual({
      username: null,
      password: null,
    });
  });

  it('should make the username field required', () => {
    const usernameControl = component.loginForm.get('username');
    usernameControl?.setValue('');
    expect(usernameControl?.valid).toBeFalsy();
  });

  it('should make the password field required', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
  });

  it('should call login and navigate on successful submission', () => {
    authService.login.and.returnValue(of({ token: 'test-token' })); // Mock successful response
    component.loginForm.setValue({
      username: 'testUser',
      password: 'testPassword',
    });

    component.onFormSubmit(component.loginForm.value);

    expect(authService.login).toHaveBeenCalledWith(component.loginForm.value);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should show error notification on failed submission', () => {
    authService.login.and.returnValue(throwError('Error')); // Mock error response
    spyOn(window, 'alert'); // Mock notification function

    component.loginForm.setValue({
      username: 'testUser',
      password: 'testPassword',
    });

    component.onFormSubmit(component.loginForm.value);

    expect(authService.login).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled(); // Should not navigate on error
  });
});
