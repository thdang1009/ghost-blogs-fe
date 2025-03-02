import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostDetailComponent } from './post/post-detail/post-detail.component';

const routes2: Routes = [
  // { path: 'blogs/:ref', title: 'Ghost\'s Post', component: PostDetailComponent, canActivate: [] },
];

@NgModule({
  imports: [RouterModule.forChild(routes2)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
