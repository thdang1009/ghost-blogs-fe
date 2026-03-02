import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuestMessageComponent } from './guest-message/guest-message.component';
import { NoteComponent } from './note/note.component';
import { CouponComponent } from './coupon/coupon.component';
import { grandAdminGuard, adminGuard, loginGuard } from '@guards/auth.guards';
import { JournalComponent } from './journal/journal.component';
import { TodoTodayComponent } from './todo-today/todo-today.component';
import { VibeCodingComponent } from './vibe-coding/vibe-coding.component';

const routes: Routes = [
  {
    path: 'todo-today',
    title: `Todo Today`,
    component: TodoTodayComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'note',
    title: `Note`,
    component: NoteComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'guest-message',
    title: `List Guest Message`,
    component: GuestMessageComponent,
    canActivate: [grandAdminGuard],
  },
  {
    path: 'coupon',
    title: `Coupon Management`,
    component: CouponComponent,
    canActivate: [grandAdminGuard],
  },
  {
    path: 'note',
    title: `Notes`,
    component: NoteComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'journal',
    title: `Journal & Gratitude`,
    component: JournalComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'vibe-coding',
    title: `Vibe Coding`,
    component: VibeCodingComponent,
    canActivate: [grandAdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToolRoutingModule {}
