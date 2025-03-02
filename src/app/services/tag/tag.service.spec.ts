import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TagService } from './tag.service';
import { Tag } from '@models/_index';
import { environment } from '@environments/environment';

describe('TagService', () => {
  let service: TagService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/v1/tag';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TagService]
    });
    service = TestBed.inject(TagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTags', () => {
    it('should return all tags when no name provided', () => {
      const mockTags: Tag[] = [
        { id: '1', name: 'Tag 1' },
        { id: '2', name: 'Tag 2' }
      ] as Tag[];

      service.getTags().subscribe(tags => {
        expect(tags).toEqual(mockTags);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTags);
    });

    it('should filter tags by name when provided', () => {
      const mockTags: Tag[] = [
        { id: '1', name: 'Tag 1' }
      ] as Tag[];
      const searchName = 'Tag 1';

      service.getTags(searchName).subscribe(tags => {
        expect(tags).toEqual(mockTags);
      });

      const req = httpMock.expectOne(`${apiUrl}?name=${searchName}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTags);
    });
  });

  describe('getTag', () => {
    it('should return a single tag by id', () => {
      const mockTag = { id: '1', name: 'Tag 1' } as Tag;
      const tagId = '1';

      service.getTag(tagId).subscribe(tag => {
        expect(tag).toEqual(mockTag);
      });

      const req = httpMock.expectOne(`${apiUrl}/${tagId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTag);
    });
  });

  describe('createTagWithName', () => {
    it('should create a new tag with just a name', () => {
      const tagName = 'New Tag';
      const mockTag = {
        name: tagName,
        description: undefined,
        imgUrl: undefined,
        content: undefined
      } as Tag;

      service.createTagWithName(tagName).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockTag);
      req.flush(mockTag);
    });
  });

  describe('addTag', () => {
    it('should add a complete tag', () => {
      const mockTag: Tag = {
        name: 'New Tag',
        description: 'Description',
        imgUrl: 'image.jpg',
        content: 'Content'
      } as Tag;

      service.addTag(mockTag).subscribe(tag => {
        expect(tag).toEqual(mockTag);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockTag);
      req.flush(mockTag);
    });
  });

  describe('updateTag', () => {
    it('should update an existing tag', () => {
      const mockTag: Tag = {
        id: '1',
        name: 'Updated Tag'
      } as Tag;

      service.updateTag('1', mockTag).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockTag);
      req.flush({});
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag', () => {
      const tagId = '1';

      service.deleteTag(tagId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${tagId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('error handling', () => {
    it('should handle error when getting tags', () => {
      service.getTags().subscribe(
        tags => {
          expect(tags).toEqual([]);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle error when getting single tag', () => {
      service.getTag('1').subscribe(
        tag => {
          expect(tag).toBeUndefined();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
