import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutMeComponent } from './about-me/about-me.component';
import { HireMeComponent } from './hire-me/hire-me.component';

const routes3: Routes = [
  { path: 'about-me', title: 'About Ghost', component: AboutMeComponent, canActivate: [] },
  { path: 'hire-me', title: 'Hire Ghost', component: HireMeComponent, canActivate: [] },
];

@NgModule({
  imports: [RouterModule.forChild(routes3)],
  exports: [RouterModule]
})
export class MeRoutingModule { }
