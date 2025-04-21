import { Component, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounce } from '@shared/common';
import { BookPermission } from '@shared/enum';
import { AuthService, PostService } from '@services/_index';
import { Post } from '@models/_index';
import { isPlatformBrowser } from '@angular/common';

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
  isFilteredByTag = false;
  pageIndex = 1;
  pageSize = 5;
  isRunning = false;

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    this.debouceFunc();
  }

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
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
        const currentPath = this.router.url;
        if (currentPath && currentPath.includes('tag')) {
          this.isFilteredByTag = true;
        }
        const req = {
          page: this.pageIndex,
          limit: this.pageSize,
          ...params
        }
        this.postService.getPublicPosts(req)
          .subscribe(posts => {
            this.posts = posts;
          });
      })

  }

  openPost(post: Post) {
    // TODO document why this method 'openPost' is empty
  }

  backToHome() {
    this.isFilteredByTag = false;
    this.pageIndex = 1;
    this.router.navigate(['home']);
  }

  getMorePosts(pageSize = 5) {

  }

  showMorePost() {
    this.postService.getPublicPosts({
      page: ++this.pageIndex,
      limit: this.pageSize
    }).subscribe(posts => {
      this.posts = [...this.posts, ...posts];
    });
  }
  debouceFunc = debounce(this.showMorePost.bind(this), 500);
}
