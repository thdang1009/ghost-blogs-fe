import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounce } from '@shared/common';
import { BookPermission } from '@shared/enum';
import { AuthService, PostService } from '@services/_index';
import { Post } from '@models/_index';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  BookPermission = BookPermission;
  isLogined = false;
  hasBackofficePermission = false;
  isLoadingResults = true;
  thisYear = (new Date).getFullYear();
  posts: Post[] = [];
  allPosts: Post[] = [];
  isFilteredByTag = false;
  pageIndex = 1;
  numberOfAllPost = 0;
  isRunning = false;

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    this.debouceFunc();
  }

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.init();
  }

  async init() {
    this.isLogined = this.authService.isLogin();
    this.hasBackofficePermission = this.authService.isLogin();
    this.activeRoute.queryParams
      .subscribe(params => {
        const path = window.location.href
        if (path && path.includes('tag')) {
          this.isFilteredByTag = true;
        }
        this.postService.getPublicPosts(params)
          .subscribe(posts => {
            this.allPosts = (posts || []).reverse();
            this.numberOfAllPost = posts.length;
            this.posts = this.getMorePosts().filter((post): post is Post => post !== undefined);
          });
      })
  }

  openPost(post: Post) {
    // TODO document why this method 'openPost' is empty
  }

  backToHome() {
    this.isFilteredByTag = false;
    this.router.navigate(['home']);
  }

  getMorePosts(pageSize = 4) {
    let count = 0;
    const tempArray: Post[] = [];
    while (count < pageSize && this.allPosts.length) {
      count++;
      const post = this.allPosts.pop();
      if (post) {
        tempArray.push(post);
      }
    }
    return tempArray;
  }

  showMorePost() {
    if (this.posts?.length < this.numberOfAllPost) {
      const newPosts = this.getMorePosts(5).filter((post): post is Post => post !== undefined);
      this.posts = [...this.posts, ...newPosts];
    }
  }
  debouceFunc = debounce(this.showMorePost.bind(this), 500);
}
