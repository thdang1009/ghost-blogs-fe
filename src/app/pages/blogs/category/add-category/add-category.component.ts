import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '@models/_index';
import { CategoryService, AlertService } from '@services/_index';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
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
        this.isLoadingResults = true;
        this.categoryService.getCategory(id)
          .subscribe(res => {
            this.initFormWithData(res);
            this.isUpdate = true;
            this.id = id;
            this.isLoadingResults = false;
          }, error => {
            this.isLoadingResults = false;
            this.alertService.showNoti('Failed to load category', 'danger');
          });
      }
    });
  }

  initFormWithData(data = {} as any) {
    this.registerForm.patchValue(data);
  }

  onFormSubmit(data: any) {
    this.isLoadingResults = true;
    const updateObj: Category = {
      name: data.name,
      content: data.content,
      description: data.description,
      imgUrl: data.imgUrl,
    };
    this.isUpdate ? this.callUpdate(this.id!, updateObj) : this.callCreate(updateObj);
  }

  callUpdate(id: string, newValue: Category) {
    this.categoryService.updateCategory(id, newValue)
      .subscribe(category => {
        if (category) {
          this.alertService.showNoti(`Update success`, 'success');
          this.router.navigate(['/admin/blog/category-list']);
        }
        this.isLoadingResults = false;
      }, (err) => {
        console.log(err);
        this.alertService.error(err.error);
        this.isLoadingResults = false;
      });
  }

  callCreate(newValue: Category) {
    this.categoryService.addCategory(newValue)
      .subscribe(category => {
        if (category) {
          this.alertService.showNoti(`Success`, 'success');
          this.router.navigate(['/admin/blog/category-list']);
        }
        this.isLoadingResults = false;
      }, (err) => {
        console.log(err);
        this.alertService.error(err.error);
        this.isLoadingResults = false;
      });
  }

  cancel() {
    this.router.navigate(['/admin/blog/category-list']);
  }
}
