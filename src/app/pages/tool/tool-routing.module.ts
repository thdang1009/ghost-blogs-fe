import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuestMessageComponent } from './guest-message/guest-message.component';
import { NoteComponent } from './note/note.component';
import { CouponComponent } from './coupon/coupon.component';
import { GrandAdminGuard } from '@guards/grand-admin.guard';
import { AdminGuard } from '@guards/admin.guard';
import { JournalComponent } from './journal/journal.component';
import { LoginGuard } from '@guards/login.guard';
import { TodoTodayComponent } from './todo-today/todo-today.component';

const routes: Routes = [
  { path: 'todo-today', title: `Todo Today`, component: TodoTodayComponent, canActivate: [LoginGuard] },
  { path: 'note', title: `Note`, component: NoteComponent, canActivate: [LoginGuard] },
  { path: 'guest-message', title: `List Guest Message`, component: GuestMessageComponent, canActivate: [GrandAdminGuard] },
  { path: 'coupon', title: `Coupon Management`, component: CouponComponent, canActivate: [GrandAdminGuard] },
  { path: 'note', title: `Notes`, component: NoteComponent, canActivate: [AdminGuard] },
  { path: 'journal', title: `Journal & Gratitude`, component: JournalComponent, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolRoutingModule { }
