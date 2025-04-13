import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Coupon, Reward } from '@models/_index';
import { CouponService, RewardService, AuthService } from '@services/_index';
import { showNoti } from '@shared/common';
declare var $: any;

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

  isEditing = false;
  editingCouponId: string | null = null;
  editingRewardId: string | null = null;

  userEmail: string = '';
  canManageCoupons = false;
  canRedeemCoupons = false;

  selectedCoupons: Set<string> = new Set();
  selectedReward: string | null = null;

  // New properties for coupon details
  selectedCouponForDetail: Coupon | null = null;

  // New properties for redemption info modal
  isRedemptionMode = false;
  availableCouponCount = 0;
  selectedRedemptionOption: string | null = null;
  selectedRedemptionCouponCount = 0;

  constructor(
    private couponService: CouponService,
    private rewardService: RewardService,
    private authService: AuthService,
    private formBuilder: UntypedFormBuilder,
    private dialog: MatDialog
  ) {
    this.couponForm = this.formBuilder.group({
      description: ['', [Validators.required, Validators.maxLength(36)]],
      usagePurpose: ['']
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
      this.userEmail = userInfo.username;
      this.canManageCoupons = this.userEmail === 'mean.ghost.site@gmail.com';
      this.canRedeemCoupons = ['honghue.hr@gmail.com', 'mean.ghost.site@gmail.com'].includes(this.userEmail);
      console.log('dangth canRedeemCoupons', this.canRedeemCoupons);
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
      usagePurpose: coupon.usagePurpose || ''
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

    const couponData: Coupon = {
      description: this.couponForm.value.description,
      status: 'unused', // Default for new coupon
      usagePurpose: this.couponForm.value.usagePurpose
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

  // Methods for coupon details
  showCouponDetails(coupon: Coupon): void {
    this.selectedCouponForDetail = coupon;
    $('#couponDetailModal').modal('show');
  }

  closeCouponDetails(): void {
    $('#couponDetailModal').modal('hide');
    this.selectedCouponForDetail = null;
  }

  // Methods for redemption info modal
  showRedemptionInfo(couponCount?: number): void {
    this.isRedemptionMode = couponCount !== undefined;
    this.availableCouponCount = couponCount || 0;
    $('#redemptionInfoModal').modal('show');
  }

  closeRedemptionInfo(): void {
    $('#redemptionInfoModal').modal('hide');
    this.selectedRedemptionOption = null;
  }

  selectRedemptionOption(option: string, requiredCoupons: number): void {
    if (this.isRedemptionMode && requiredCoupons <= this.availableCouponCount) {
      this.selectedRedemptionOption = option;
      this.selectedRedemptionCouponCount = requiredCoupons;
    }
  }

  isRedemptionOptionSelected(option: string): boolean {
    return this.selectedRedemptionOption === option;
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
            this.closeRedemptionInfo();
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
