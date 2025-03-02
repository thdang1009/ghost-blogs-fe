import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { RegisterComponent } from './register/register.component';
import { SharedModule } from '@shared/shared-module.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';


@NgModule({
  declarations: [
    LoginComponent,
    LogoutComponent,
    RegisterComponent,
    ResetPasswordComponent,
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class AuthModule { }
