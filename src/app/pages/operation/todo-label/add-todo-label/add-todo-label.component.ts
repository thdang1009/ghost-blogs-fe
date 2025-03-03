import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoLabel } from '@models/_index';
import { TodoLabelService, AlertService } from '@services/_index';
import { showNoti } from '@shared/common';


@Component({
  selector: 'app-add-todo-label',
  templateUrl: './add-todo-label.component.html',
})
export class AddTodoLabelComponent implements OnInit {
  registerForm!: UntypedFormGroup;
  name = '';
  description = '';
  imgUrl = '';
  content = '';
  isLoadingResults = false;
  isUpdate = false;
  id = undefined;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private todoLabelService: TodoLabelService,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      imgUrl: [null],
      imgAlternative: [null, Validators.required],
      autoDetectKeywords: [null, Validators.required],
    });
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.todoLabelService.getTodoLabel(id)
          .subscribe(res => {
            this.initFormWithData(res);
            this.isUpdate = true;
            this.id = id;
          });
      }
    });
  }

  initFormWithData(data = {} as any) {
    this.registerForm.patchValue(data);
  }

  onFormSubmit(data: any) {
    const newTodoLabel: TodoLabel = {
      name: data.name,
      description: data.description,
      imgUrl: data.imgUrl,
      imgAlternative: data.imgAlternative,
      autoDetectKeywords: data.autoDetectKeywords
    }
    this.isUpdate ? this.callUpdate(this.id || '', newTodoLabel) : this.callCreate(newTodoLabel)
  }
  callUpdate(id: string, newValue: TodoLabel) {

    this.todoLabelService.updateTodoLabel(id, newValue)
      .subscribe(todoLabel => {
        if (todoLabel) {
          showNoti(`Update success`, 'success');
          this.router.navigate(['/admin/operation/todo-label-list']);
        }
      }, (err) => {
        console.log(err);
        this.alertService.error(err.error);
      });
  }
  callCreate(newValue: TodoLabel) {

    this.todoLabelService.addTodoLabel(newValue)
      .subscribe(todoLabel => {
        if (todoLabel) {
          showNoti(`Success`, 'success');
          this.router.navigate(['/admin/operation/todo-label-list']);
        }
      }, (err) => {
        console.log(err);
        this.alertService.error(err.error);
      });
  }
}
