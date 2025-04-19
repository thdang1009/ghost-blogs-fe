import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MyFile } from '@models/_index';
import { FileService, AlertService } from '@services/_index';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
  index = 0;
  isRunning = false;
  listAll: MyFile[] = [];
  files: MyFile[] = [];
  isPreview = false;
  constructor(
    private fileService: FileService,
    private router: Router,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.getFiles();
  }

  resetParams() {
    this.index = 0;
    this.listAll.length = 0;
    this.files.length = 0;
  }

  getFiles() {
    this.resetParams();
    this.fileService.getAllFile().subscribe(files => {
      this.listAll = files;
      this.files = this.getMoreFiles();
    }, (err) => {
      console.log(err);
      this.alertService.showNoti(`Get file fail!`, 'danger');
    });
  }
  getMoreFiles(pageSize = 10) {
    const tempArray = [];
    for (let i = 0; i < pageSize; i++, this.index++) {
      if (this.listAll[this.index])
        tempArray.push(this.listAll[this.index]);
    }
    return tempArray;
  }
  delete(id: string) {
    if (!id) {
      return;
    }
    if (id) {
      this.fileService.deleteFile(id)
        .subscribe((res: any) => {
          if (res.success) {
            this.alertService.showNoti('File deleted!', 'success');
            this.listAll = this.listAll.filter(el => el.id !== id);
            this.files = this.files.filter(el => el.id !== id);
            // this.getFiles();
          }
        }, err => {
        });
    }
  }
  deleteItem(item: MyFile) {
    const val = confirm(`Delete "${item.originName}"?`);
    if (val) {
      this.delete(item.id!);
    }
  }
  edit(file: MyFile) {
    if (!file) {
      return;
    }
    this.router.navigate(
      ['admin/file/file'],
      {
        queryParams: { id: file.id }
      });
  }
  uploadNewFile() {
    this.router.navigate(
      ['admin/file/file'],
      {
      });
  }
  showPreview() {
    this.isPreview = !this.isPreview;
  }
  showMore() {
    this.files = [...this.files, ...this.getMoreFiles()];
  }
}
