import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostDetailComponent } from './post/post-detail/post-detail.component';
import { TagListComponent } from './tag/tag-list/tag-list.component';
import { AdminGuard } from '@guards/admin.guard';
import { PostListComponent } from './post/post-list/post-list.component';
import { LoginGuard } from '@guards/login.guard';
import { AddTagComponent } from './tag/add-tag/add-tag.component';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { AddCategoryComponent } from './category/add-category/add-category.component';
import { SeriesListComponent } from './series/series-list/series-list.component';
import { SeriesAddComponent } from './series/series-add/series-add.component';
import { PostAnalyticsComponent } from './analytics/post-analytics.component';

const routes2: Routes = [
  {
    path: 'post-list',
    title: 'List Post',
    component: PostListComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'blogs/:ref',
    title: "Ghost's Post",
    component: PostDetailComponent,
    canActivate: [],
    pathMatch: 'full',
  },
  {
    path: 'tag-list',
    title: 'List Tag',
    component: TagListComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'tag',
    title: 'Add/Update Tag',
    component: AddTagComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'category-list',
    title: 'List Category',
    component: CategoryListComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'category',
    title: 'Add/Update Category',
    component: AddCategoryComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'series-list',
    title: 'List Series',
    component: SeriesListComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'series',
    title: 'Add/Update Series',
    component: SeriesAddComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'analytics',
    title: 'Post Analytics',
    component: PostAnalyticsComponent,
    canActivate: [AdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes2)],
  exports: [RouterModule],
})
export class BlogRoutingModule {}
