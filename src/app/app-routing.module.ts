import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './layouts/guest-layout/guest-layout.component';
import { LoginGuard } from '@guards/login.guard';

const routes1: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [{
      path: '',
      loadChildren: () => import('@layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule),
      canActivate: [LoginGuard]
    }]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [{
      path: '',
      loadChildren: () => import('@layouts/guest-layout/guest-layout.module').then(m => m.GuestLayoutModule),
    }]
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes1, {
      enableTracing: true,
      initialNavigation: 'enabledBlocking',
      paramsInheritanceStrategy: 'always'
    })
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
