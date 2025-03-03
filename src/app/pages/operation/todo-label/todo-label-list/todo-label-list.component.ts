import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TodoLabel } from '@models/_index';
import { TodoLabelService } from '@services/_index';
import { showNoti } from '@shared/common';

@Component({
  selector: 'app-todo-label-list',
  templateUrl: './todo-label-list.component.html'
})
export class TodoLabelListComponent implements OnInit {


  todoLabels: TodoLabel[] = [];
  constructor(private todoLabelService: TodoLabelService,
    private router: Router) { }

  ngOnInit(): void {
    this.getTodoLabels();
  }
  getTodoLabels() {
    this.todoLabelService.getTodoLabels().subscribe(todoLabels => {
      this.todoLabels = todoLabels;
    }, (err) => {
      console.log(err);
      showNoti(`Create todoLabel fail!`, 'danger');
    });
  }
  delete(todoLabel: TodoLabel) {

    if (!todoLabel) {
      return;
    }
    const id = todoLabel._id;
    if (todoLabel) {
      this.todoLabelService.deleteTodoLabel(id)
        .subscribe((_: any) => {
          showNoti('TodoLabel deleted!', 'success');
          this.getTodoLabels();
        }, err => {
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
