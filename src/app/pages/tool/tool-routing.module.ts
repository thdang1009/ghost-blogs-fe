import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GrandAdminGuard } from '@guards/grand-admin.guard';
import { LoginGuard } from '@guards/login.guard';
import { NoteComponent } from './note/note.component';
import { TodoTodayComponent } from './todo-today/todo-today.component';
import { GuestMessageComponent } from './guest-message/guest-message.component';
import { CouponComponent } from './coupon/coupon.component';
import { CouponSettingsComponent } from '../operation/coupon-settings/coupon-settings.component';
// import { RunJsComponent } from './run-js/run-js.component';

const routes: Routes = [
  { path: 'todo-today', title: `Todo Today`, component: TodoTodayComponent, canActivate: [LoginGuard] },
  { path: 'note', title: `Note`, component: NoteComponent, canActivate: [LoginGuard] },
  { path: 'guest-message', title: `List Guest Message`, component: GuestMessageComponent, canActivate: [GrandAdminGuard] },
  { path: 'coupon', title: `Coupon Management`, component: CouponComponent, canActivate: [GrandAdminGuard] },
  // { path: 'run-js', title: `Run JS`, component: RunJsComponent, canActivate: [GrandAdminGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolRoutingModule { }
