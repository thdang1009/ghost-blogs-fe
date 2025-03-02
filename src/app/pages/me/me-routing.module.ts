import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutMeComponent } from './about-me/about-me.component';
import { DownloadMyCvComponent } from './download-my-cv/download-my-cv.component';
import { HireMeComponent } from './hire-me/hire-me.component';

const routes: Routes = [
  { path: 'about-me', title: 'About Ghost', component: AboutMeComponent, canActivate: [] },
  { path: 'hire-me', title: 'Hire Ghost', component: HireMeComponent, canActivate: [] },
  { path: 'download-my-cv', title: 'Download my CV', component: DownloadMyCvComponent, canActivate: [] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeRoutingModule { }
