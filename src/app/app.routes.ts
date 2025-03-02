import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '@layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from '@layouts/guest-layout/guest-layout.component';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  }, {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [{
      path: '',
      loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule),
      canActivate: [LoginGuard]
    }]
  }, {
    path: '',
    component: GuestLayoutComponent,
    children: [{
      path: '',
      loadChildren: () => import('./layouts/guest-layout/guest-layout.module').then(m => m.GuestLayoutModule),
    }]
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];
