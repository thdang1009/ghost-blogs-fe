import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '@models/_index';
import { PostService } from '@services/_index';
import * as dateFns from 'date-fns';
import { POST_STATUS, POST_TYPE } from '@shared/enum';
import { PostSaveWrapper } from '../post-edit/post-edit.component';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {

  data: Post[] = [];
  isLoadingResults = true;
  POST_TYPE = POST_TYPE;
  listPostType = [
    // POST_TYPE.GHOST_EDITOR,
    POST_TYPE.MARKDOWN
  ];

  today = dateFns.startOfToday();
  lastYearDay = dateFns.subYears(this.today, 5);
  searchDateFrom = new UntypedFormControl(this.lastYearDay);
  searchDateTo = new UntypedFormControl(this.today);
  searchStatus = 'NONE';
  statusList = [POST_STATUS.NONE, POST_STATUS.PRIVATE, POST_STATUS.PUBLIC, POST_STATUS.PROTECTED];
  itemSelected: any = {} as any;
  editMode = false;

  constructor(
    private postService: PostService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.getPost(id, () => {
          this.chooseThisItem(id);
        });
      } else {
        this.searchPost(id);
        this.itemSelected = {};
        this.editMode = false;
      }
    });
  }

  getPost(id: number, cb?: () => void) {
    this.isLoadingResults = true;
    this.postService.getPostAsAdmin(id)
      .subscribe(
        res => {
          this.itemSelected = res;
          if (cb) {
            cb();
          }
        },
        _ => { },
        () => {
          this.isLoadingResults = false;
        });
  }

  addPost() {
    const sample: Post = {
      content: ''
    }
    this.postService.addPost(sample)
      .subscribe((res: any) => {
        this.data.unshift(res);
        this.isLoadingResults = false;
      }, err => {
        this.isLoadingResults = false;
      });
  }

  searchPost(id: number | undefined = undefined) {
    this.funcGetAllPost(id);
  }

  chooseThisItem(id: number) {
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { id: id },
        queryParamsHandling: 'merge'
      });
    this.editMode = true;
  }

  funcGetAllPost(id: number | undefined) {
    const from = this.searchDateFrom && this.searchDateFrom.value || new Date();
    const to = this.searchDateTo && this.searchDateTo.value || new Date();
    const fromDate = dateFns.startOfDay(from);
    const toDate = dateFns.endOfDay(to);
    const req = {
      from: fromDate || undefined,
      to: toDate || undefined,
      status: this.searchStatus === 'NONE' && undefined || this.searchStatus
    }
    this.isLoadingResults = true;
    this.postService.getAllPost(req)
      .subscribe((res: any) => {
        this.data = res;
        if (id) {
          this.itemSelected = res.filter((el: Post) => el.id === id)[0];
          this.ref.markForCheck();
        }
        this.isLoadingResults = false;
      }, err => {
        this.isLoadingResults = false;
      });
  }
  deleteLast() {
    this.isLoadingResults = true;
    if (!this.data || !this.data.length) {
      return;
    }
    const lastIndex = this.data.length - 1;
    const id = this.data[lastIndex].id;
    this.callDeletePost(id!);
  }
  deletePost(post: Post) {
    const val = confirm(`Delete "${post.title}"?`);
    if (val) {
      this.callDeletePost(post.id!);
    }
  }
  callDeletePost(id: number) {
    if (id) {
      this.isLoadingResults = true;
      this.postService.deletePost(id)
        .subscribe((_: any) => {
          this.data = this.data.filter(el => el.id !== id);
          this.isLoadingResults = false;
        }, err => {
          this.isLoadingResults = false;
        });
    }
  }
  drop(event: any) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }
  sort(preIndex: number, curIndex: number) {
    const item = this.data[preIndex];
    const newOrder = Number(this.data[curIndex].order);
    const delta = preIndex > curIndex ? -1 : 1;
    return new Promise<any>((resolve, reject) => {
      const req = {
        ...item,
        order: newOrder + delta
      };
      this.postService.updatePost(item.id, req)
        .subscribe((_: any) => {
          this.isLoadingResults = false;
          resolve('success');
        }, err => {
          this.isLoadingResults = false;
          reject('fail');
        });
    });
  }
  saveItem({ item, isBack }: PostSaveWrapper) {
    const callback = () => {
      this.itemSelected = {};
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute,
          queryParams: { id: null },
          queryParamsHandling: 'merge'
        });
    }

    this.postService.updatePost(item.id, item)
      .subscribe((res: any) => {
        if (isBack && callback) {
          callback();
        }
      }, err => {
      });
  }
}
