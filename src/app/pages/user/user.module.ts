import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { AddUserComponent } from './add-user/add-user.component';
import { SharedModule } from '@shared/shared-module.module';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { ReuseComponentModule } from '@reuse/reuse.module';
import { ManageSubscriptionsComponent } from './subscriptions/manage-subscriptions.component';


@NgModule({
  declarations: [
    UserListComponent,
    AddUserComponent,
    ConfirmEmailComponent,
    ManageSubscriptionsComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
    ReuseComponentModule
  ]
})
export class UserModule { }
