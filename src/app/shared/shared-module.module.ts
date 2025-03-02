import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { SimpleTimePipe, TimeAgoPipe } from '@pipes/_index';
import { AngularMaterialModule } from './angular-material/angular-material.module';
@NgModule({
  declarations: [
    TimeAgoPipe,
    SimpleTimePipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // third party
    AutosizeModule,
    AngularMaterialModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // third party
    AutosizeModule,
    // pipes
    TimeAgoPipe,
    SimpleTimePipe,
    AngularMaterialModule
  ]
})
export class SharedModule { }
