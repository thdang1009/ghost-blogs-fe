import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeRoutingModule } from './me-routing.module';
import { SharedModule } from '@shared/shared-module.module';
import { AboutMeComponent } from './about-me/about-me.component';
import { HireMeComponent } from './hire-me/hire-me.component';
import { ComponentsModule } from '@components/components.module';
import { SafePipe } from '@pipes/safe-resource.pipe';
import { NgxTypedWriterModule } from 'ngx-typed-writer';

@NgModule({
  declarations: [
    AboutMeComponent,
    HireMeComponent,
    SafePipe
  ],
  imports: [
    CommonModule,
    MeRoutingModule,
    SharedModule,
    ComponentsModule,
    NgxTypedWriterModule
  ]
})
export class MeModule { }
