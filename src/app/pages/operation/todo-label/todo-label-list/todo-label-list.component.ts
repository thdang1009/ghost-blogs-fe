import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TodoLabel } from '@models/_index';
import { TodoLabelService, AlertService } from '@services/_index';

@Component({
  selector: 'app-todo-label-list',
  templateUrl: './todo-label-list.component.html',
  styleUrls: ['./todo-label-list.component.scss']
})
export class TodoLabelListComponent implements OnInit {
  todoLabels: TodoLabel[] = [];
  loading = false;

  constructor(
    private todoLabelService: TodoLabelService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getTodoLabels();
  }

  getTodoLabels() {
    this.loading = true;
    this.todoLabelService.getTodoLabels().subscribe(todoLabels => {
      this.todoLabels = todoLabels;
      this.loading = false;
    }, (err) => {
      console.log(err);
      this.alertService.showNoti(`Failed to load labels!`, 'danger');
      this.loading = false;
    });
  }

  delete(todoLabel: TodoLabel) {
    if (!todoLabel) {
      return;
    }
    const id = todoLabel._id;
    if (todoLabel) {
      this.loading = true;
      this.todoLabelService.deleteTodoLabel(id)
        .subscribe((_: any) => {
          this.alertService.showNoti('Label deleted successfully!', 'success');
          this.getTodoLabels();
        }, err => {
          this.loading = false;
          this.alertService.showNoti('Failed to delete label', 'danger');
        });
    }
  }

  edit(todoLabel: TodoLabel) {
    if (!todoLabel) {
      return;
    }
    this.router.navigate(
      ['admin/operation/todo-label'],
      {
        queryParams: { id: todoLabel._id }
      });
  }
}
