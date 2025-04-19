import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Tag } from '@models/_index';
import { AlertService, TagService } from '@services/_index';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html'
})
export class TagListComponent implements OnInit {
  tags: Tag[] = [];
  constructor(
    private tagService: TagService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getTags();
  }
  getTags() {
    this.tagService.getTags().subscribe(tags => {
      this.tags = tags;
    }, (err) => {
      console.log(err);
      this.alertService.showNoti(`Create tag fail!`, 'danger');
    });
  }
  delete(tag: Tag) {

    if (!tag) {
      return;
    }
    const id = tag._id;
    if (tag) {
      this.tagService.deleteTag(id)
        .subscribe((_: any) => {
          this.alertService.showNoti('Tag deleted!', 'success');
          this.getTags();
        }, err => {
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
