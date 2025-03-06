import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, FormGroupDirective, UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { AuthService } from '@services/_index';
import { Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { CONSTANT } from '@shared/constant';
import { showNoti } from '@shared/common';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: UntypedFormGroup;
  username = '';
  password = '';
  matcher = new MyErrorStateMatcher();
  isLoadingResults = false;
  isRunning = false;
  isShowPassword = false;
  countClick = 0;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  onFormSubmit(form: NgForm) {
    this.isRunning = true;
    this.authService.login(form)
      .subscribe(res => {
        this.isRunning = false;
        if (res.token) {
          localStorage.setItem(CONSTANT.TOKEN, res.token);
          this.router.navigate(['/admin/dashboard']);
          showNoti('Login success!', 'success');
        }
      }, (err) => {
        this.isRunning = false;
      });
  }

  register() {
    this.router.navigate(['register']);
  }
  resetPassword() {
    this.router.navigate(['reset-password']);
  }

  showPassword() {
    this.isShowPassword = true;
    this.countClick += 1;
  }

  hidePassword() {
    this.isShowPassword = false;
    this.countClick += 1;
  }
  toggleShowPassword() {
    this.isShowPassword = !this.isShowPassword;
  }

}
