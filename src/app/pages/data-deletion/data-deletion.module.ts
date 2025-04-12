import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataDeletionComponent } from './data-deletion.component';
import { SharedModule } from '@shared/shared-module.module';

@NgModule({
  declarations: [
    DataDeletionComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class DataDeletionModule { }
