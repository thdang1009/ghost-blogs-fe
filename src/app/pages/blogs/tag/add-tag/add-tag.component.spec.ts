import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AddTagComponent } from './add-tag.component';
import { TagService, AlertService } from '@services/_index';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Tag } from '@models/_index';
import { showNoti } from '@shared/common';

describe('AddTagComponent', () => {
  let component: AddTagComponent;
  let fixture: ComponentFixture<AddTagComponent>;
  let tagService: jasmine.SpyObj<TagService>;
  let alertService: jasmine.SpyObj<AlertService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const tagServiceSpy = jasmine.createSpyObj('TagService', ['getTag', 'addTag', 'updateTag']);
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['error']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['queryParams']);

    await TestBed.configureTestingModule({
      declarations: [AddTagComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: TagService, useValue: tagServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTagComponent);
    component = fixture.componentInstance;
    tagService = TestBed.inject(TagService) as jasmine.SpyObj<TagService>;
    alertService = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.registerForm.value).toEqual({
      name: null,
      description: null,
      imgUrl: null,
      content: null,
    });
  });

  it('should populate the form with data when editing a tag', () => {
    const mockTag = { _id: '1', name: 'Test Tag', description: 'Test Description', imgUrl: 'http://example.com/image.jpg', content: 'Test Content' };
    activatedRoute.queryParams = of({ id: '1' });
    tagService.getTag.and.returnValue(of(mockTag));

    component.ngOnInit();

    expect(tagService.getTag).toHaveBeenCalledWith('1');
    expect(component.registerForm.value).toEqual(mockTag);
    expect(component.isUpdate).toBeTrue();
    expect(component.id).toBe('1');
  });

  it('should handle error when fetching tag data', () => {
    const consoleSpy = spyOn(console, 'log');
    activatedRoute.queryParams = of({ id: '1' });
    tagService.getTag.and.returnValue(throwError('Error fetching tag'));

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching tag');
  });

  it('should call addTag on form submission when creating a new tag', () => {
    const newTag: Tag = { name: 'New Tag', description: 'New Description', imgUrl: 'http://example.com/image.jpg', content: 'New Content' };
    component.registerForm.setValue(newTag);
    tagService.addTag.and.returnValue(of(newTag));

    component.onFormSubmit(newTag);

    expect(tagService.addTag).toHaveBeenCalledWith(newTag);
    expect(showNoti).toHaveBeenCalledWith('Success', 'success');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/blog/tag-list']);
  });

  it('should handle error when adding a new tag', () => {
    const newTag: Tag = { name: 'New Tag', description: 'New Description', imgUrl: 'http://example.com/image.jpg', content: 'New Content' };
    component.registerForm.setValue(newTag);
    tagService.addTag.and.returnValue(throwError({ error: 'Create failed' }));

    component.onFormSubmit(newTag);

    expect(tagService.addTag).toHaveBeenCalled();
  });

  it('should call updateTag on form submission when updating an existing tag', () => {
    const mockTag: Tag = { _id: '1', name: 'Updated Tag', description: 'Updated Description', imgUrl: 'http://example.com/image.jpg', content: 'Updated Content' };
    component.isUpdate = true;
    component.id = '1';
    tagService.updateTag.and.returnValue(of(mockTag));

    component.onFormSubmit(mockTag);

    expect(tagService.updateTag).toHaveBeenCalledWith('1', mockTag);
    expect(showNoti).toHaveBeenCalledWith('Update success', 'success');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/blog/tag-list']);
  });

  it('should handle error when updating a tag', () => {
    const mockTag: Tag = { _id: '1', name: 'Updated Tag', description: 'Updated Description', imgUrl: 'http://example.com/image.jpg', content: 'Updated Content' };
    component.isUpdate = true;
    component.id = '1';
    tagService.updateTag.and.returnValue(throwError({ error: 'Update failed' }));

    component.onFormSubmit(mockTag);

    expect(tagService.updateTag).toHaveBeenCalled();
  });
});
