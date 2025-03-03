import { Component, Input, OnInit, Output } from '@angular/core';
import { MyFile } from '@models/my-file';
import { Subscription } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { FileService } from '@services/_index';
import { getRandomInt, showNoti } from '@shared/common';

@Component({
  selector: 'choose-file',
  templateUrl: './choose-file.component.html',
})
export class ChooseFileComponent implements OnInit {

  @Input()
  requiredFileType!: string;

  @Output()
  uploadDone: EventEmitter<MyFile> = new EventEmitter();

  listFileName: string[] = [];
  uploadProgress!: number;
  randomNumber: number = 0;
  uploadSub!: Subscription | null;
  isUploading = false;

  constructor(
    private fileService: FileService,
  ) { }

  ngOnInit(): void {

  }

  fakeProgessing() {
    const middle = getRandomInt(20, 80);
    const first = getRandomInt(1, middle);
    const second = getRandomInt(middle, 99);
    this.randomNumber = first;
    setTimeout(() => {
      this.randomNumber = second;
    }, 1000)
  }

  onFileSelected(event: any) {
    const files: File[] = event.target.files;
    if (files && files.length) {
      this.listFileName.length = 0;
      Array.from(files).forEach((file, index) => {
        this.fakeProgessing();
        this.listFileName[index] = file.name;
        const formData = new FormData();
        formData.append('file', file);
        this.isUploading = true;
        const numOfFile = files.length;
        this.fileService.uploadFile(formData)
          .subscribe(fileResponse => {
            this.isUploading = false;
            if (fileResponse) {
              showNoti(`Upload success file ${index + 1} - ${file.name}`, 'success');
              if (numOfFile > 1 && index + 1 >= numOfFile) {
                showNoti(`Upload all files`, 'info');
                this.uploadDone.emit(fileResponse);
                // TODO: redirect to list file instead of file detail
              } else if (numOfFile === 1) {
                this.uploadDone.emit(fileResponse);
              }

            } else {
              showNoti(`Upload fail file ${index + 1} - ${file.name}`, 'error');
            }
          }, (err) => {
            this.isUploading = false;
            console.log(err);
            showNoti(`Upload fail. Error: ${err}`, 'danger');
          });
      });
    }
  }

  cancelUpload() {
    this.uploadSub?.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = 0;
    this.uploadSub = null;
  }
}
