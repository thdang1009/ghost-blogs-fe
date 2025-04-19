import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { GuestNavbarComponent } from './guest-navbar/guest-navbar.component';
import { GuestSidebarComponent } from './guest-sidebar/guest-sidebar.component';
import { FormsModule } from '@angular/forms';
import { ProgressWithLabelComponent } from './progress-with-label/progress-with-label.component';
import { GhostSiteBtnComponent } from './ghost-site-btn/ghost-site-btn.component';
import { ListBadgeComponent } from './list-badge/list-badge.component';
import { AlertComponent } from './alert/alert.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// third party

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DragDropModule,
    BrowserAnimationsModule,
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    GuestNavbarComponent,
    GuestSidebarComponent,
    ProgressWithLabelComponent,
    GhostSiteBtnComponent,
    ListBadgeComponent,
    AlertComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    GuestNavbarComponent,
    GuestSidebarComponent,
    ProgressWithLabelComponent,
    GhostSiteBtnComponent,
    ListBadgeComponent,
    AlertComponent,
  ],
  providers: [
  ]
})
export class ComponentsModule { }
