import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToolRoutingModule } from './tool-routing.module';
import { SharedModule } from '@shared/shared-module.module';
import { ReuseComponentModule } from '@reuse/reuse.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NoteComponent } from './note/note.component';
import { GuestMessageComponent } from './guest-message/guest-message.component';
import { CouponComponent, CouponDetailDialogComponent, RedemptionInfoDialogComponent } from './coupon/coupon.component';
import { JournalComponent } from './journal/journal.component';
import { TodoTodayComponent } from './todo-today/todo-today.component';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
@NgModule({
  declarations: [
    NoteComponent,
    TodoTodayComponent,
    GuestMessageComponent,
    CouponComponent,
    CouponDetailDialogComponent,
    RedemptionInfoDialogComponent,
    JournalComponent
  ],
  imports: [
    CommonModule,
    ToolRoutingModule,
    SharedModule,
    DragDropModule,
    HttpClientModule,
    AngularEditorModule,
    ReuseComponentModule,
  ],
  providers: [
    DatePipe,
  ]
})
export class ToolModule { }
