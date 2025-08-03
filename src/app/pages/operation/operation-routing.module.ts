import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GrandAdminGuard } from '@guards/grand-admin.guard';
import { AdminGuard } from '@guards/admin.guard';
import { TodoLabelListComponent } from './todo-label/todo-label-list/todo-label-list.component';
import { AddTodoLabelComponent } from './todo-label/add-todo-label/add-todo-label.component';
import { CouponSettingsComponent } from './coupon-settings/coupon-settings.component';
import { MoodListComponent } from './mood/mood-list.component';

const routes: Routes = [
  { path: 'todo-label-list', title: `Todo Label`, component: TodoLabelListComponent, canActivate: [AdminGuard] },
  { path: 'todo-label', title: `Add/Edit Todo Label`, component: AddTodoLabelComponent, canActivate: [AdminGuard] },
  { path: 'coupon-settings', title: `Coupon Settings`, component: CouponSettingsComponent, canActivate: [GrandAdminGuard] },
  { path: 'mood', title: `Mood Types`, component: MoodListComponent, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationRoutingModule { }
