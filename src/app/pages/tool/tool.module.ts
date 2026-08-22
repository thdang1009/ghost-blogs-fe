import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToolRoutingModule } from './tool-routing.module';
import { SharedModule } from '@shared/shared-module.module';
import { ReuseComponentModule } from '@reuse/reuse.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NoteComponent } from './note/note.component';
import { GuestMessageComponent } from './guest-message/guest-message.component';
import {
  CouponComponent,
  CouponDetailDialogComponent,
  RedemptionInfoDialogComponent,
} from './coupon/coupon.component';
import { JournalComponent } from './journal/journal.component';
import { TodoTodayComponent } from './todo-today/todo-today.component';
import { VibeCodingComponent } from './vibe-coding/vibe-coding.component';
import { LearningRoadmapComponent } from './learning-roadmap/learning-roadmap.component';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
// Todo Today v2 — component con là standalone (§10.1). Parent vẫn nằm trong
// declarations; chuyển parent sang standalone là việc ngoài phạm vi slice này.
import { TodoFocusBarComponent } from './todo-today/todo-focus-bar/todo-focus-bar.component';
import { TodoListComponent } from './todo-today/todo-list/todo-list.component';
import { TodoSettingsSheetComponent } from './todo-today/todo-settings-sheet/todo-settings-sheet.component';
@NgModule({
  declarations: [
    NoteComponent,
    TodoTodayComponent,
    GuestMessageComponent,
    CouponComponent,
    CouponDetailDialogComponent,
    RedemptionInfoDialogComponent,
    JournalComponent,
    VibeCodingComponent,
    LearningRoadmapComponent,
  ],
  imports: [
    CommonModule,
    ToolRoutingModule,
    SharedModule,
    DragDropModule,
    HttpClientModule,
    AngularEditorModule,
    ReuseComponentModule,
    // standalone
    TodoFocusBarComponent,
    TodoListComponent,
    TodoSettingsSheetComponent,
  ],
  providers: [DatePipe],
})
export class ToolModule {}
