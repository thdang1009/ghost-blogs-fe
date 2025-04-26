import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared-module.module';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Define routes for dashboard
const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' }
];

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class DashboardModule { }
