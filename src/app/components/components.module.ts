import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { GuestNavbarComponent } from './guest-navbar/guest-navbar.component';
import { GuestSidebarComponent } from './guest-sidebar/guest-sidebar.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressWithLabelComponent } from './progress-with-label/progress-with-label.component';
import { GhostSiteBtnComponent } from './ghost-site-btn/ghost-site-btn.component';
import { ListBadgeComponent } from './list-badge/list-badge.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TagSubscribeComponent, EmailDialogComponent } from './tag-subscribe/tag-subscribe.component';
import { SharedModule } from '@shared/shared-module.module';
// third party

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    SharedModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    GuestNavbarComponent,
    GuestSidebarComponent,
    SearchResultsComponent,
    ProgressWithLabelComponent,
    GhostSiteBtnComponent,
    ListBadgeComponent,
    TagSubscribeComponent,
    EmailDialogComponent
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    GuestNavbarComponent,
    GuestSidebarComponent,
    SearchResultsComponent,
    ProgressWithLabelComponent,
    GhostSiteBtnComponent,
    ListBadgeComponent,
    TagSubscribeComponent
  ],
  providers: [
  ]
})
export class ComponentsModule { }
