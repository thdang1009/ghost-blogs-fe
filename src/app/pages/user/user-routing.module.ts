import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { grandAdminGuard } from '@guards/auth.guards';
import { AddUserComponent } from './add-user/add-user.component';
import { UserListComponent } from './user-list/user-list.component';

const routes: Routes = [
  {
    path: 'add-user',
    title: 'Add User',
    component: AddUserComponent,
    canActivate: [grandAdminGuard],
  },
  {
    path: 'user-list',
    title: 'List User',
    component: UserListComponent,
    canActivate: [grandAdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
