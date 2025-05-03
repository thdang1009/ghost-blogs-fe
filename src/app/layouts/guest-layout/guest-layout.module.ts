import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuestLayoutRoutes } from './guest-layout.routing';
import { HomeComponent } from '@pages/home/home.component';
import { ComponentsModule } from '@components/components.module';
import { ReuseComponentModule } from '@reuse/reuse.module';
import { SharedModule } from '@shared/shared-module.module';
import { AuthModule } from '@pages/auth/auth.module';
import { DataDeletionModule } from '@pages/data-deletion/data-deletion.module';
import { BlogManagementModule } from '@pages/blogs/blog.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(GuestLayoutRoutes),
    ComponentsModule,
    ReuseComponentModule,
    SharedModule,
    AuthModule,
    DataDeletionModule,
    RouterModule,
    BlogManagementModule
  ],
  declarations: [
    HomeComponent,
  ]
})

export class GuestLayoutModule { }
