import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '@models/_index';
import { PostService } from '@services/_index';

@Component({
  selector: 'app-post-by',
  templateUrl: './post-by.component.html',
  styleUrls: ['./post-by.component.scss']
})
export class PostByComponent implements OnInit {
  posts: Post[] = [];
  constructor(
    private postService: PostService,
    private activeRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.activeRoute.queryParams
      .subscribe(params => {
        this.postService.getPublicPosts(params)
          .subscribe(posts => {
            this.posts = posts || [];
          });
      });
  }

  openPost(post: Post): void {
    if (post && post.postReference) {
      this.router.navigate(['/blogs', post.postReference]);
    }
  }
}
