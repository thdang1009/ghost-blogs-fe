import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Series, Tag, MyFile } from '@models/_index';
import { SeriesService, AlertService, FileService, TagService } from '@services/_index';

@Component({
  selector: 'app-series-add',
  templateUrl: './series-add.component.html',
  styleUrls: ['./series-add.component.scss']
})
export class SeriesAddComponent implements OnInit {
  seriesForm!: UntypedFormGroup;
  isUpdate = false;
  loading = false;
  id: string | undefined;
  allTags: Tag[] = [];
  listFileOnServer: MyFile[] = [];
  selectedSeries?: Series;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private seriesService: SeriesService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private fileService: FileService,
    private tagService: TagService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadTags();
    this.loadFiles();

    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loading = true;
        this.seriesService.getSeries(id)
          .subscribe(
            (res: Series) => {
              this.selectedSeries = res;
              this.initFormWithData(res);
              this.isUpdate = true;
              this.id = id;
              this.loading = false;
            },
            (error: any) => {
              this.alertService.showNoti('Failed to load series: ' + error, 'danger');
              this.loading = false;
            }
          );
      }
    });
  }

  initializeForm() {
    this.seriesForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null],
      imageUrl: [null, Validators.required],
      baseTags: [[]],
      active: [true]
    });
  }

  initFormWithData(data: Series) {
    console.log('Series data for form:', data);

    // Ensure baseTags is an array of tag objects
    const baseTags = Array.isArray(data.baseTags) ? data.baseTags : [];

    this.seriesForm.patchValue({
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      baseTags: baseTags,
      active: data.active !== false
    });

    console.log('Form data after patch:', this.seriesForm.value);
  }

  loadTags() {
    this.tagService.getTags().subscribe(
      (tags) => {
        console.log('Loaded tags:', tags);
        this.allTags = tags;

        // If we're in update mode and have a selected series, re-apply the form data
        // This ensures tags are correctly selected after they're loaded
        if (this.isUpdate && this.selectedSeries) {
          this.initFormWithData(this.selectedSeries);
        }
      },
      (error: any) => {
        this.alertService.showNoti('Failed to load tags: ' + error, 'danger');
      }
    );
  }

  loadFiles() {
    this.fileService.getAllFile().subscribe(
      (files: MyFile[]) => {
        this.listFileOnServer = files;
      },
      (error: any) => {
        this.alertService.showNoti('Failed to load files: ' + error, 'danger');
      }
    );
  }

  compareTagFn(c1: any, c2: any): boolean {
    if (!c1 || !c2) return false;

    // Convert both to string for comparison to handle both String and string types
    const id1 = c1._id ? c1._id.toString() : null;
    const id2 = c2._id ? c2._id.toString() : null;

    return id1 === id2;
  }

  onSubmit() {
    if (this.seriesForm.invalid) {
      return;
    }

    const formData = this.seriesForm.value;
    const seriesData: Series = {
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl,
      baseTags: formData.baseTags,
      active: formData.active
    };

    this.loading = true;

    if (this.isUpdate && this.id) {
      this.updateSeries(this.id, seriesData);
    } else {
      this.createSeries(seriesData);
    }
  }

  createSeries(seriesData: Series) {
    this.seriesService.createSeries(seriesData).subscribe(
      (res: any) => {
        this.alertService.showNoti('Series created successfully', 'success');
        this.router.navigate(['/admin/blog/series-list']);
        this.loading = false;
      },
      (error: any) => {
        this.alertService.showNoti('Failed to create series: ' + error, 'danger');
        this.loading = false;
      }
    );
  }

  updateSeries(id: string, seriesData: Series) {
    const numericId = parseInt(id, 10);
    this.seriesService.updateSeries(numericId, seriesData).subscribe(
      (res: any) => {
        this.alertService.showNoti('Series updated successfully', 'success');
        this.router.navigate(['/admin/blog/series-list']);
        this.loading = false;
      },
      (error: any) => {
        this.alertService.showNoti('Failed to update series: ' + error, 'danger');
        this.loading = false;
      }
    );
  }

  cancel() {
    this.router.navigate(['/admin/blog/series-list']);
  }
}
