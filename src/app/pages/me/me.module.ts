import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeRoutingModule } from './me-routing.module';
import { SharedModule } from '@shares/shared-module.module';
import { AboutMeComponent } from './about-me/about-me.component';
import { DownloadMyCvComponent } from './download-my-cv/download-my-cv.component';
import { HireMeComponent } from './hire-me/hire-me.component';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { ComponentsModule } from '@app/components/components.module';
import { SafePipe } from '@app/_pipes/safe-resource.pipe';


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
    NgxTypedJsModule,
    ComponentsModule
  ]
})
export class MeModule { }
