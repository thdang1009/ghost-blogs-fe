import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MyFile } from '@models/_index';
import { FileService, ConfigService, AlertService } from '@services/_index';

@Component({
  selector: 'app-coupon-settings',
  template: `
    <div class="main-content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-12">
            <div class="card">
              <div class="card-header card-header-info">
                <h4 class="card-title">Default Coupon Image Configuration</h4>
                <p class="card-category">Configure the default image used for coupons</p>
              </div>
              <div class="card-body">
                <form [formGroup]="configForm" (ngSubmit)="saveConfig()">
                  <div class="row">
                    <div class="col-md-6">
                      <mat-form-field class="full-width">
                        <mat-label>Select Default Coupon Image</mat-label>
                        <mat-select formControlName="defaultCouponImage">
                          <mat-option *ngFor="let file of imageFiles" [value]="file">
                            {{ file.originName }}
                          </mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                    <div class="col-md-6" *ngIf="selectedImagePreview">
                      <div class="preview-container">
                        <img [src]="selectedImagePreview" alt="Selected default coupon image" class="img-fluid">
                      </div>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-info">Save Default Image</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      max-width: 300px;
      margin: 0 auto;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class CouponSettingsComponent implements OnInit {
  configForm: UntypedFormGroup;
  imageFiles: MyFile[] = [];
  selectedImagePreview: string | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private fileService: FileService,
    private configService: ConfigService,
    private alertService: AlertService
  ) {
    this.configForm = this.formBuilder.group({
      defaultCouponImage: ['']
    });
  }

  ngOnInit(): void {
    this.loadImages();

    // Update preview when selection changes
    this.configForm.get('defaultCouponImage')?.valueChanges.subscribe(file => {
      console.log('dangth file', file);
      if (file) {
        this.selectedImagePreview = file.urlGet;
      } else {
        this.selectedImagePreview = null;
      }
    });
  }

  loadImages(): void {
    this.fileService.getMyFile({
      type: 'Image'
    }).subscribe(
      (files: MyFile[]) => {
        this.imageFiles = files;
        this.loadCurrentConfig();
      },
      error => {
        this.alertService.showNoti('Failed to load images: ' + error, 'danger');
      }
    );
  }

  loadCurrentConfig(): void {
    this.configService.getConfig(['defaultCouponImage']).subscribe(
      configs => {
        const config = configs[0];
        if (config && config.defaultCouponImage) {
          const foundFile = this.imageFiles.find(file => file.urlGet === config.defaultCouponImage);
          this.configForm.patchValue({
            defaultCouponImage: foundFile
          });
        }
      },
      error => {
        this.alertService.showNoti('Failed to load current configuration: ' + error, 'danger');
      }
    );
  }

  saveConfig(): void {
    const config = {
      defaultCouponImage: this.configForm.value.defaultCouponImage.urlGet
    };

    this.configService.saveConfig(config).subscribe(
      () => {
        this.alertService.showNoti('Default coupon image configuration saved successfully', 'success');
      },
      error => {
        this.alertService.showNoti('Failed to save configuration: ' + error, 'danger');
      }
    );
  }
}
