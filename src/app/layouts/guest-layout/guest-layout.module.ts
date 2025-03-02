import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuestLayoutRoutes } from './guest-layout.routing';
import { HomeComponent } from '@app/views/home/home.component';
import { ComponentsModule } from '@app/components/components.module';
import { ReuseComponentModule } from '@app/_reuse/reuse.module';
import { SharedModule } from '@app/_shares/shared-module.module';
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
