import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertService } from './alert.service';
@NgModule({
  declarations: [AlertComponent],
  providers: [AlertService],
  imports: [CommonModule, BrowserAnimationsModule],
  exports: [AlertComponent],
})
export class AlertModule {}
