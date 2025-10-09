import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryListComponent } from './category-list.component';
import { CategoryService } from '@services/_index';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Category } from '@models/_index';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', [
      'getCategorys',
      'deleteCategory',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [CategoryListComponent],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignore unknown elements
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    categoryService = TestBed.inject(
      CategoryService
    ) as jasmine.SpyObj<CategoryService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve categories on initialization', () => {
    const mockCategories: Category[] = [
      { _id: '1', name: 'Category 1' },
      { _id: '2', name: 'Category 2' },
    ];
    categoryService.getCategorys.and.returnValue(of(mockCategories));

    component.ngOnInit();

    expect(categoryService.getCategorys).toHaveBeenCalled();
    expect(component.categories).toEqual(mockCategories);
  });

  it('should handle error when retrieving categories', () => {
    const consoleSpy = spyOn(console, 'log');
    categoryService.getCategorys.and.returnValue(
      throwError('Error fetching categories')
    );

    component.getCategories();

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching categories');
  });

  it('should delete a category and refresh the list', () => {
    const mockCategory: Category = { _id: '1', name: 'Category 1' };
    categoryService.deleteCategory.and.returnValue(
      of({ success: true } as any)
    );
    spyOn(component, 'getCategories').and.callThrough();

    component.delete(mockCategory);

    expect(categoryService.deleteCategory).toHaveBeenCalledWith(
      mockCategory._id
    );
    expect(component.getCategories).toHaveBeenCalled();
  });

  it('should not delete a category if category is null', () => {
    component.delete(null as any);
    expect(categoryService.deleteCategory).not.toHaveBeenCalled();
  });

  it('should navigate to edit category', () => {
    const mockCategory: Category = { _id: '1', name: 'Category 1' };
    component.edit(mockCategory);

    expect(router.navigate).toHaveBeenCalledWith(['admin/blog/category'], {
      queryParams: { id: mockCategory._id },
    });
  });

  it('should not navigate if category is null', () => {
    component.edit(null as any);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
