import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReuseComponentModule } from '@reuse/reuse.module';
import { FileRoutingModule } from './file-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { FileUploadModule } from 'ng2-file-upload';
import { ChooseFileComponent } from './file/choose-file/choose-file.component';
import { AddFileComponent } from './file/add-file/add-file.component';
import { FileListComponent } from './file/file-list/file-list.component';
import { BookComponent } from './book/book.component';
import { SharedModule } from '@shared/shared-module.module';
import { ViewBookComponent } from './view-book/view-book.component';
import { ComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ReuseComponentModule,
    FileRoutingModule,
    FileUploadModule,
    SharedModule,
    HttpClientModule,
    ComponentsModule
  ],
  declarations: [
    BookComponent,
    AddFileComponent,
    FileListComponent,
    ChooseFileComponent,
    ViewBookComponent,
  ],
  providers: [
    DatePipe,
  ],
})
export class FileModule { }
