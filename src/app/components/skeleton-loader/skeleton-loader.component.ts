import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  @Input() type: 'post-card' | 'compact-card' | 'tag-chip' | 'series-card' =
    'post-card';
  @Input() count = 1;

  get items(): number[] {
    return Array(this.count)
      .fill(0)
      .map((_, i) => i);
  }
}
