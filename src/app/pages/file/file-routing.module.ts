import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookComponent } from './book/book.component';
import { AddFileComponent } from './file/add-file/add-file.component';
import { FileListComponent } from './file/file-list/file-list.component';
import { ViewBookComponent } from './view-book/view-book.component';
import { AdminGuard } from '@guards/admin.guard';

const routes: Routes = [
  { path: 'book', title: `Book`, component: BookComponent, canActivate: [AdminGuard] },
  { path: 'file', title: `Add/Update File`, component: AddFileComponent, canActivate: [AdminGuard] },
  { path: 'file-list', title: `List File`, component: FileListComponent, canActivate: [AdminGuard] },
  { path: 'view-book', title: `View Book`, component: ViewBookComponent, canActivate: [AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileRoutingModule { }
