import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostDetailComponent } from './post/post-detail/post-detail.component';
import { TagListComponent } from './tag/tag-list/tag-list.component';
import { adminGuard, loginGuard } from '@guards/auth.guards';
import { PostListComponent } from './post/post-list/post-list.component';
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
    canActivate: [loginGuard],
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
    canActivate: [adminGuard],
  },
  {
    path: 'tag',
    title: 'Add/Update Tag',
    component: AddTagComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'category-list',
    title: 'List Category',
    component: CategoryListComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'category',
    title: 'Add/Update Category',
    component: AddCategoryComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'series-list',
    title: 'List Series',
    component: SeriesListComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'series',
    title: 'Add/Update Series',
    component: SeriesAddComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'analytics',
    title: 'Post Analytics',
    component: PostAnalyticsComponent,
    canActivate: [adminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes2)],
  exports: [RouterModule],
})
export class BlogRoutingModule {}
