import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuestLayoutRoutes } from './guest-layout.routing';
import { HomeComponent } from '@pages/home/home.component';
import { ComponentsModule } from '@components';
import { ReuseComponentModule } from '@reuse/reuse.module';
import { SharedModule } from '@shared/shared-module.module';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(GuestLayoutRoutes),
    ComponentsModule,
    ReuseComponentModule,
    SharedModule,
  ],
  declarations: [
    HomeComponent,
  ]
})

export class GuestLayoutModule { }
