
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UnitConversionPipe } from '@pipes/_index';
import { TableLoadingComponent } from './table-loading/table-loading.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    TableLoadingComponent,
    UnitConversionPipe,
  ],
  exports: [
    TableLoadingComponent,
    UnitConversionPipe,
  ],
  providers: [
  ]
})
export class ReuseComponentModule { }
