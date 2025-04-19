import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BookService, AlertService } from '@services/_index';
import { Book, MyFile } from '@models/_index';
import { ActivatedRoute, Router } from '@angular/router';
import { compareWithFunc } from '@shared/common';
import * as dateFns from 'date-fns';
import { FileUploader } from 'ng2-file-upload';
import { environment } from '@environments/environment';
import { CONSTANT, LIST_TRUE_FALSE } from '@shared/constant';
import { BookPermission } from '@shared/enum';
import { FileService } from '@services/_index';
@Component({
  selector: 'book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {

  detailForm!: UntypedFormGroup;
  data: Book[] = [];
  isLoadingResults = true;
  savedFile!: File;
  scoreValue = 1;
  listFileOnServer: MyFile[] = [];
  listTrueFalse = LIST_TRUE_FALSE;

  debounceID = undefined;
  today = dateFns.startOfToday();
  searchDate = new UntypedFormControl(this.today);
  searchStatus = 'NONE';
  itemSelected!: Book | null;
  permissions = [
    BookPermission.PUBLIC,
    BookPermission.PROTECTED,
    BookPermission.PRIVATE,
    BookPermission.READONLY
  ];
  compareWithFunc = compareWithFunc;
  isUpdate = false;
  id = undefined;

  // file uploader
  apiUrl = environment.apiUrl + '/api/book/upload';
  public uploader: FileUploader = new FileUploader({
    url: this.apiUrl,
    itemAlias: 'file',
    authToken: `${localStorage.getItem(CONSTANT.TOKEN)}`
  });

  constructor(
    private bookService: BookService,
    private fileService: FileService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.detailForm = this.formBuilder.group({
      id: [null],
      title: [null, Validators.required],
      isDone: [null, Validators.required],
      slot: [null, Validators.required],
      url: [null, Validators.required],
      score: [null, Validators.required],
      permission: [null, Validators.required],
      description: [null],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.bookService.getBook(id)
          .subscribe(res => {
            const url = (res.url || {} as any).id;
            const urlGet = (res.url || {} as any).urlGet;
            this.itemSelected = {
              ...res,
              urlGet: urlGet,
              url: url
            };
            this.initFormWithData(this.itemSelected);
            this.isUpdate = true;
          });
      } else {
        this.searchBook();
        this.isUpdate = false;
        this.itemSelected = null;
      }
    });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onCompleteItem = (item: any, status: any) => {
      this.alertService.showNoti('File successfully uploaded!', 'success');
    };
    this.fileService.getMyFile({
      ext: '.pdf'
    }).subscribe((res: any) => {
      this.listFileOnServer = res;
    }, err => {
      this.alertService.showNoti('Get list file error. ' + err, 'danger');
    });

  }

  initFormWithData(data = {} as any) {
    this.detailForm.patchValue(data);
    this.isLoadingResults = false;
    this.scoreValue = data.score;
  }

  addBook() {
    this.isLoadingResults = true;
    const sample: Book = {
      slot: 1
    }
    this.bookService.addBook(sample)
      .subscribe((res: any) => {
        this.data.push(res);
        this.isLoadingResults = false;
        this.alertService.showNoti('Add empty book successfully!', 'success');
      }, err => {
        this.isLoadingResults = false;
      });
  }

  searchBook(id = undefined) {
    this._getMyBook(id);
  }

  chooseThisItem(item: Book) {
    this.itemSelected = item;
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { id: item.id },
        queryParamsHandling: 'merge'
      });
  }

  _getMyBook(id = undefined) {
    this.isLoadingResults = true;
    this.bookService.getBooks()
      .subscribe((res: Book[]) => {
        this.data = res.map(el => ({
          ...el,
          userDisplay: '' //this.userService.mapUserName(el.user)
        }));
        if (id) {
          this.itemSelected = res.filter(el => el.id === id)[0];
          this.ref.markForCheck();
        }
        this.isLoadingResults = false;
      }, err => {
        this.isLoadingResults = false;
      });
  }
  saveItem(id: string, item: Book, index = -1) {
    console.log('dangth, item', item);
    this.bookService.updateBook(id, item)
      .subscribe((res: any) => {
      }, err => {
      });
  }
  saveThenBack(newBook: Book) {
    console.log('dangth, newBook', newBook);
    this.saveItem(this.itemSelected?.id || '', newBook);
    this.back();
  }
  back() {
    this.itemSelected = null;
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { id: null },
        queryParamsHandling: 'merge'
      });
  }
  readThisBook() {
    const urlGet = this.itemSelected?.urlGet;
    const title = this.itemSelected?.title;
    this.router.navigate(
      ['../view-book'],
      {
        relativeTo: this.activatedRoute,
        queryParams: { link: urlGet, title: title },
        queryParamsHandling: 'merge'
      });
  }
  deleteBook(book: Book) {
    const val = confirm(`Delete "${book.title}"?`);
    if (val) {
      this.callDeleteBook(book.id || '');
    }
  }
  callDeleteBook(id: string) {
    if (id) {
      this.isLoadingResults = true;
      this.bookService.deleteBook(id)
        .subscribe(({ success }: any) => {
          if (success) {
            this.data = this.data.filter(el => el.id !== id);
          }
          this.isLoadingResults = false;
        }, err => {
          this.isLoadingResults = false;
        });
    }
  }
  onFormSubmit(newBook: Book) {
    this.saveThenBack(newBook);
  }
  getListFileOnServer() {
    this.bookService.getBooks
  }
}
