import { Routes } from '@angular/router';

import { DashboardComponent } from '@views/dashboard/dashboard.component';
import { GrandAdminGuard } from '@app/views/auth-management/auth/grand-admin.guard';
import { LoginGuard } from '@app/views/auth-management/auth/login.guard';
import { ChangePasswordComponent } from '@app/views/auth-management/change-password/change-password.component';
export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard', title: 'Dashboard', component: DashboardComponent, canActivate: [LoginGuard] },
    { path: 'change-password', title: 'Change password', component: ChangePasswordComponent, canActivate: [LoginGuard] },
    {
        path: 'user-management',
        children: [{
            path: '',
            loadChildren: () => import('../../views/user-management/user-management.module').then(m => m.UserManagementModule),
            canActivate: [GrandAdminGuard]
        }]
    },
    {
        path: 'blog',
        children: [{
            path: '',
            loadChildren: () => import('../../views/blog-management/blog-management.module').then(m => m.BlogManagementModule),
            canActivate: [LoginGuard]
        }]
    },
    {
        path: 'tool',
        children: [{
            path: '',
            loadChildren: () => import('../../views/ghost-management/ghost-management.module').then(m => m.GhostManagementModule),
            canActivate: [LoginGuard]
        }]
    },
    {
        path: 'file',
        children: [{
            path: '',
            loadChildren: () => import('../../views/file-management/file-management.module').then(m => m.FileManagementModule),
            canActivate: [LoginGuard]
        }]
    },
    {
        path: 'operation',
        children: [{
            path: '',
            loadChildren: () => import('../../views/operation/operation.module').then(m => m.OperationModule),
            canActivate: [LoginGuard]
        }]
    },
];
