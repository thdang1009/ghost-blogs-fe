import { Component, ElementRef, inject, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MyFile, Post, Series } from '@models/_index';
import { EventEmitter } from '@angular/core';
import { POST_STATUS, POST_TYPE } from '@shared/enum';
import { DOCUMENT } from '@angular/common';
import { TagService, CategoryService, FileService, AlertService, SeriesService } from '@services/_index';
import { compareWithFunc } from '@shared/common';
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

  compareBothIdAndObjectWithFunc = (a: any, b: any) => {
    const aId = a._id || a;
    const bId = b._id || b;
    return aId === bId;
  }

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
  allSeriesPosts: Post[] = [];
  allTags: Tag[] = [];
  allSeries: Series[] = [];
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

  compareIdOnlyFunc = (a: any, b: any) => {
    return a._id === b._id;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private tagService: TagService,
    private categoryService: CategoryService,
    private fileService: FileService,
    private seriesService: SeriesService,
    private alertService: AlertService
  ) {
  }

  ngOnInit(): void {
    this.elem = document.getElementById('edit-post-container');

    // Initialize tags and categories arrays from the model
    this.tags = this.itemSelected.tags || [];
    this.categories = this.itemSelected.category || [];

    this.getCategories();
    this.getTags();
    this.getSeries();
    this.getSeriesPosts();
    this.fileService.getMyFile({
      type: 'Image'
    }).subscribe((res: any) => {
      this.listFileOnServer = res;
    }, err => {
      this.alertService.showNoti('Get list file error. ' + err, 'danger');
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

        // Only initialize categories if not already set
        if (!this.categories || this.categories.length === 0) {
          this.categories = this.itemSelected.category || [];
        }
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

        // Only initialize tags if not already set
        if (!this.tags || this.tags.length === 0) {
          this.tags = this.itemSelected.tags || [];
        }
      });
  }

  getSeries() {
    this.seriesService.getAllSeries()
      .subscribe(allSeries => {
        this.allSeries = allSeries;
      }, error => {
        this.alertService.showNoti('Failed to load series: ' + error, 'danger');
      });
  }

  getSeriesPosts() {
    if (this.itemSelected.series) {
      this.seriesService.getSeriesPosts(this.itemSelected.series)
        .subscribe(seriesPosts => {
          this.allSeriesPosts = seriesPosts ? [...seriesPosts] : [];
        });
    }
  }
  // When series changes, update the tags
  onSeriesChange(seriesId: string) {
    if (!seriesId) {
      return;
    }

    // Find the selected series
    const selectedSeries = this.allSeries.find(s => s._id === seriesId);
    if (selectedSeries && selectedSeries.baseTags && selectedSeries.baseTags.length > 0) {
      // Add only missing tags from the series base tags
      const newTags: Tag[] = [...this.tags]; // Start with current tags
      let tagsAdded = 0;

      // Iterate through the series base tags
      selectedSeries.baseTags.forEach(baseTag => {
        // Check if this tag already exists in the current tags
        const tagExists = this.tags.some(t =>
          (t._id && baseTag._id && t._id.toString() === baseTag._id.toString()) ||
          (t.name && baseTag.name && t.name.toString() === baseTag.name.toString())
        );

        // If it doesn't exist, add it
        if (!tagExists) {
          newTags.push(baseTag);
          tagsAdded++;
        }
      });

      // Update tags with the combined list
      this.tags = newTags;

      // Also update the itemSelected model so it will be sent to the server
      this.itemSelected.tags = [...this.tags];

      // get all series posts
      this.getSeriesPosts();

      // Notify the user about tags added
      if (tagsAdded > 0) {
        this.alertService.showNoti(`Added ${tagsAdded} tag(s) from the series "${selectedSeries.name}"`, 'success');
      }
    }
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
        this.alertService.showNoti('Create tag fail ' + error, 'danger');
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
        this.alertService.showNoti('Create category fail ' + error, 'danger');
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
    // Set the tags and categories from our component state to the itemSelected model
    // that will be sent to the server
    this.itemSelected.tags = this.tags ? [...this.tags] : [];
    this.itemSelected.category = this.categories ? [...this.categories] : [];

    // If there's a selected series, ensure it's properly set in the model
    if (this.itemSelected.series) {
      // If series is stored as an object ID string, convert it to the proper format
      // Many Angular Material selects return the value directly rather than the object
      const seriesId = typeof this.itemSelected.series === 'string'
        ? this.itemSelected.series
        : this.itemSelected.series._id;

      // Find the full series object if we only have the ID
      if (typeof this.itemSelected.series === 'string' && this.allSeries && this.allSeries.length > 0) {
        const selectedSeries = this.allSeries.find(s => s._id === seriesId);
        if (selectedSeries) {
          // Use the full series object if found
          this.itemSelected.series = selectedSeries;
        }
      }

    }

    console.log('Data to be saved:', {
      tags: this.itemSelected.tags,
      categories: this.itemSelected.category,
      series: this.itemSelected.series,
      previousPostId: this.itemSelected.previousPostId,
      nextPostId: this.itemSelected.nextPostId
    });
  }
}
