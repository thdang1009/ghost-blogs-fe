import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators, NgForm, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '@services/_index';
import { showNoti } from '@shared/common';
import { MyErrorStateMatcher } from '../login/login.component';

@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit {

  changePasswordForm!: UntypedFormGroup;
  username = '';
  password = '';
  matcher = new MyErrorStateMatcher();
  isLoadingResults = false;
  isRunning = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.changePasswordForm = this.formBuilder.group({
      oldPassword: [null, Validators.required],
      password: [null, Validators.required],
      confirmPassword: [null, Validators.required]
    }, { validators: this.checkReasswords });
  }

  checkReasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true }
  }


  onFormSubmit(form: NgForm) {
    this.isRunning = true;
    this.authService.changePassword(form)
      .subscribe(res => {
        this.isRunning = false;
        this.router.navigate(['/admin/dashboard']);
        showNoti('Update Password success!', 'success');
      }, (err) => {
        this.isRunning = false;
        showNoti('Update Password failed!', 'error');
      });
  }

}
