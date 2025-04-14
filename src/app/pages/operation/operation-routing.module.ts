import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from '@guards/admin.guard';
import { TodoLabelListComponent } from './todo-label/todo-label-list/todo-label-list.component';
import { AddTodoLabelComponent } from './todo-label/add-todo-label/add-todo-label.component';
import { GrandAdminGuard } from '@guards/grand-admin.guard';
import { CouponSettingsComponent } from './coupon-settings/coupon-settings.component';

const routes: Routes = [
  { path: 'todo-label-list', title: 'List Todo Label', component: TodoLabelListComponent, canActivate: [AdminGuard] },
  { path: 'todo-label', title: 'Add/Update Todo Label', component: AddTodoLabelComponent, canActivate: [AdminGuard] },
  { path: 'coupon-settings', component: CouponSettingsComponent, canActivate: [GrandAdminGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationRoutingModule { }
