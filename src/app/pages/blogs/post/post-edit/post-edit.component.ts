import { ChangeDetectorRef, Component, ElementRef, inject, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MyFile, Post } from '@models/_index';
import { EventEmitter } from '@angular/core';
import { POST_STATUS, POST_TYPE } from '@shared/enum';
import { DOCUMENT } from '@angular/common';
import { TagService, CategoryService, FileService } from '@services/_index';
import { compareWithFunc, showNoti } from '@shared/common';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FormControl } from '@angular/forms';
import { Tag, Category } from '@models/_index';
export interface PostSaveWrapper {
  item: Post;
  isBack: boolean;
}

@Component({
  selector: 'post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['../post-list/post-list.component.scss']
})
export class PostEditComponent implements OnInit, OnDestroy {

  @Input() itemSelected = {} as any;
  @Output() save: EventEmitter<PostSaveWrapper> = new EventEmitter<PostSaveWrapper>();

  isLoadingResults = false;
  isSplitHorizontal = false;
  elem: any;
  POST_TYPE = POST_TYPE;
  listPostType = [
    // POST_TYPE.GHOST_EDITOR,
    POST_TYPE.MARKDOWN
  ];
  listPermisson = [
    POST_STATUS.PUBLIC,
    POST_STATUS.PRIVATE
  ];
  allCategory: Category[] = [];
  allTags: Tag[] = [];
  POST_STATUS = POST_STATUS;
  listFileOnServer: MyFile[] = [];
  compareWithFunc = compareWithFunc;
  unSave = true;
  oldObject: any;
  // autocomplete
  tagCtrl = new FormControl('');
  filteredTags!: Observable<Tag[]>;
  tags: Tag[] = [];
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);

  categoryCtrl = new FormControl('');
  filteredCategories!: Observable<Category[]>;
  categories: Category[] = [];
  @ViewChild('categoryInput') categoryInput!: ElementRef<HTMLInputElement>;
  // end autocomplete


  constructor(
    @Inject(DOCUMENT) private document: Document,
    private tagService: TagService,
    private categoryService: CategoryService,
    private fileService: FileService) {
  }

  ngOnInit(): void {
    this.elem = document.getElementById('edit-post-container');

    this.getCategories();
    this.getTags();
    this.fileService.getMyFile({
      type: 'Image'
    }).subscribe((res: any) => {
      this.listFileOnServer = res;
    }, err => {
      showNoti('Get list file error. ' + err, 'danger');
    });
    this.oldObject = JSON.stringify(this.itemSelected);
    window.onbeforeunload = () => this.ngOnDestroy();
    this.unSave = true;
  }

  ngOnDestroy(): void {
    const isChange = this.oldObject !== JSON.stringify(this.itemSelected);
    if (this.unSave && isChange) {
      const val = confirm(`Save change before leave?`);
      if (val) {
        this.save.emit(this.itemSelected);
      }
    }
  }

  getCategories() {
    this.categoryService.getCategorys()
      .subscribe(listCategory => {
        this.allCategory = listCategory;

        this.filteredCategories = this.categoryCtrl.valueChanges.pipe(
          startWith(null),
          map<any, any>((category) => (category ? this._filterCategory(category) : this.allCategory.slice())),
        );
        this.categories = this.itemSelected.category;
      })
  }

  getTags() {
    this.tagService.getTags()
      .subscribe(allTags => {
        this.allTags = allTags;

        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map<any, any>((tag) => (tag ? this._filterTag(tag) : this.allTags.slice())),
        );
        this.tags = this.itemSelected.tags;
      });
  }

  saveOnly() {
    this.doBeforeSave();
    this.unSave = false;
    this.save.emit({ item: this.itemSelected, isBack: false });
  }

  saveAndBack() {
    this.doBeforeSave();
    this.unSave = false;
    this.save.emit({ item: this.itemSelected, isBack: true });
  }

  // tools function
  openFullscreen() {
    this.splitVertical();
    if (!this.elem) {
      this.elem = document.getElementById('edit-post-container');
    }
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  /* Close fullscreen */
  closeFullscreen() {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if ((this.document as any).mozCancelFullScreen) {
      /* Firefox */
      (this.document as any).mozCancelFullScreen();
    } else if ((this.document as any).webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      (this.document as any).webkitExitFullscreen();
    } else if ((this.document as any).msExitFullscreen) {
      /* IE/Edge */
      (this.document as any).msExitFullscreen();
    }
  }
  splitHorizontal() {
    this.isSplitHorizontal = true;
  }
  splitVertical() {
    this.isSplitHorizontal = false;
  }

  addTag(event: MatChipInputEvent): void {
    const newTagName = event.value;

    // migrate from ngx-chips to mat-chip-grid:
    const foundInList = this.allTags.filter(el => el?.name?.toLowerCase() === newTagName.toLowerCase());
    const oldTag = (foundInList || [])[0];
    // chọn cái cũ thì có _id, tạo mới thì chỉ có mỗi name mà còn ko phải là object nữa
    const isOldTag = !!oldTag;
    if (isOldTag) {
      this.tags.push(oldTag);
      return;
    }
    this.tagService.createTagWithName(newTagName)
      .subscribe(newTagFromServer => {
        this.tags.push(newTagFromServer);
        this.getTags();
      }, error => {
        showNoti('Create tag fail ' + error, 'danger');
      });

    // Clear the input value
    event.chipInput!.clear();

    this.tagCtrl.setValue(null);
  }

  removeTag(tag: Tag): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
      this.announcer.announce(`Removed ${tag}`);
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(event.option.value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  addCategory(event: MatChipInputEvent): void {
    const newName = event.value;

    // migrate from ngx-chips to mat-chip-grid:
    const foundInList = this.allCategory.filter(el => el?.name?.toLowerCase() === newName.toLowerCase());
    const oldCategory = (foundInList || [])[0];
    // chọn cái cũ thì có _id, tạo mới thì chỉ có mỗi name mà còn ko phải là object nữa
    const isOldCategory = !!oldCategory;
    if (isOldCategory) {
      this.categories.push(oldCategory);
      return;
    }
    this.categoryService.createCategoryWithName(newName)
      .subscribe(newItemFromServer => {
        this.categories.push(newItemFromServer);
        this.getCategories();
      }, error => {
        showNoti('Create category fail ' + error, 'danger');
      });

    // Clear the input value
    event.chipInput!.clear();

    this.categoryCtrl.setValue(null);
  }

  removeCategory(category: Category): void {
    const index = this.categories.indexOf(category);

    if (index >= 0) {
      this.categories.splice(index, 1);
      this.announcer.announce(`Removed ${category}`);
    }
  }

  selectedCategory(event: MatAutocompleteSelectedEvent): void {
    this.categories.push(event.option.value);
    this.categoryInput.nativeElement.value = '';
    this.categoryCtrl.setValue(null);
  }

  private _filterTag(value: Tag): Tag[] {
    const filterValue = value;
    return this.allTags.filter(item => item.name === filterValue.name);
  }

  private _filterCategory(value: Tag): Tag[] {
    const filterValue = value;
    return this.allCategory.filter(item => item.name === filterValue.name);
  }

  private doBeforeSave() {
    this.itemSelected.tags = this.tags;
    this.itemSelected.category = this.categories;
  }
}
