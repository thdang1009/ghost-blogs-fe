import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsefulAppRoutingModule } from './apps-routing.module';
import { JsonBeautifierComponent } from './json-beautifier/json-beautifier.component';
import { SharedModule } from '@shared/shared-module.module';
import { JsonExcelComponent } from './json-excel/json-excel.component';


@NgModule({
  declarations: [
    JsonBeautifierComponent,
    JsonExcelComponent,
  ],
  imports: [
    CommonModule,
    UsefulAppRoutingModule,
    SharedModule,
    // NgxFileDropModule,
    // JsonEditorModule,
  ]
})
export class AppsModule { }
