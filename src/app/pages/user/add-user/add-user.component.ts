import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '@models/_index';
import { UserService, AlertService } from '@services/_index';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

export class MyErrorStateMatcherRepassword implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    const invalidCtrl = !!(
      control &&
      control.invalid &&
      (control.parent?.dirty || control.touched)
    );
    const invalidParent = !!(
      control &&
      control.parent &&
      control.parent.invalid &&
      control.parent.dirty
    );
    return !!(
      control &&
      (invalidCtrl || invalidParent) &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
})
export class AddUserComponent implements OnInit {
  registerForm!: UntypedFormGroup;
  fullName = '';
  username = '';
  password = '';
  repassword = '';
  isLoadingResults = false;
  matcher = new MyErrorStateMatcher();
  matcherRepassword = new MyErrorStateMatcherRepassword();
  permissions = ['ADMIN', 'MEMBER', 'GRAND_ADMIN'];
  permission = this.permissions[1];

  // Edit mode properties
  isEditMode = false;
  userId: string | null = null;
  currentUser: User | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // Check if this is edit mode
    this.route.queryParams.subscribe(params => {
      this.isEditMode = params['edit'] === 'true';
      this.userId = params['userId'];

      if (this.isEditMode && this.userId) {
        this.loadUserForEdit();
      }
    });

    this.initializeForm();
  }

  initializeForm() {
    // In edit mode, make password optional
    const passwordValidators = this.isEditMode ? [] : [Validators.required];

    this.registerForm = this.formBuilder.group(
      {
        fullName: [null, Validators.required],
        username: [null, Validators.required],
        password: [null, passwordValidators],
        repassword: [null, passwordValidators],
        permission: [this.permissions[1], Validators.required],
      },
      {
        validators: this.isEditMode ? null : this.checkReasswords,
      }
    );
  }

  loadUserForEdit() {
    if (!this.userId) return;

    this.userService.getUser(this.userId).subscribe(
      user => {
        this.currentUser = user;
        this.registerForm.patchValue({
          fullName: user.fullName,
          username: user.username,
          permission: user.permission || this.permissions[1],
        });
        this.permission = user.permission || this.permissions[1];
      },
      err => {
        console.error('Error loading user:', err);
        this.alertService.showNoti('Failed to load user data', 'error');
        this.router.navigate(['/admin/user/user-list']);
      }
    );
  }

  checkReasswords: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('repassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  };

  onFormSubmit(data: any) {
    if (this.isEditMode) {
      this.updateUser(data);
    } else {
      this.createUser(data);
    }
  }

  createUser(data: any) {
    const newUser: User = {
      fullName: data.fullName,
      username: data.username,
      permission: data.permission,
      password: data.password,
    };
    this.userService.addUser(newUser).subscribe(
      user => {
        if (user && user.id) {
          this.alertService.showNoti(`Create success`, 'success');
          this.router.navigate(['/admin/user/user-list']);
        }
      },
      err => {
        console.log(err);
        this.alertService.showNoti(err.error?.msg || 'Create failed', 'error');
      }
    );
  }

  updateUser(data: any) {
    if (!this.userId) return;

    const updatedUser: User = {
      fullName: data.fullName,
      username: data.username,
      permission: data.permission,
    };

    // Only include password if it was provided
    if (data.password && data.password.trim()) {
      updatedUser.password = data.password;
    }

    this.userService.updateUser(this.userId, updatedUser).subscribe(
      result => {
        this.alertService.showNoti(`Update success`, 'success');
        this.router.navigate(['/admin/user/user-list']);
      },
      err => {
        console.log(err);
        this.alertService.showNoti(err.error?.msg || 'Update failed', 'error');
      }
    );
  }
}
