import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Tag } from '@models/_index';
import { TagService, AlertService } from '@services/_index';


@Component({
  selector: 'app-add-tag',
  templateUrl: './add-tag.component.html',
  styleUrls: ['./add-tag.component.scss']
})
export class AddTagComponent implements OnInit {


  registerForm!: UntypedFormGroup;
  name = '';
  description = '';
  imgUrl = '';
  content = '';
  isLoadingResults = false;
  isUpdate = false;
  id: string | undefined;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private tagService: TagService,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      imgUrl: [null, Validators.required],
      content: [null, Validators.required],
    });
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isLoadingResults = true;
        this.tagService.getTag(id)
          .subscribe(res => {
            this.initFormWithData(res);
            this.isUpdate = true;
            this.id = id;
            this.isLoadingResults = false;
          }, error => {
            this.isLoadingResults = false;
            this.alertService.showNoti('Failed to load tag', 'danger');
          });
      }
    });
  }

  initFormWithData(data = {} as any) {
    this.registerForm.patchValue(data);
  }

  onFormSubmit(data: any) {
    const newTag: Tag = {
      name: data.name,
      description: data.description,
      imgUrl: data.imgUrl,
      content: data.content
    }
    this.isLoadingResults = true;
    this.isUpdate ? this.callUpdate(this.id!, newTag) : this.callCreate(newTag)
  }
  callUpdate(id: string, newValue: Tag) {

    this.tagService.updateTag(id, newValue)
      .subscribe(tag => {
        if (tag) {
          this.alertService.showNoti(`Update success`, 'success');
          this.router.navigate(['/admin/blog/tag-list']);
        }
        this.isLoadingResults = false;
      }, (err) => {
        console.log(err);
        this.alertService.error(err.error);
        this.isLoadingResults = false;
      });
  }
  callCreate(newValue: Tag) {

    this.tagService.addTag(newValue)
      .subscribe(tag => {
        if (tag) {
          this.alertService.showNoti(`Success`, 'success');
          this.router.navigate(['/admin/blog/tag-list']);
        }
        this.isLoadingResults = false;
      }, (err) => {
        console.log(err);
        this.alertService.error(err.error);
        this.isLoadingResults = false;
      });
  }

  cancel() {
    this.router.navigate(['/admin/blog/tag-list']);
  }
}
