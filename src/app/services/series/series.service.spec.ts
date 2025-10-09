import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { SeriesService } from './series.service';
import { Series } from '@models/series';
import { Post } from '@models/post';
import { environment } from '@environments/environment';

describe('SeriesService', () => {
  let service: SeriesService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/v1/series';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SeriesService],
    });
    service = TestBed.inject(SeriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Public Series Operations', () => {
    it('should get public series', () => {
      const mockSeries: Series[] = [
        { id: 1, name: 'Series 1', slug: 'series-1' } as Series,
        { id: 2, name: 'Series 2', slug: 'series-2' } as Series,
      ];

      service.getPublicSeries().subscribe(series => {
        expect(series).toEqual(mockSeries);
        expect(series.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/public`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSeries);
    });

    it('should get posts by series slug', () => {
      const slug = 'angular-series';
      const mockResponse = {
        series: { id: 1, name: 'Angular Series', slug },
        posts: [
          { id: 1, title: 'Post 1' },
          { id: 2, title: 'Post 2' },
        ],
      };

      service.getPostsBySeries(slug).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.posts.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/public/${slug}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get series posts by ID', () => {
      const seriesId = '123';
      const mockPosts: Post[] = [
        { id: 1, title: 'Post 1' } as Post,
        { id: 2, title: 'Post 2' } as Post,
      ];

      service.getSeriesPosts(seriesId).subscribe(posts => {
        expect(posts).toEqual(mockPosts);
        expect(posts.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/${seriesId}/posts`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts);
    });
  });

  describe('Admin Series Operations', () => {
    it('should get all series (admin)', () => {
      const mockSeries: Series[] = [
        { id: 1, name: 'Series 1' } as Series,
        { id: 2, name: 'Series 2' } as Series,
      ];

      service.getAllSeries().subscribe(series => {
        expect(series).toEqual(mockSeries);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockSeries);
    });

    it('should get a single series by ID (admin)', () => {
      const seriesId = 1;
      const mockSeries: Series = {
        id: seriesId,
        name: 'Test Series',
        slug: 'test-series',
      } as Series;

      service.getSeries(seriesId).subscribe(series => {
        expect(series).toEqual(mockSeries);
        expect(series.id).toBe(seriesId);
      });

      const req = httpMock.expectOne(`${apiUrl}/${seriesId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSeries);
    });

    it('should create a new series', () => {
      const newSeries: Series = {
        name: 'New Series',
        slug: 'new-series',
        description: 'A new series',
      } as Series;

      const createdSeries: Series = {
        ...newSeries,
        id: 123,
      } as Series;

      service.createSeries(newSeries).subscribe(series => {
        expect(series).toEqual(createdSeries);
        expect(series.id).toBe(123);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSeries);
      req.flush(createdSeries);
    });

    it('should update a series', () => {
      const seriesId = 1;
      const updatedSeries: Series = {
        id: seriesId,
        name: 'Updated Series',
      } as Series;

      service.updateSeries(seriesId, updatedSeries).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${seriesId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedSeries);
      req.flush({ success: true });
    });

    it('should delete a series', () => {
      const seriesId = 1;

      service.deleteSeries(seriesId).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/${seriesId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('Error Handling', () => {
    it('should handle error when getting public series', () => {
      service.getPublicSeries().subscribe(series => {
        expect(series).toEqual([]);
      });

      const req = httpMock.expectOne(`${apiUrl}/public`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle error when getting posts by series', () => {
      service.getPostsBySeries('invalid-slug').subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/public/invalid-slug`);
      req.error(new ErrorEvent('Not found'));
    });

    it('should handle error when getting series posts', () => {
      service.getSeriesPosts('999').subscribe(posts => {
        expect(posts).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/999/posts`);
      req.error(new ErrorEvent('Not found'));
    });
  });
});
