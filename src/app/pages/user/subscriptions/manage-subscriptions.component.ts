import { Component, OnInit } from '@angular/core';
import { Subscription, SubscriptionDisplay, Tag } from '@models/_index';
import { AlertService, AuthService, SubscriptionService } from '@services/_index';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-manage-subscriptions',
  templateUrl: './manage-subscriptions.component.html',
  styleUrls: ['./manage-subscriptions.component.scss']
})
export class ManageSubscriptionsComponent implements OnInit {
  subscriptions: SubscriptionDisplay[] = [];
  isLoading = true;
  userInfo: any;

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    this.loadSubscriptions();
  }

  /**
   * Load user's subscriptions and compute tag display names
   */
  loadSubscriptions(): void {
    this.subscriptionService.getAllUserSubscriptions()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (response: { subscribe: SubscriptionDisplay[] }) => {
          this.subscriptions = response.subscribe;
          this.subscriptions.forEach(sub => {
            sub.subscribersDisplay = sub.subscribers?.map(subscriber => subscriber.email || subscriber._id);
          });
        },
        error => {
          console.error('Error loading subscriptions:', error);
          this.alertService.error('Failed to load subscriptions');
        }
      );
  }

  /**
   * Unsubscribe from a tag
   */
  unsubscribeFromTag(subscriptionId: string, tagId: string): void {
    this.subscriptionService.unsubscribe(subscriptionId, [tagId])
      .subscribe(
        () => {
          this.alertService.success('Successfully unsubscribed from tag');
          // Refresh subscriptions
          this.loadSubscriptions();
        },
        error => {
          console.error('Error unsubscribing from tag:', error);
          this.alertService.error('Failed to unsubscribe from tag');
        }
      );
  }

  /**
   * Delete a subscription
   */
  deleteSubscription(tagId: string): void {
    this.subscriptionService.deleteSubscriptionByTagId(tagId)
      .subscribe(
        () => {
          this.alertService.success('Successfully deleted subscription');
          this.loadSubscriptions();
        },
        error => {
          console.error('Error deleting subscription:', error);
          this.alertService.error('Failed to delete subscription');
        }
      );
  }

}
