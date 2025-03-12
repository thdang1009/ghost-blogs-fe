import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AddCategoryComponent } from './add-category.component';
import { CategoryService, AlertService } from '@services/_index';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Category } from '@models/_index';

describe('AddCategoryComponent', () => {
  let component: AddCategoryComponent;
  let fixture: ComponentFixture<AddCategoryComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let alertService: jasmine.SpyObj<AlertService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategory', 'addCategory', 'updateCategory']);
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['error']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['queryParams']);

    // Set up the queryParams to return an observable
    activatedRouteSpy.queryParams = of({ id: '1' });

    await TestBed.configureTestingModule({
      declarations: [AddCategoryComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCategoryComponent);
    component = fixture.componentInstance;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
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

  it('should populate the form with data when editing a category', () => {
    const mockCategory = { name: 'Test Category', description: 'Test Description', imgUrl: 'http://example.com/image.jpg', content: 'Test Content' };
    categoryService.getCategory.and.returnValue(of(mockCategory));

    component.ngOnInit();

    expect(categoryService.getCategory).toHaveBeenCalledWith('1');
    expect(component.registerForm.value).toEqual(mockCategory);
    expect(component.isUpdate).toBeTrue();
  });

  it('should handle error when fetching category data', () => {
    const consoleSpy = spyOn(console, 'log');
    categoryService.getCategory.and.returnValue(throwError('Error fetching category'));

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching category');
  });

  it('should call addCategory on form submission when creating a new category', () => {
    const newCategory: Category = { name: 'New Category', description: 'New Description', imgUrl: 'http://example.com/image.jpg', content: 'New Content' };
    component.registerForm.setValue(newCategory);
    categoryService.addCategory.and.returnValue(of(newCategory));

    component.onFormSubmit(newCategory);

    expect(categoryService.addCategory).toHaveBeenCalledWith(newCategory);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/blog/category-list']);
  });

  it('should handle error when adding a new category', () => {
    const newCategory: Category = { name: 'New Category', description: 'New Description', imgUrl: 'http://example.com/image.jpg', content: 'New Content' };
    component.registerForm.setValue(newCategory);
    categoryService.addCategory.and.returnValue(throwError({ error: 'Create failed' }));

    component.onFormSubmit(newCategory);

    expect(categoryService.addCategory).toHaveBeenCalled();
  });

  it('should call updateCategory on form submission when updating an existing category', () => {
    const mockCategory: Category = { name: 'Updated Category', description: 'Updated Description', imgUrl: 'http://example.com/image.jpg', content: 'Updated Content' };
    component.isUpdate = true;
    component.id = '1';
    categoryService.updateCategory.and.returnValue(of(mockCategory));

    component.onFormSubmit(mockCategory);

    expect(categoryService.updateCategory).toHaveBeenCalledWith('1', mockCategory);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/blog/category-list']);
  });

  it('should handle error when updating a category', () => {
    const mockCategory: Category = { name: 'Updated Category', description: 'Updated Description', imgUrl: 'http://example.com/image.jpg', content: 'Updated Content' };
    component.isUpdate = true;
    component.id = '1';
    categoryService.updateCategory.and.returnValue(throwError({ error: 'Update failed' }));

    component.onFormSubmit(mockCategory);

    expect(categoryService.updateCategory).toHaveBeenCalled();
  });
});
