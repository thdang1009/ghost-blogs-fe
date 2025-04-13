import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ToolRoutingModule } from './tool-routing.module';
import { NoteComponent } from './note/note.component';
import { TodoTodayComponent } from './todo-today/todo-today.component';
import { SharedModule } from '@shared/shared-module.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReuseComponentModule } from '@reuse/reuse.module';

import { HttpClientModule } from '@angular/common/http';
// angular rich text editor
import { AngularEditorModule } from '@kolkov/angular-editor';
import { GuestMessageComponent } from './guest-message/guest-message.component';
import { CouponComponent } from './coupon/coupon.component';
// import { RunJsComponent } from './run-js/run-js.component';

@NgModule({
  declarations: [
    NoteComponent,
    TodoTodayComponent,
    GuestMessageComponent,
    CouponComponent,
    // RunJsComponent,
  ],
  imports: [
    CommonModule,
    ToolRoutingModule,
    SharedModule,
    DragDropModule,
    HttpClientModule,
    AngularEditorModule,
    ReuseComponentModule,
    // CodeEditorModule.forChild(),
  ],
  providers: [
    DatePipe,
  ]
})
export class ToolModule { }
