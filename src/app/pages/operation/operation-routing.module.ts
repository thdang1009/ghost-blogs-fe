import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { grandAdminGuard, adminGuard } from '@guards/auth.guards';
import { TodoLabelListComponent } from './todo-label/todo-label-list/todo-label-list.component';
import { AddTodoLabelComponent } from './todo-label/add-todo-label/add-todo-label.component';
import { CouponSettingsComponent } from './coupon-settings/coupon-settings.component';
import { MoodListComponent } from './mood/mood-list.component';

const routes: Routes = [
  {
    path: 'todo-label-list',
    title: `Todo Label`,
    component: TodoLabelListComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'todo-label',
    title: `Add/Edit Todo Label`,
    component: AddTodoLabelComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'coupon-settings',
    title: `Coupon Settings`,
    component: CouponSettingsComponent,
    canActivate: [grandAdminGuard],
  },
  {
    path: 'mood',
    title: `Mood Types`,
    component: MoodListComponent,
    canActivate: [adminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperationRoutingModule {}
