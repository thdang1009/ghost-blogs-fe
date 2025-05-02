import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tag, Subscription } from '@models/_index';
import { AlertService, AuthService, SubscriptionService } from '@services/_index';

@Component({
  selector: 'app-tag-subscribe',
  templateUrl: './tag-subscribe.component.html',
  styleUrls: ['./tag-subscribe.component.scss']
})
export class TagSubscribeComponent implements OnInit {
  @Input() tags: Tag[] = [];
  isLoggedIn = false;
  userInfo: any;
  emailForm: FormGroup;
  isSubmitting = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLogin();
    if (this.isLoggedIn) {
      this.userInfo = this.authService.getUserInfo();
    }
  }

  /**
   * Subscribe to tags
   * For logged in users, uses their ID
   * For guests, opens a dialog to collect email
   */
  subscribeToTags(): void {
    if (this.isLoggedIn) {
      this.subscribeLoggedInUser();
    } else {
      this.openEmailDialog();
    }
  }

  /**
   * Subscribe a logged in user to tags
   */
  private subscribeLoggedInUser(): void {
    if (!this.userInfo || !this.userInfo._id) {
      this.alertService.error('You must be logged in to subscribe');
      return;
    }

    const tagIds = this.tags.map(tag => tag._id);

    if (!tagIds.length) {
      this.alertService.error('No tags to subscribe to');
      return;
    }

    const subscription: Subscription = {
      userId: this.userInfo._id,
      subscribe: tagIds as string[]
    };

    this.subscriptionService.subscribe(subscription)
      .subscribe(
        response => {
          this.alertService.success('You have successfully subscribed to these tags');
        },
        error => {
          console.error('Subscription error:', error);
          this.alertService.error('Failed to subscribe to tags. Please try again later.');
        }
      );
  }

  /**
   * Open dialog to collect email for guest subscription
   */
  private openEmailDialog(): void {
    const dialogRef = this.dialog.open(EmailDialogComponent, {
      width: '350px',
      data: { tags: this.tags }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.alertService.success('You have successfully subscribed to these tags.');
      }
    });
  }
}

@Component({
  selector: 'app-email-dialog',
  template: `
    <h2 mat-dialog-title>Subscribe to Tags</h2>
    <div mat-dialog-content>
      <p>Enter your email to subscribe to these tags:</p>
      <ul class="tag-list">
        <li *ngFor="let tag of data.tags">{{tag.name}}</li>
      </ul>
      <form [formGroup]="emailForm">
        <mat-form-field appearance="outline" style="width: 100%">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="your-email@example.com">
          <mat-error *ngIf="emailForm.get('email')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="emailForm.get('email')?.hasError('email')">Please enter a valid email address</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="{ success: false }">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="emailForm.invalid || isSubmitting" (click)="submitEmail()">
        <span *ngIf="isSubmitting">Subscribing...</span>
        <span *ngIf="!isSubmitting">Subscribe</span>
      </button>
    </div>
  `,
  styles: [`
    .tag-list {
      margin-bottom: 16px;
      padding-left: 20px;
    }
  `]
})
export class EmailDialogComponent {
  emailForm: FormGroup;
  isSubmitting = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tags: Tag[] }
  ) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submitEmail(): void {
    if (this.emailForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const email = this.emailForm.value.email;
    const tagIds = this.data.tags.map(tag => tag._id);

    const subscription: Subscription = {
      email: email,
      subscribe: tagIds as string[]
    };

    this.subscriptionService.subscribe(subscription)
      .subscribe(
        response => {
          this.isSubmitting = false;
          this.dialogRef.close({ success: true, email: email });
        },
        error => {
          this.isSubmitting = false;
          console.error('Subscription error:', error);
          // Keep dialog open to allow retry
        }
      );
  }
}
