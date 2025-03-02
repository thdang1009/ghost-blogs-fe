import { Routes } from '@angular/router';
import { LoginComponent } from '@app/views/auth-management/login/login.component';
import { RegisterComponent } from '@app/views/auth-management/register/register.component';
import { HomeComponent } from '@app/views/home/home.component';
import { NotLoginGuard } from '@app/views/auth-management/auth/not-login.guard';
import { LogoutComponent } from '@app/views/auth-management/logout/logout.component';
import { ConfirmEmailComponent } from '@app/views/user-management/confirm-email/confirm-email.component';
import { DonationComponent } from '@app/views/donation/donation.component';
import { PostDetailComponent } from '@app/views/blog-management/post/post-detail/post-detail.component';
import { ResetPasswordComponent } from '@app/views/auth-management/reset-password/reset-password.component';

export const GuestLayoutRoutes: Routes = [
    {
        path: 'blogs/:ref',
        title: 'Ghost\'s Posts',
        component: PostDetailComponent,
    },
    {
        path: 'home',
        title: 'Ghost\'s Blogs',
        component: HomeComponent
    },
    {
        path: 'reset-password',
        title: 'Reset password',
        component: ResetPasswordComponent, canActivate: [NotLoginGuard]
    },
    {
        path: 'login',
        title: 'Login',
        component: LoginComponent, canActivate: [NotLoginGuard]
    },
    {
        path: 'logout',
        title: 'Logout',
        component: LogoutComponent
    },
    {
        path: 'register',
        title: 'Register',
        component: RegisterComponent, canActivate: [NotLoginGuard]
    },
    {
        path: 'donation',
        title: 'Donate',
        component: DonationComponent
    },
    {
        path: 'me',
        children: [{
            path: '',
            loadChildren: () => import('../../views/me/me.module').then(m => m.MeModule),
            canActivate: []
        }]
    },
    {
        path: 'index',
        children: [{
            path: '',
            loadChildren: () => import('../../views/code-index/code-index.module').then(m => m.CodeIndexModule),
            canActivate: []
        }]
    },
    {
        path: 'useful-app',
        children: [{
            path: '',
            loadChildren: () => import('../../views/useful-app/useful-app.module').then(m => { return m.UsefulAppModule }),
            canActivate: []
        }]
    },
    {
        path: 'confirm-email/:confirmationCode',
        component: ConfirmEmailComponent
    },
];
