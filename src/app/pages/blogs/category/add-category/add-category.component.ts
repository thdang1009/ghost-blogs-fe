import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '@models/_index';
import { CategoryService, AlertService } from '@services/_index';


@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html'
})
export class AddCategoryComponent implements OnInit {
  registerForm!: UntypedFormGroup;
  name = '';
  description = '';
  imgUrl = '';
  content = '';
  isLoadingResults = false;
  isUpdate = false;
  id: string | undefined;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      imgUrl: [null, Validators.required],
      content: [null, Validators.required],
    });
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.categoryService.getCategory(id)
          .subscribe(res => {
            this.initFormWithData(res);
            this.isUpdate = true;
            this.id = id;
          }, err => {
            console.log(err);
          });
      }
    });
  }

  initFormWithData(data = {} as any) {
    this.registerForm.patchValue(data);
  }

  onFormSubmit(data: any) {
    const newCategory: Category = {
      name: data.name,
      description: data.description,
      imgUrl: data.imgUrl,
      content: data.content
    }
    this.isUpdate ? this.callUpdate(this.id!, newCategory) : this.callCreate(newCategory)
  }
  callUpdate(id: string, newCategory: Category) {
    this.categoryService.updateCategory(id, newCategory)
      .subscribe(category => {
        if (category) {
          this.alertService.showNoti(`Update success`, 'success');
          this.router.navigate(['/admin/blog/category-list']);
        }
      }, (err) => {
        console.log(err);
        this.alertService.error(err.error);
      });
  }

  callCreate(newCategory: Category) {
    this.categoryService.addCategory(newCategory)
      .subscribe(category => {
        if (category) {
          this.alertService.showNoti(`Create success`, 'success');
          this.router.navigate(['/admin/blog/category-list']);
        }
      }, (err) => {
        console.log(err);
        this.alertService.error(err.error);
      });
  }
}
