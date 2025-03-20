import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JsonBeautifierComponent } from './json-beautifier/json-beautifier.component';
import { JsonExcelComponent } from './json-excel/json-excel.component';

const routes: Routes = [
  {
    path: 'json-beautifier',
    title: 'JSON Beautifier',
    component: JsonBeautifierComponent
  },
  {
    path: 'json-excel',
    title: 'JSON ⇋ Excel',
    component: JsonExcelComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsefulAppRoutingModule { }
