import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { ReuseComponentModule } from '@reuse/reuse.module';
import { ComponentsModule } from '../../components/components.module';
import { AuthModule } from '@pages/auth/auth.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    ReuseComponentModule,
    ComponentsModule,
    AuthModule,
  ],
  declarations: [
  ],
  providers: [
  ],
  exports: [
  ]
})

export class AdminLayoutModule { }
