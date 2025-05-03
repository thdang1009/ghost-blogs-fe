import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '@models/_index';
import { AlertService, CategoryService } from '@services/_index';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading = false;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.loading = true;
    this.categoryService.getCategorys().subscribe(
      (categories: Category[]) => {
        this.categories = categories;
        this.loading = false;
      },
      (err: any) => {
        console.log(err);
        this.alertService.showNoti(`Get categories fail!`, 'danger');
        this.loading = false;
      }
    );
  }

  delete(category: Category) {
    if (!category) {
      return;
    }
    const id = category._id;
    if (category) {
      this.loading = true;
      this.categoryService.deleteCategory(id)
        .subscribe((_: any) => {
          this.alertService.showNoti('Category deleted!', 'success');
          this.getCategories();
        }, err => {
          this.loading = false;
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
