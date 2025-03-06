import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '@models/_index';
import { CategoryService } from '@services/_index';
import { showNoti } from '@shared/common';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent implements OnInit {


  categorys: Category[] = [];
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
  postReference(category: Category) {
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
  edit(category: Category) {
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
