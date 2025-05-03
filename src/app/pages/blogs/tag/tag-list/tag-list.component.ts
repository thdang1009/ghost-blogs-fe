import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Tag } from '@models/_index';
import { AlertService, TagService } from '@services/_index';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit {
  tags: Tag[] = [];
  loading = false;

  constructor(
    private tagService: TagService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getTags();
  }

  getTags() {
    this.loading = true;
    this.tagService.getTags().subscribe(tags => {
      this.tags = tags;
      this.loading = false;
    }, (err) => {
      console.log(err);
      this.alertService.showNoti(`Create tag fail!`, 'danger');
      this.loading = false;
    });
  }

  delete(tag: Tag) {
    if (!tag) {
      return;
    }
    const id = tag._id;
    if (tag) {
      this.loading = true;
      this.tagService.deleteTag(id)
        .subscribe((_: any) => {
          this.alertService.showNoti('Tag deleted!', 'success');
          this.getTags();
        }, err => {
          this.loading = false;
        });
    }
  }

  edit(tag: Tag) {
    if (!tag) {
      return;
    }
    this.router.navigate(
      ['admin/blog/tag'],
      {
        queryParams: { id: tag._id }
      });
  }
}
