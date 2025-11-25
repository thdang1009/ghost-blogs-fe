import { Component, EventEmitter, Output } from '@angular/core';

export interface PricingTier {
  duration: string;
  months: number;
  hourlyRate: number;
  discount: number;
  popular?: boolean;
  features: string[];
}

@Component({
  selector: 'app-pricing-popup',
  templateUrl: './pricing-popup.component.html',
  styleUrls: ['./pricing-popup.component.scss']
})
export class PricingPopupComponent {
  @Output() close = new EventEmitter<void>();
  @Output() contactMe = new EventEmitter<PricingTier>();

  baseRate = 24;

  pricingTiers: PricingTier[] = [
    {
      duration: 'Hourly',
      months: 0,
      hourlyRate: this.baseRate,
      discount: 0,
      features: [
        'Flexible hours',
        'No commitment',
        'Pay as you go',
        'Perfect for small tasks'
      ]
    },
    {
      duration: '3 Months',
      months: 3,
      hourlyRate: this.baseRate * 0.9, // 10% discount
      discount: 10,
      popular: true,
      features: [
        '10% discount',
        'Priority support',
        'Weekly progress reports',
        'Dedicated communication channel'
      ]
    },
    {
      duration: '6 Months',
      months: 6,
      hourlyRate: this.baseRate * 0.85, // 15% discount
      discount: 15,
      features: [
        '15% discount',
        'Priority support',
        'Bi-weekly planning sessions',
        'Code reviews included',
        'Technical documentation'
      ]
    }
  ];

  closePopup(): void {
    this.close.emit();
  }

  selectPlan(tier: PricingTier): void {
    this.contactMe.emit(tier);
  }

  getMonthlyEstimate(tier: PricingTier): number {
    const hoursPerMonth = 160; // ~40 hours per week
    return tier.hourlyRate * hoursPerMonth;
  }
}