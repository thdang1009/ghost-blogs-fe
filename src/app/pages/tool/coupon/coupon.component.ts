import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Coupon, Reward } from '@models/_index';
import { CouponService, RewardService, AuthService } from '@services/_index';
import { showNoti, compareWithFunc } from '@shared/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss']
})
export class CouponComponent implements OnInit {
  coupons: Coupon[] = [];
  pendingRewards: Reward[] = [];

  couponForm: UntypedFormGroup;
  rewardForm: UntypedFormGroup;
  bulkForm: UntypedFormGroup;
  redeemForm: UntypedFormGroup;
  compareWithFunc = compareWithFunc;

  isEditing = false;
  editingCouponId: string | null = null;
  editingRewardId: string | null = null;

  userEmail: string = '';
  canManageCoupons = false;
  canRedeemCoupons = false;

  selectedCoupons: Set<string> = new Set();
  selectedReward: string | null = null;

  // New properties for redemption info modal
  availableCouponCount = 0;
  selectedRedemptionOption: string | null = null;
  selectedRedemptionCouponCount = 0;

  statusOptions = ['unused', 'used'];

  constructor(
    private couponService: CouponService,
    private rewardService: RewardService,
    private authService: AuthService,
    private formBuilder: UntypedFormBuilder,
    private dialog: MatDialog
  ) {
    this.couponForm = this.formBuilder.group({
      description: ['', [Validators.required, Validators.maxLength(36)]],
      usagePurpose: [''],
      status: [null]
    });

    this.rewardForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.bulkForm = this.formBuilder.group({
      count: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    this.redeemForm = this.formBuilder.group({
      selectedRewardId: ['', Validators.required]
    });

    const userInfo = this.authService.getUserInfo();
    if (userInfo && userInfo.username) {
      console.log('dangth userInfo', userInfo);
      this.userEmail = userInfo.username;
      this.canManageCoupons = this.userEmail === 'mean.ghost.site@gmail.com';
      this.canRedeemCoupons = ['honghue.hr@gmail.com', 'mean.ghost.site@gmail.com'].includes(this.userEmail);
    }
  }

  ngOnInit(): void {
    this.loadCoupons();
    this.loadPendingRewards();
  }

  loadCoupons(): void {
    this.couponService.getCoupons().subscribe(
      (coupons) => {
        this.coupons = coupons;
      },
      (error) => {
        console.error('Error loading coupons', error);
        showNoti('Failed to load coupons', 'danger');
      }
    );
  }

  loadPendingRewards(): void {
    this.rewardService.getPendingRewards().subscribe(
      (rewards) => {
        this.pendingRewards = rewards;
      },
      (error) => {
        console.error('Error loading pending rewards', error);
        showNoti('Failed to load pending rewards', 'danger');
      }
    );
  }

  // Method to show the create coupon form
  showCreateCouponForm(): void {
    this.isEditing = true;
    this.editingCouponId = null;
    this.couponForm.reset();
  }

  editCoupon(coupon: Coupon): void {
    if (!this.canManageCoupons) return;

    this.isEditing = true;
    this.editingCouponId = coupon._id || null;
    this.couponForm.patchValue({
      description: coupon.description,
      usagePurpose: coupon.usagePurpose || '',
      status: coupon.status || 'unused'
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingCouponId = null;
    this.editingRewardId = null;
    this.couponForm.reset();
    this.rewardForm.reset();
  }

  saveCoupon(): void {
    if (!this.canManageCoupons || !this.couponForm.valid) return;
    console.log('dangth couponForm', this.couponForm.value);
    const couponData: Coupon = {
      description: this.couponForm.value.description,
      usagePurpose: this.couponForm.value.usagePurpose,
      status: this.couponForm.value.status
    };

    if (this.isEditing && this.editingCouponId) {
      this.couponService.updateCoupon(this.editingCouponId, couponData).subscribe(
        (result) => {
          showNoti('Coupon updated successfully', 'success');
          this.loadCoupons();
          this.cancelEdit();
        },
        (error) => {
          console.error('Error updating coupon', error);
          showNoti('Failed to update coupon', 'danger');
        }
      );
    } else {
      this.couponService.addCoupon(couponData).subscribe(
        (result) => {
          showNoti('Coupon added successfully', 'success');
          this.loadCoupons();
          this.cancelEdit();
        },
        (error) => {
          console.error('Error adding coupon', error);
          showNoti('Failed to add coupon', 'danger');
        }
      );
    }
  }

  deleteCoupon(coupon: Coupon): void {
    this.couponService.deleteCoupon(coupon._id!).subscribe(
      () => {
        showNoti('Coupon deleted successfully', 'success');
        this.loadCoupons();
      },
      (error) => {
        console.error('Error deleting coupon', error);
        showNoti('Failed to delete coupon', 'danger');
      }
    );
  }

  // Methods for coupon details using MatDialog
  showCouponDetails(coupon: Coupon): void {
    this.dialog.open(CouponDetailDialogComponent, {
      width: '700px',
      data: coupon
    });
  }

  // Methods for redemption info modal using MatDialog
  showRedemptionInfo(couponCount?: number): void {
    const isRedemptionMode = couponCount !== undefined;
    const dialogRef = this.dialog.open(RedemptionInfoDialogComponent, {
      width: '800px',
      data: {
        isRedemptionMode,
        availableCouponCount: couponCount || 0
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedRedemptionOption = result.option;
        this.selectedRedemptionCouponCount = result.requiredCoupons;
        this.confirmRedemption();
      }
    });
  }

  confirmRedemption(): void {
    if (!this.selectedRedemptionOption || !this.canRedeemCoupons || this.selectedCoupons.size === 0) {
      showNoti('Please select a reward option', 'warning');
      return;
    }

    const couponIds = Array.from(this.selectedCoupons).slice(0, this.selectedRedemptionCouponCount);

    const rewardData: Reward = {
      description: this.selectedRedemptionOption,
      couponCost: this.selectedRedemptionCouponCount,
      status: 'Pending',
      requestedBy: this.userEmail
    };

    this.rewardService.addReward(rewardData).subscribe(
      (createdReward: Reward) => {
        this.couponService.redeemCoupons(couponIds, createdReward._id!, createdReward.description).subscribe(
          () => {
            showNoti('Reward requested successfully', 'success');
            this.loadCoupons();
            this.loadPendingRewards();
            this.selectedCoupons.clear();
            this.selectedRedemptionOption = null;
          },
          (error: any) => {
            console.error('Error redeeming coupons', error);
            showNoti('Failed to redeem coupons', 'danger');
          }
        );
      },
      (error: any) => {
        console.error('Error creating reward', error);
        showNoti('Failed to create reward', 'danger');
      }
    );
  }

  editReward(reward: Reward): void {
    if (!this.canManageCoupons) return;

    this.editingRewardId = reward._id || null;
    this.rewardForm.patchValue({
      description: reward.description
    });
  }

  saveReward(): void {
    if (!this.canManageCoupons || !this.rewardForm.valid) return;

    const rewardData: Reward = {
      description: this.rewardForm.value.description,
      status: 'Pending' // Maintain the status
    };

    if (this.editingRewardId) {
      this.rewardService.updateReward(this.editingRewardId, rewardData).subscribe(
        (result) => {
          showNoti('Reward updated successfully', 'success');
          this.loadPendingRewards();
          this.editingRewardId = null;
          this.rewardForm.reset();
        },
        (error) => {
          console.error('Error updating reward', error);
          showNoti('Failed to update reward', 'danger');
        }
      );
    }
  }

  deleteReward(reward: Reward): void {
    if (!this.canManageCoupons || !reward._id) return;

    this.rewardService.deleteReward(reward._id!).subscribe(
      () => {
        showNoti('Reward deleted successfully', 'success');
        this.loadPendingRewards();
      },
      (error) => {
        console.error('Error deleting reward', error);
        showNoti('Failed to delete reward', 'danger');
      }
    );
  }

  bulkAddCoupons(): void {
    if (!this.canManageCoupons || !this.bulkForm.valid) return;

    const count = this.bulkForm.value.count;

    this.couponService.bulkAddCoupons(count).subscribe(
      (result) => {
        showNoti(`${count} coupons added successfully`, 'success');
        this.loadCoupons();
        this.bulkForm.patchValue({ count: 1 });
      },
      (error) => {
        console.error('Error adding coupons in bulk', error);
        showNoti('Failed to add coupons', 'danger');
      }
    );
  }

  toggleCouponSelection(couponId: string): void {
    if (!this.canRedeemCoupons) return;

    if (this.selectedCoupons.has(couponId)) {
      this.selectedCoupons.delete(couponId);
    } else {
      this.selectedCoupons.add(couponId);
    }
  }

  isCouponSelected(couponId: string): boolean {
    return this.selectedCoupons.has(couponId);
  }

  selectReward(rewardId: string): void {
    this.selectedReward = rewardId;
  }

  isRewardSelected(rewardId: string): boolean {
    return this.selectedReward === rewardId;
  }
}

// Dialog component for coupon details
@Component({
  selector: 'app-coupon-detail-dialog',
  template: `
    <h2 mat-dialog-title>Coupon Details</h2>
    <div mat-dialog-content>
      <div class="row">
        <div class="col-md-12 coupon-description-overlay">
          <img src="assets/img/coupon-blank.jpg" alt="Coupon" class="img-fluid coupon-image">
          <p>{{ data.description }}</p>
        </div>
        <div class="col-md-12">
          <p><strong>Status:</strong>
            <span [class]="data.status === 'used' ? 'text-danger' : 'text-success'">
              {{ data.status }}
            </span>
          </p>
          <p><strong>Usage Purpose:</strong> {{ data.usagePurpose || 'Not specified' }}</p>
          <p><strong>Created:</strong> {{ data.createdAt | date:'medium' }}</p>
        </div>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-dialog-close>Close</button>
    </div>
  `,
})
export class CouponDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CouponDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Coupon
  ) {
  }
}

// Dialog component for redemption info
@Component({
  selector: 'app-redemption-info-dialog',
  template: `
    <h2 mat-dialog-title>
      <span *ngIf="!data.isRedemptionMode">Coupon Redemption Guide</span>
      <span *ngIf="data.isRedemptionMode">Redeem {{ data.availableCouponCount }} Coupon(s) for a Reward</span>
    </h2>
    <div mat-dialog-content class="mat-typography">
      <div class="row">
        <div class="col-md-12">
          <h3 class="text-primary">Reward Options</h3>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Reward</th>
                  <th class="text-center">Coupons Required</th>
                  <th *ngIf="data.isRedemptionMode" class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reward of rewardOptions"
                  [class]="getRewardClass(reward)">
                  <td>{{ reward.name }}</td>
                  <td class="text-center">{{ reward.requiredCoupons }} phiếu</td>
                  <td *ngIf="data.isRedemptionMode" class="text-center">
                    <button *ngIf="reward.requiredCoupons <= data.availableCouponCount"
                            class="btn btn-sm"
                            [class]="selectedOption === reward.name ? 'btn-primary' : 'btn-outline-primary'"
                            (click)="selectOption(reward.name, reward.requiredCoupons)">
                      {{ selectedOption === reward.name ? 'Selected' : 'Select' }}
                    </button>
                    <span *ngIf="reward.requiredCoupons > data.availableCouponCount" class="text-muted">
                      Not enough coupons
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-dialog-close>Đóng</button>
      <button *ngIf="data.isRedemptionMode && selectedOption"
              color="primary"
              (click)="dialogRef.close({option: selectedOption, requiredCoupons: selectedRequiredCoupons})">
        Đổi
      </button>
    </div>
  `,
})
export class RedemptionInfoDialogComponent {
  selectedOption: string | null = null;
  selectedRequiredCoupons: number = 0;

  rewardOptions = [
    { name: 'Phiếu đổi một buổi massage mắt/chân thư giãn sau một ngày dài', requiredCoupons: 2 },
    { name: 'Phiếu đổi một buổi tối được Anh Đăng gội đầu và sấy tóc', requiredCoupons: 2 },
    { name: 'Phiếu đổi một buổi sáng được Anh Đăng chuẩn bị bữa ăn sáng tận giường (món ăn cầu kỳ hơn là chỉ chiên trứng và bánh mì)', requiredCoupons: 3 },
    { name: 'Phiếu đổi một lần Anh Đăng dọn dẹp nhà cửa toàn bộ', requiredCoupons: 4 },
    { name: 'Phiếu đổi một buổi tối được Anh Đăng đọc sách hoặc kể chuyện cho nghe trước khi ngủ', requiredCoupons: 1 },
    { name: 'Phiếu đổi một lần được pha cho một ly nước ép hoặc sinh tố đặc biệt', requiredCoupons: 1 },
    { name: 'Phiếu đổi một buổi chiều được Anh Đăng chở đi mua sắm quần áo và tư vấn lựa chọn', requiredCoupons: 3 },
    { name: 'Phiếu đổi một lần được Anh Đăng tự tay làm một món đồ handmade nhỏ xinh tặng vợ', requiredCoupons: 4 },
    { name: 'Phiếu đổi một buổi hẹn hò lãng mạn bất ngờ do Anh Đăng lên kế hoạch', requiredCoupons: 5 },
    { name: 'Phiếu đổi một buổi tối được Anh Đăng cùng Pé Huế chơi một trò chơi yêu thích', requiredCoupons: 1 }
  ];

  constructor(
    public dialogRef: MatDialogRef<RedemptionInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {isRedemptionMode: boolean, availableCouponCount: number}
  ) {}

  selectOption(option: string, requiredCoupons: number): void {
    this.selectedOption = option;
    this.selectedRequiredCoupons = requiredCoupons;
  }

  getRewardClass(reward: any): string {
    let classes = '';
    if (this.data.isRedemptionMode && reward.requiredCoupons > this.data.availableCouponCount) {
      classes += 'disabled-reward';
    } else if (this.data.isRedemptionMode && reward.requiredCoupons <= this.data.availableCouponCount) {
      classes += 'selectable-reward';
    }

    if (this.selectedOption === reward.name) {
      classes += ' selected-reward';
    }

    return classes;
  }
}
