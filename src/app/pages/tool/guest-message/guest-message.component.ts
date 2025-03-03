import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GuestMessage } from '@models/_index';
import { GuestMessageService } from '@services/_index';
import * as dateFns from 'date-fns';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { environment } from '@environments/environment';
const apiUrl = environment.apiUrl + '/v1/file';
@Component({
  selector: 'app-guest-message',
  templateUrl: './guest-message.component.html',
  styleUrls: ['./guest-message.component.scss']
})
export class GuestMessageComponent implements OnInit {

  data: GuestMessage[] = [];
  isLoadingResults = true;
  detailForm!: UntypedFormGroup;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: false,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: apiUrl + '/upload',

    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
    ]
  };

  debounceID = undefined;
  today = dateFns.startOfToday();
  searchDate = new UntypedFormControl(this.today);
  searchStatus = 'NONE';
  itemSelected: GuestMessage | undefined;

  constructor(
    private guestMessageService: GuestMessageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit() {
    this.detailForm = this.formBuilder.group({
      id: [null],
      message: [null, Validators.required],
      name: [null, Validators.required],
      subject: [null, Validators.required],
      email: [null, Validators.required]
    });
    this.activatedRoute.queryParams.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.guestMessageService.getGuestMessage(id)
          .subscribe(guestMessage => {
            this.initFormWithData(guestMessage);
            this.itemSelected = guestMessage;
          });
      } else {
        this.itemSelected = undefined;
        this.searchGuestMessage();
      }
    });

  }

  searchGuestMessage(id = undefined) {
    this.getGuestMessage(id);
  }

  chooseThisItem(item: GuestMessage) {
    this.itemSelected = item;
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { id: item.id },
        queryParamsHandling: 'merge'
      });
  }

  initFormWithData(data = {} as any) {
    this.detailForm.patchValue(data);
  }

  getGuestMessage(id = undefined) {
    const req = {
    }
    this.isLoadingResults = true;
    this.guestMessageService.getGuestMessages(req)
      .subscribe((res: any) => {
        this.data = res;
        if (id) {
          const item = res.filter((el: GuestMessage) => el.id === id);
          this.itemSelected = item;
          this.initFormWithData(item);
        }
        this.isLoadingResults = false;
      }, err => {
        this.isLoadingResults = false;
      });
  }
  back() {
    this.itemSelected = undefined;
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { id: null },
        queryParamsHandling: 'merge'
      });
  }
  deleteGuestMessage(guestMessage: GuestMessage) {
    const val = confirm(`Delete "${guestMessage.name}"?`);
    if (val) {
      this.callDeleteGuestMessage(Number(guestMessage.id));
    }
  }
  callDeleteGuestMessage(id: number) {
    if (id) {
      this.isLoadingResults = true;
      this.guestMessageService.deleteGuestMessage(id)
        .subscribe((_: any) => {
          this.data = this.data.filter((el: GuestMessage) => el.id?.toString() !== id.toString());
          this.isLoadingResults = false;
        }, err => {
          this.isLoadingResults = false;
        });
    }
  }
}
