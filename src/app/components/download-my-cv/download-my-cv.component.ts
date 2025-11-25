import { Component, Input } from '@angular/core';
import { PricingTier } from '../pricing-popup/pricing-popup.component';

@Component({
  selector: 'app-download-my-cv',
  templateUrl: './download-my-cv.component.html',
  styleUrls: ['./download-my-cv.component.scss']
})
export class DownloadMyCvComponent {
  @Input() buttonText: string = 'Download My CV';
  @Input() buttonClass: string = 'btn btn-primary';
  @Input() iconClass: string = 'fas fa-download';

  showPricingPopup = false;

  downloadCV(): void {
    const cvUrl = 'https://dangtrinh.site/api/v1/file/static/dangtrinh-cv-pdf';
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = 'dangtrinh-cv.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  showPricing(): void {
    this.showPricingPopup = true;
  }

  closePricing(): void {
    this.showPricingPopup = false;
  }

  contactWithPricing(tier: PricingTier): void {
    const email = 'thdang1009@gmail.com';
    const subject = `Hire Inquiry - ${tier.duration} Engagement`;

    let body = `Hi Dang Trinh,\n\nI am interested in hiring you for a ${tier.duration.toLowerCase()} engagement.\n\n`;
    body += `Selected Plan Details:\n`;
    body += `- Duration: ${tier.duration}\n`;
    body += `- Hourly Rate: $${tier.hourlyRate.toFixed(2)}/hour\n`;

    if (tier.discount > 0) {
      body += `- Discount: ${tier.discount}% off base rate\n`;
    }

    if (tier.months > 0) {
      const monthlyEstimate = tier.hourlyRate * 160; // ~40 hours per week
      body += `- Monthly Estimate: $${monthlyEstimate.toLocaleString()} (based on ~40h/week)\n`;
    }

    body += `\nProject Details:\n`;
    body += `[Please describe your project requirements, timeline, and any specific needs]\n\n`;
    body += `Best regards`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');

    this.closePricing();
  }
}