import { Routes } from '@angular/router';
import { LoginComponent } from '@pages/auth/login/login.component';
import { RegisterComponent } from '@pages/auth/register/register.component';
import { HomeComponent } from '@pages/home/home.component';
import { NotLoginGuard } from '@guards/not-login.guard';
import { LogoutComponent } from '@pages/auth/logout/logout.component';
import { DonationComponent } from '@pages/donation/donation.component';
import { ResetPasswordComponent } from '@pages/auth/reset-password/reset-password.component';
import { PostDetailComponent } from '@pages/blogs/post/post-detail/post-detail.component';
import { ConfirmEmailComponent } from '@pages/user/confirm-email/confirm-email.component';
import { DataDeletionComponent } from '@pages/data-deletion/data-deletion.component';

export const GuestLayoutRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
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
    path: 'data-deletion',
    title: 'Data Deletion Instructions',
    component: DataDeletionComponent
  },
  {
    path: 'me',
    children: [{
      path: '',
      loadChildren: () => import('../../pages/me/me.module').then(m => m.MeModule),
      canActivate: []
    }]
  },
  {
    path: 'confirm-email/:confirmationCode',
    component: ConfirmEmailComponent
  },
];
