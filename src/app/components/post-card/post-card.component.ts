import { Component, Input } from '@angular/core';
import { Post } from '@models/_index';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() showSeries: boolean = true;
  @Input() showTags: boolean = true;
  @Input() compact: boolean = false;

  constructor() { }
} 