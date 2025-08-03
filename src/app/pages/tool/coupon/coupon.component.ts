import { Component, OnInit, Inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Coupon, Reward } from '@models/_index';
import {
  AlertService,
  CouponService,
  RewardService,
  AuthService,
  ConfigService,
} from '@services/_index';
import { compareWithFunc } from '@shared/common';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss'],
})
export class CouponComponent implements OnInit {
  // All coupons
  coupons: Coupon[] = [];
  // Partner-specific coupons
  couponsA: Coupon[] = [];
  couponsB: Coupon[] = [];

  // All pending rewards
  pendingRewards: Reward[] = [];
  // Partner-specific pending rewards
  pendingRewardsA: Reward[] = [];
  pendingRewardsB: Reward[] = [];

  couponForm: UntypedFormGroup;
  rewardForm: UntypedFormGroup;
  bulkForm: UntypedFormGroup;
  redeemForm: UntypedFormGroup;
  compareWithFunc = compareWithFunc;

  isEditing = false;
  showingBulkForm = false;
  editingCouponId: string | null = null;
  editingRewardId: string | null = null;
  editingRewardPartner: 'A' | 'B' | null = null;

  // Current active partner in the UI
  currentActiveTab: 'A' | 'B' = 'A';

  userEmail: string = '';
  // Partner-specific permissions
  isPartnerA = false;
  isPartnerB = false;
  canRedeemAsPartnerA = true; // Pé Huế can redeem both A and B
  canRedeemAsPartnerB = true; // Anh Đăng can redeem both A and B

  // Partner-specific coupon selections
  selectedCouponsA: Set<string> = new Set();
  selectedCouponsB: Set<string> = new Set();

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
    private dialog: MatDialog,
    private alertService: AlertService
  ) {
    this.couponForm = this.formBuilder.group({
      description: ['', [Validators.required, Validators.maxLength(36)]],
      usagePurpose: [''],
      status: [null],
    });

    this.rewardForm = this.formBuilder.group({
      description: ['', Validators.required],
    });

    this.bulkForm = this.formBuilder.group({
      count: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
    });

    this.redeemForm = this.formBuilder.group({
      selectedRewardId: ['', Validators.required],
    });

    const userInfo = this.authService.getUserInfo();
    if (userInfo && userInfo.username) {
      this.userEmail = userInfo.username;

      // Set partner-specific permissions
      this.isPartnerB = this.userEmail === 'mean.ghost.site@gmail.com';
      this.isPartnerA = this.userEmail === 'honghue.hr@gmail.com';
      // Set initial active tab based on user role
      if (this.isPartnerB) {
        this.currentActiveTab = 'B';
      }
    }
  }

  ngOnInit(): void {
    this.loadCoupons(this.currentActiveTab);
    this.loadPendingRewards();
  }

  onTabChange(event: MatTabChangeEvent): void {
    // Tab index 0 = Pé Huế, Tab index 1 = Anh Đăng
    this.currentActiveTab = event.index === 0 ? 'A' : 'B';
    this.loadCoupons(this.currentActiveTab);
    this.loadPendingRewards();
    this.cancelEdit();
    this.cancelBulkAdd();
  }

  loadCoupons(partner: 'A' | 'B'): void {
    this.couponService.getPartnerCoupons(partner).subscribe(
      coupons => {
        if (partner === 'A') {
          this.couponsA = coupons;
        } else {
          this.couponsB = coupons;
        }
      },
      error => {
        console.error(`Error loading coupons for partner ${partner}`, error);
        this.alertService.showNoti(
          `Failed to load coupons for partner ${partner}`,
          'danger'
        );
      }
    );
  }

  loadPendingRewards(): void {
    // Load all rewards (pending and completed)
    this.rewardService.getRewards().subscribe(
      allRewards => {
        // Partner A should see rewards created by Partner B (tasks A needs to do for B)
        this.pendingRewardsA = allRewards.filter(
          reward => reward.partner === 'B'
        );
        // Partner B should see rewards created by Partner A (tasks B needs to do for A)
        this.pendingRewardsB = allRewards.filter(
          reward => reward.partner === 'A'
        );
      },
      error => {
        console.error('Error loading rewards', error);
        this.alertService.showNoti('Failed to load rewards', 'danger');
      }
    );
  }

  // Method to show the create coupon form
  showCreateCouponForm(partner: 'A' | 'B'): void {
    this.currentActiveTab = partner;
    this.isEditing = true;
    this.showingBulkForm = false;
    this.editingCouponId = null;
    this.couponForm.reset();
  }

  showBulkAddForm(partner: 'A' | 'B'): void {
    this.currentActiveTab = partner;
    this.isEditing = false;
    this.showingBulkForm = true;
    this.editingCouponId = null;
    this.bulkForm.patchValue({ count: 1 });
  }

  cancelBulkAdd(): void {
    this.showingBulkForm = false;
    this.bulkForm.reset();
    this.bulkForm.patchValue({ count: 1 });
  }

  editCoupon(coupon: Coupon, partner: 'A' | 'B'): void {
    const canEdit =
      (partner === 'A' && this.isPartnerB) ||
      (partner === 'B' && this.isPartnerA);
    if (!canEdit) return;

    this.currentActiveTab = partner;
    this.isEditing = true;
    this.showingBulkForm = false;
    this.editingCouponId = coupon._id || null;
    this.couponForm.patchValue({
      description: coupon.description,
      usagePurpose: coupon.usagePurpose || '',
      status: coupon.status || 'unused',
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingCouponId = null;
    this.editingRewardId = null;
    this.editingRewardPartner = null;
    this.couponForm.reset();
    this.rewardForm.reset();
  }

  saveCouponForPartner(partner: 'A' | 'B'): void {
    if (!this.couponForm.valid) return;

    const couponData: Coupon = {
      description: this.couponForm.value.description,
      usagePurpose: this.couponForm.value.usagePurpose,
      status: this.couponForm.value.status,
      partner: partner,
    };

    if (this.isEditing && this.editingCouponId) {
      this.couponService
        .updateCoupon(this.editingCouponId, couponData)
        .subscribe(
          result => {
            this.alertService.showNoti(
              'Coupon updated successfully',
              'success'
            );
            this.loadCoupons(partner);
            this.cancelEdit();
          },
          error => {
            console.error('Error updating coupon', error);
            this.alertService.showNoti('Failed to update coupon', 'danger');
          }
        );
    } else {
      this.couponService.addCoupon(couponData).subscribe(
        result => {
          this.alertService.showNoti('Coupon added successfully', 'success');
          this.loadCoupons(partner);
          this.cancelEdit();
        },
        error => {
          console.error('Error adding coupon', error);
          this.alertService.showNoti('Failed to add coupon', 'danger');
        }
      );
    }
  }

  bulkAddCoupons(partner: 'A' | 'B'): void {
    const canAdd =
      (partner === 'A' && this.isPartnerA) ||
      (partner === 'B' && this.isPartnerB);
    if (!canAdd || !this.bulkForm.valid) return;

    const count = this.bulkForm.value.count;

    this.couponService.bulkAddCoupons(count, partner).subscribe(
      result => {
        this.alertService.showNoti(
          `${count} coupons added successfully for partner ${partner}`,
          'success'
        );
        this.loadCoupons(partner);
        this.cancelBulkAdd();
      },
      error => {
        console.error('Error adding coupons in bulk', error);
        this.alertService.showNoti('Failed to add coupons', 'danger');
      }
    );
  }

  deleteCoupon(coupon: Coupon, partner: 'A' | 'B'): void {
    const canDelete =
      (partner === 'A' && this.isPartnerB) ||
      (partner === 'B' && this.isPartnerA);
    if (!canDelete) return;
    if (confirm('Are you sure you want to delete this coupon?')) {
      this.couponService.deleteCoupon(coupon._id!).subscribe(
        () => {
          this.alertService.showNoti('Coupon deleted successfully', 'success');
          this.loadCoupons(partner);
        },
        error => {
          console.error('Error deleting coupon', error);
          this.alertService.showNoti('Failed to delete coupon', 'danger');
        }
      );
    }
  }

  // Methods for coupon details using MatDialog
  showCouponDetails(coupon: Coupon): void {
    this.dialog.open(CouponDetailDialogComponent, {
      width: '700px',
      data: coupon,
    });
  }

  // Methods for redemption info modal using MatDialog
  showRedemptionInfo(partner?: 'A' | 'B', couponCount?: number): void {
    const isRedemptionMode = couponCount !== undefined && partner !== undefined;
    const dialogRef = this.dialog.open(RedemptionInfoDialogComponent, {
      width: '800px',
      data: {
        isRedemptionMode,
        availableCouponCount: couponCount || 0,
        partner: partner,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedRedemptionOption = result.option;
        this.selectedRedemptionCouponCount = result.requiredCoupons;
        this.confirmRedemption(partner!);
      }
    });
  }

  confirmRedemption(partner: 'A' | 'B'): void {
    const canRedeem =
      (partner === 'A' && this.canRedeemAsPartnerA) ||
      (partner === 'B' && this.canRedeemAsPartnerB);
    const selectedCoupons =
      partner === 'A' ? this.selectedCouponsA : this.selectedCouponsB;

    if (
      !this.selectedRedemptionOption ||
      !canRedeem ||
      selectedCoupons.size === 0
    ) {
      this.alertService.showNoti('Please select a reward option', 'warning');
      return;
    }

    const couponIds = Array.from(selectedCoupons).slice(
      0,
      this.selectedRedemptionCouponCount
    );

    const rewardData: Reward = {
      description: this.selectedRedemptionOption,
      couponCost: this.selectedRedemptionCouponCount,
      status: 'pending',
      requestedBy: this.userEmail,
      partner: partner,
    };

    this.rewardService.addReward(rewardData).subscribe(
      (createdReward: Reward) => {
        this.couponService
          .redeemCoupons(
            couponIds,
            createdReward._id!,
            createdReward.description,
            partner
          )
          .subscribe(
            () => {
              this.alertService.showNoti(
                'Reward requested successfully',
                'success'
              );
              this.loadCoupons(partner);
              this.loadPendingRewards();
              if (partner === 'A') {
                this.selectedCouponsA.clear();
              } else {
                this.selectedCouponsB.clear();
              }
              this.selectedRedemptionOption = null;
            },
            (error: any) => {
              console.error('Error redeeming coupons', error);
              this.alertService.showNoti('Failed to redeem coupons', 'danger');
            }
          );
      },
      (error: any) => {
        console.error('Error creating reward', error);
        this.alertService.showNoti('Failed to create reward', 'danger');
      }
    );
  }

  editReward(reward: Reward, partner: 'A' | 'B'): void {
    // Only the creator of the reward can edit it
    // If reward.partner === 'A', then Partner A created it and can edit it
    // If reward.partner === 'B', then Partner B created it and can edit it
    const canEdit =
      (reward.partner === 'A' && this.isPartnerA) ||
      (reward.partner === 'B' && this.isPartnerB);
    if (!canEdit) return;

    this.currentActiveTab = partner;
    this.editingRewardId = reward._id || null;
    this.editingRewardPartner = reward.partner || null; // Store the original creator
    this.rewardForm.patchValue({
      description: reward.description,
    });
  }

  saveReward(partner: 'A' | 'B'): void {
    // Only the creator of the reward can save/edit it
    // Use the stored editing reward partner to maintain original creator
    const actualPartner = this.editingRewardPartner || partner;
    const canEdit =
      (actualPartner === 'A' && this.isPartnerA) ||
      (actualPartner === 'B' && this.isPartnerB);
    if (!canEdit || !this.rewardForm.valid) return;

    const rewardData: Reward = {
      description: this.rewardForm.value.description,
      status: 'pending', // Maintain the status
      partner: actualPartner, // Use the original creator, not the tab
    };

    if (this.editingRewardId) {
      this.rewardService
        .updateReward(this.editingRewardId, rewardData)
        .subscribe(
          result => {
            this.alertService.showNoti(
              'Reward updated successfully',
              'success'
            );
            this.loadPendingRewards();
            this.editingRewardId = null;
            this.editingRewardPartner = null;
            this.rewardForm.reset();
          },
          error => {
            console.error('Error updating reward', error);
            this.alertService.showNoti('Failed to update reward', 'danger');
          }
        );
    }
  }

  deleteReward(reward: Reward, partner: 'A' | 'B'): void {
    // Only the creator of the reward can delete it
    // If reward.partner === 'A', then Partner A created it and can delete it
    // If reward.partner === 'B', then Partner B created it and can delete it
    const canDelete =
      (reward.partner === 'A' && this.isPartnerA) ||
      (reward.partner === 'B' && this.isPartnerB);
    if (!canDelete || !reward._id) return;
    if (confirm('Are you sure you want to delete this reward?')) {
      this.rewardService.deleteReward(reward._id!).subscribe(
        () => {
          this.alertService.showNoti('Reward deleted successfully', 'success');
          this.loadPendingRewards();
        },
        error => {
          console.error('Error deleting reward', error);
          this.alertService.showNoti('Failed to delete reward', 'danger');
        }
      );
    }
  }

  completeReward(reward: Reward, partner: 'A' | 'B'): void {
    // Only the reward owner can mark it as completed
    // If reward is for Partner A, only Partner A can complete it
    // If reward is for Partner B, only Partner B can complete it
    const canComplete =
      (partner === 'A' && this.isPartnerA) ||
      (partner === 'B' && this.isPartnerB);
    if (!canComplete || !reward._id || reward.status === 'done') return;

    this.rewardService.completeReward(reward._id!).subscribe(
      () => {
        this.alertService.showNoti('Reward marked as completed! 🎉', 'success');
        this.loadPendingRewards();
      },
      error => {
        console.error('Error completing reward', error);
        this.alertService.showNoti('Failed to complete reward', 'danger');
      }
    );
  }

  toggleCouponSelection(couponId: string, partner: 'A' | 'B'): void {
    const canSelect =
      (partner === 'A' && this.canRedeemAsPartnerA) ||
      (partner === 'B' && this.canRedeemAsPartnerB);
    if (!canSelect) return;

    const selectedCoupons =
      partner === 'A' ? this.selectedCouponsA : this.selectedCouponsB;

    if (selectedCoupons.has(couponId)) {
      selectedCoupons.delete(couponId);
    } else {
      selectedCoupons.add(couponId);
    }
  }

  isPartnerACouponSelected(couponId: string): boolean {
    return this.selectedCouponsA.has(couponId);
  }

  isPartnerBCouponSelected(couponId: string): boolean {
    return this.selectedCouponsB.has(couponId);
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
          <img
            [src]="couponImageUrl"
            alt="Coupon"
            class="img-fluid coupon-image"
          />
          <p [class]="textContrastClass">{{ data.description }}</p>
        </div>
        <div class="col-md-12">
          <p>
            <strong>Status:</strong>
            <span
              [class]="data.status === 'used' ? 'text-danger' : 'text-success'"
            >
              {{ data.status }}
            </span>
          </p>
          <p>
            <strong>Partner:</strong>
            {{ data.partner === 'A' ? 'Pé Huế' : 'Anh Đăng' }}
          </p>
          <p>
            <strong>Usage Purpose:</strong>
            {{ data.usagePurpose || 'Not specified' }}
          </p>
          <p><strong>Created:</strong> {{ data.createdAt | date: 'medium' }}</p>
        </div>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-dialog-close>Close</button>
    </div>
  `,
})
export class CouponDetailDialogComponent {
  couponImageUrl: string = this.getFromLocalStorage();
  textContrastClass: string = '';

  constructor(
    public dialogRef: MatDialogRef<CouponDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Coupon,
    private configService: ConfigService
  ) {
    this.loadDefaultImage();
  }

  loadDefaultImage(): void {
    this.configService.getConfig(['defaultCouponImage']).subscribe(
      configs => {
        const config = configs[0];
        const valueInStorage = this.getFromLocalStorage();
        if (valueInStorage === config.defaultCouponImage) {
          this.determineTextContrast();
        } else if (config && config.defaultCouponImage) {
          // Use the configured default image
          this.couponImageUrl = config.defaultCouponImage;
          this.saveToLocalStorage(config.defaultCouponImage);
          // Determine text contrast after image is loaded
          setTimeout(() => this.determineTextContrast(), 100);
        }
      },
      error => {
        console.error('Error loading default coupon image config:', error);
        // Fall back to the default image in case of error
        setTimeout(() => this.determineTextContrast(), 100);
      }
    );
  }

  determineTextContrast(): void {
    // For now, use a simple approach based on image URL or filename
    // In a more advanced implementation, you could analyze the actual image
    const imageUrl = this.couponImageUrl.toLowerCase();

    if (
      imageUrl.includes('dark') ||
      imageUrl.includes('black') ||
      imageUrl.includes('night')
    ) {
      this.textContrastClass = 'dark-background';
    } else if (
      imageUrl.includes('bright') ||
      imageUrl.includes('light') ||
      imageUrl.includes('white')
    ) {
      this.textContrastClass = 'high-contrast';
    } else {
      // Default high contrast for unknown images
      this.textContrastClass = 'high-contrast';
    }
  }

  saveToLocalStorage(value: string) {
    localStorage.setItem('CONFIG_defaultCouponImage', value);
  }
  getFromLocalStorage(): string {
    return (
      localStorage.getItem('CONFIG_defaultCouponImage') ||
      'assets/img/coupon-blank.jpg'
    );
  }
}

// Dialog component for redemption info
@Component({
  selector: 'app-redemption-info-dialog',
  template: `
    <h2 mat-dialog-title>
      <span *ngIf="!data.isRedemptionMode">Coupon Redemption Guide</span>
      <span *ngIf="data.isRedemptionMode"
        >Redeem {{ data.availableCouponCount }} Coupon(s) for a Reward</span
      >
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
                  <th *ngIf="data.isRedemptionMode" class="text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let reward of rewardOptions"
                  [class]="getRewardClass(reward)"
                >
                  <td>{{ reward.name }}</td>
                  <td class="text-center">
                    {{ reward.requiredCoupons }} phiếu
                  </td>
                  <td *ngIf="data.isRedemptionMode" class="text-center">
                    <button
                      *ngIf="
                        reward.requiredCoupons <= data.availableCouponCount
                      "
                      class="btn btn-sm"
                      [class]="
                        selectedOption === reward.name
                          ? 'btn-primary'
                          : 'btn-outline-primary'
                      "
                      (click)="
                        selectOption(reward.name, reward.requiredCoupons)
                      "
                    >
                      {{
                        selectedOption === reward.name ? 'Selected' : 'Select'
                      }}
                    </button>
                    <span
                      *ngIf="reward.requiredCoupons > data.availableCouponCount"
                      class="text-muted"
                    >
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
      <button mat-dialog-close>Close</button>
      <button
        *ngIf="data.isRedemptionMode && selectedOption"
        color="primary"
        (click)="
          dialogRef.close({
            option: selectedOption,
            requiredCoupons: selectedRequiredCoupons,
            partner: data.partner,
          })
        "
      >
        Redeem
      </button>
    </div>
  `,
})
export class RedemptionInfoDialogComponent {
  selectedOption: string | null = null;
  selectedRequiredCoupons: number = 0;

  rewardOptionsForPartnerA = [
    {
      name: 'Phiếu đổi một buổi massage mắt/chân thư giãn sau một ngày dài',
      requiredCoupons: 2,
    },
    {
      name: 'Phiếu đổi một buổi tối được Anh Đăng gội đầu và sấy tóc',
      requiredCoupons: 2,
    },
    {
      name: 'Phiếu đổi một buổi sáng được Anh Đăng chuẩn bị bữa ăn sáng tận giường (món ăn cầu kỳ hơn là chỉ chiên trứng và bánh mì)',
      requiredCoupons: 3,
    },
    {
      name: 'Phiếu đổi một lần Anh Đăng dọn dẹp nhà cửa toàn bộ',
      requiredCoupons: 4,
    },
    {
      name: 'Phiếu đổi một buổi tối được Anh Đăng đọc sách hoặc kể chuyện cho nghe trước khi ngủ',
      requiredCoupons: 1,
    },
    {
      name: 'Phiếu đổi một lần được pha cho một ly nước ép hoặc sinh tố đặc biệt',
      requiredCoupons: 1,
    },
    {
      name: 'Phiếu đổi một buổi chiều được Anh Đăng chở đi mua sắm quần áo và tư vấn lựa chọn',
      requiredCoupons: 3,
    },
    {
      name: 'Phiếu đổi một lần được Anh Đăng tự tay làm một món đồ handmade nhỏ xinh tặng vợ',
      requiredCoupons: 4,
    },
    {
      name: 'Phiếu đổi một buổi hẹn hò lãng mạn bất ngờ do Anh Đăng lên kế hoạch',
      requiredCoupons: 5,
    },
    {
      name: 'Phiếu đổi một buổi tối được Anh Đăng cùng Pé Huế chơi một trò chơi yêu thích',
      requiredCoupons: 1,
    },
  ];

  rewardOptionsForPartnerB = [
    {
      name: 'Phiếu đổi một buổi massage mắt/chân thư giãn sau một ngày dài',
      requiredCoupons: 2,
    },
    {
      name: 'Phiếu đổi một buổi tối được Pé Huế gội đầu và sấy tóc',
      requiredCoupons: 2,
    },
    {
      name: 'Phiếu đổi một buổi sáng được Pé Huế chuẩn bị bữa ăn sáng tận giường (món ăn cầu kỳ hơn là chỉ chiên trứng và bánh mì)',
      requiredCoupons: 3,
    },
    {
      name: 'Phiếu đổi một lần Pé Huế dọn dẹp nhà cửa toàn bộ',
      requiredCoupons: 4,
    },
    {
      name: 'Phiếu đổi một lần được pha cho một ly nước ép hoặc sinh tố đặc biệt',
      requiredCoupons: 1,
    },
    {
      name: 'Phiếu đổi một lần được Pé Huế tự tay làm một món đồ handmade nhỏ xinh tặng chồng',
      requiredCoupons: 4,
    },
    {
      name: 'Phiếu đổi một buổi hẹn hò lãng mạn bất ngờ do Pé Huế lên kế hoạch',
      requiredCoupons: 5,
    },
    {
      name: 'Phiếu đổi một buổi tối được Pé Huế cùng Anh Đăng chơi một trò chơi yêu thích',
      requiredCoupons: 1,
    },
  ];

  rewardOptions: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<RedemptionInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isRedemptionMode: boolean;
      availableCouponCount: number;
      partner?: 'A' | 'B';
    }
  ) {
    this.rewardOptions =
      data.partner === 'A'
        ? this.rewardOptionsForPartnerA
        : this.rewardOptionsForPartnerB;
  }

  selectOption(option: string, requiredCoupons: number): void {
    this.selectedOption = option;
    this.selectedRequiredCoupons = requiredCoupons;
  }

  getRewardClass(reward: any): string {
    let classes = '';
    if (
      this.data.isRedemptionMode &&
      reward.requiredCoupons > this.data.availableCouponCount
    ) {
      classes += 'disabled-reward';
    } else if (
      this.data.isRedemptionMode &&
      reward.requiredCoupons <= this.data.availableCouponCount
    ) {
      classes += 'selectable-reward';
    }

    if (this.selectedOption === reward.name) {
      classes += ' selected-reward';
    }

    return classes;
  }
}
