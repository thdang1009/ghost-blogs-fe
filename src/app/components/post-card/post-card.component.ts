import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { Post } from '@models/_index';
import { TimeAgoPipe } from '@pipes/_index';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MarkdownModule,
    TimeAgoPipe,
    DatePipe,
    NgOptimizedImage,
  ],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;
  @Input() showSeries = true;
  @Input() showTags = true;
  @Input() compact = false;
  @Input() priority = false; // For LCP optimization
}
