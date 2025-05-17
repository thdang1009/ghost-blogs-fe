import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@services/_index';
import { User } from '@models/user';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
  userForm!: FormGroup;
  userData!: User;
  isLoading = false;
  isEditMode = false;
  errorMsg = '';
  successMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoading = true;
    // Use synchronous getUserInfo for now
    const user = this.authService.getUserInfo() as User;
    if (user) {
      this.userData = user;
      this.initForm(user);
      this.isLoading = false;
    } else {
      this.errorMsg = 'Failed to load user info.';
      this.isLoading = false;
    }
  }

  initForm(user: User): void {
    this.userForm = this.fb.group({
      username: [{ value: user.username, disabled: true }],
      email: [{ value: (user as any).email ?? '', disabled: true }],
      fullName: [user.fullName, [Validators.required, Validators.maxLength(50)]],
      bio: [(user as any).bio ?? '', [Validators.maxLength(200)]],
    });
    this.userForm.get('fullName')?.disable();
    this.userForm.get('bio')?.disable();
  }

  enableEdit(): void {
    this.isEditMode = true;
    this.userForm.get('fullName')?.enable();
    this.userForm.get('bio')?.enable();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.userForm.patchValue({
      fullName: this.userData.fullName,
      bio: (this.userData as any).bio ?? ''
    });
    this.userForm.get('fullName')?.disable();
    this.userForm.get('bio')?.disable();
    this.errorMsg = '';
    this.successMsg = '';
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;
    // No backend update, just update local form
    this.userData.fullName = this.userForm.value.fullName;
    (this.userData as any).bio = this.userForm.value.bio;
    this.successMsg = 'Profile updated locally.';
    this.isEditMode = false;
    this.userForm.get('fullName')?.disable();
    this.userForm.get('bio')?.disable();
  }
} 