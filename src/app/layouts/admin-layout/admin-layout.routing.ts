import { Routes } from '@angular/router';

import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { LoginGuard } from '@guards/login.guard';
import { GrandAdminGuard } from '@guards/grand-admin.guard';
export const AdminLayoutRoutes: Routes = [
  { path: 'dashboard', title: 'Dashboard', component: DashboardComponent, canActivate: [LoginGuard] },
  // { path: 'change-password', title: 'Change password', component: ChangePasswordComponent, canActivate: [LoginGuard] },
  {
    path: 'user',
    children: [{
      path: '',
      loadChildren: () => import('../../pages/user/user.module').then(m => m.UserModule),
      canActivate: [GrandAdminGuard]
    }]
  },
  {
    path: 'blog',
    children: [{
      path: '',
      loadChildren: () => import('../../pages/blogs/blog.module').then(m => m.BlogManagementModule),
      canActivate: [LoginGuard]
    }]
  },
  {
    path: 'tool',
    children: [{
      path: '',
      loadChildren: () => import('../../pages/tool/tool.module').then(m => m.ToolModule),
      canActivate: [LoginGuard]
    }]
  },
  {
    path: 'file',
    children: [{
      path: '',
      loadChildren: () => import('../../pages/file/file.module').then(m => m.FileModule),
      canActivate: [LoginGuard]
    }]
  },
  {
    path: 'operation',
    children: [{
      path: '',
      loadChildren: () => import('../../pages/operation/operation.module').then(m => m.OperationModule),
      canActivate: [LoginGuard]
    }]
  },
  // {
  //   path: 'apps',
  //   children: [{
  //     path: '',
  //     loadChildren: () => import('../../pages/apps/apps.module').then(m => { return m.AppsModule }),
  //     canActivate: [LoginGuard]
  //   }]
  // },
];
