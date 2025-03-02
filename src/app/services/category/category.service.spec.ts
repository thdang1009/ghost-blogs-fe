import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { Category } from '@models/_index';
import { environment } from '@environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/v1/category';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategorys', () => {
    it('should return all categories', () => {
      const mockCategories: Category[] = [
        { id: '1', name: 'Category 1' },
        { id: '2', name: 'Category 2' }
      ] as Category[];

      service.getCategorys().subscribe(categories => {
        expect(categories).toEqual(mockCategories);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });
  });

  describe('getCategory', () => {
    it('should return a single category by id', () => {
      const mockCategory = { id: '1', name: 'Category 1' } as Category;
      const categoryId = '1';

      service.getCategory(categoryId).subscribe(category => {
        expect(category).toEqual(mockCategory);
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });
  });

  describe('createCategoryWithName', () => {
    it('should create a new category with just a name', () => {
      const categoryName = 'New Category';
      const mockCategory = {
        name: categoryName,
        description: undefined,
        imgUrl: undefined,
        content: undefined
      } as Category;

      service.createCategoryWithName(categoryName).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCategory);
      req.flush(mockCategory);
    });
  });

  describe('addCategory', () => {
    it('should add a complete category', () => {
      const mockCategory: Category = {
        name: 'New Category',
        description: 'Description',
        imgUrl: 'image.jpg',
        content: 'Content'
      } as Category;

      service.addCategory(mockCategory).subscribe(category => {
        expect(category).toEqual(mockCategory);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCategory);
      req.flush(mockCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', () => {
      const mockCategory: Category = {
        id: '1',
        name: 'Updated Category'
      } as Category;

      service.updateCategory('1', mockCategory).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockCategory);
      req.flush({});
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', () => {
      const categoryId = '1';

      service.deleteCategory(categoryId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('error handling', () => {
    it('should handle error when getting categories', () => {
      service.getCategorys().subscribe(
        categories => {
          expect(categories).toEqual([]);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle error when getting single category', () => {
      service.getCategory('1').subscribe(
        category => {
          expect(category).toBeUndefined();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
