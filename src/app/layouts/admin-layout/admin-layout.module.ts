import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { ReuseComponentModule } from '@app/reuse/reuse.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    ReuseComponentModule,
  ],
  declarations: [
    DashboardComponent,
  ],
  providers: [
  ],
  exports: [
  ]
})

export class AdminLayoutModule { }
