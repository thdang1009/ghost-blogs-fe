import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeRoutingModule } from './me-routing.module';
import { SharedModule } from '@shared/shared-module.module';
import { AboutMeComponent } from './about-me/about-me.component';
import { DownloadMyCvComponent } from './download-my-cv/download-my-cv.component';
import { HireMeComponent } from './hire-me/hire-me.component';
import { ComponentsModule } from '@components/components.module';
import { SafePipe } from '@pipes/safe-resource.pipe';


@NgModule({
  declarations: [
    AboutMeComponent,
    DownloadMyCvComponent,
    HireMeComponent,
    SafePipe
  ],
  imports: [
    CommonModule,
    MeRoutingModule,
    SharedModule,
    ComponentsModule
  ]
})
export class MeModule { }
