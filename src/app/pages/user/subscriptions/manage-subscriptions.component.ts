import { Component, OnInit } from '@angular/core';
import { Subscription, Tag } from '@models/_index';
import { AlertService, AuthService, SubscriptionService, TagService } from '@services/_index';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-manage-subscriptions',
  templateUrl: './manage-subscriptions.component.html',
  styleUrls: ['./manage-subscriptions.component.scss']
})
export class ManageSubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  tags: { [key: string]: Tag } = {};
  isLoading = true;
  userInfo: any;

  constructor(
    private subscriptionService: SubscriptionService,
    private tagService: TagService,
    private authService: AuthService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    this.loadSubscriptions();
  }

  /**
   * Load user's subscriptions and tag details
   */
  loadSubscriptions(): void {
    this.isLoading = true;

    if (!this.userInfo || !this.userInfo._id) {
      this.alertService.error('User information not available');
      this.isLoading = false;
      return;
    }

    this.subscriptionService.getUserSubscriptions(this.userInfo._id)
      .subscribe(
        (subscriptions) => {
          this.subscriptions = subscriptions;

          // Get all unique tag IDs
          const tagIds = new Set<string>();
          this.subscriptions.forEach(sub => {
            if (sub.subscribe) {
              sub.subscribe.forEach(tagId => tagIds.add(tagId as string));
            }
          });

          // If there are tags, load their details
          if (tagIds.size > 0) {
            // Create an array of observables for each tag
            const tagObservables = Array.from(tagIds).map(tagId =>
              this.tagService.getTag(tagId).pipe(
                map(tag => ({ [tagId]: tag }))
              )
            );

            // Execute all tag requests in parallel
            forkJoin(tagObservables).subscribe(
              tagResults => {
                // Combine all tag results into a single object
                tagResults.forEach(tagObj => {
                  this.tags = { ...this.tags, ...tagObj };
                });
                this.isLoading = false;
              },
              error => {
                console.error('Error loading tag details:', error);
                this.alertService.error('Failed to load tag details');
                this.isLoading = false;
              }
            );
          } else {
            this.isLoading = false;
          }
        },
        error => {
          console.error('Error loading subscriptions:', error);
          this.alertService.error('Failed to load subscriptions');
          this.isLoading = false;
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
   * Get tag name by ID
   */
  getTagName(tagId: string): string {
    return this.tags[tagId]?.name as string || 'Unknown Tag';
  }
}
