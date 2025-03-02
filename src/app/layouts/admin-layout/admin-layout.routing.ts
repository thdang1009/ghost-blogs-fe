import { Routes } from '@angular/router';

import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { LoginGuard } from '@guards/login.guard';
export const AdminLayoutRoutes: Routes = [
  { path: 'dashboard', title: 'Dashboard', component: DashboardComponent, canActivate: [LoginGuard] },
];
