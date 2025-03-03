import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '@services/_index';
import { showNoti } from '@shares/common';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent implements OnInit {


  categorys = [];
  constructor(
    private categoryService: CategoryService,
    private router: Router) { }

  ngOnInit(): void {
    this.getCategorys();
  }
  getCategorys() {
    this.categoryService.getCategorys().subscribe(categorys => {
      this.categorys = categorys;
    }, (err) => {
      console.log(err);
      showNoti(`Create category fail!`, 'danger');
    });
  }
  postReference(category) {
    if (!category) {
      return;
    }
    const id = category._id;
    if (category) {
      this.categoryService.deleteCategory(id)
        .subscribe(({ success }: any) => {
          showNoti('Category deleted!', 'success');
          this.getCategorys();
        }, err => {
        });
    }
  }
  edit(category) {
    if (!category) {
      return;
    }
    this.router.navigate(
      ['admin/blog/category'],
      {
        queryParams: { id: category._id }
      });
  }
}
