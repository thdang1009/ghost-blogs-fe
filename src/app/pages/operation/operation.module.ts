import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared-module.module';
import { OperationRoutingModule } from './operation-routing.module';
import { TodoLabelListComponent } from './todo-label/todo-label-list/todo-label-list.component';
import { AddTodoLabelComponent } from './todo-label/add-todo-label/add-todo-label.component';
import { CouponSettingsComponent } from './coupon-settings/coupon-settings.component';
import { MoodListComponent } from './mood/mood-list.component';
import { ReuseComponentModule } from '@reuse/reuse.module';

@NgModule({
  declarations: [
    TodoLabelListComponent,
    AddTodoLabelComponent,
    CouponSettingsComponent,
    MoodListComponent
  ],
  imports: [
    CommonModule,
    ReuseComponentModule,
    SharedModule,
    OperationRoutingModule,
    SharedModule,
  ]
})
export class OperationModule { }
