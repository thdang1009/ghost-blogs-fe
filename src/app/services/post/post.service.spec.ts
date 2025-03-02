import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Post } from '@models/_index';
import { environment } from '@environments/environment';
import { PostService } from '@services/_index';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/v1/post';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostService]
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPublicPosts', () => {
    it('should return public posts', () => {
      const mockPosts: Post[] = [
        { id: 1, title: 'Post 1', content: 'Content 1' },
        { id: 2, title: 'Post 2', content: 'Content 2' }
      ] as Post[];

      service.getPublicPosts({}).subscribe(posts => {
        expect(posts).toEqual(mockPosts);
      });

      const req = httpMock.expectOne(`${apiUrl}/public`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts);
    });

    it('should handle query parameters', () => {
      const mockPosts: Post[] = [] as Post[];
      const queryParams = { page: 1, limit: 10 };

      service.getPublicPosts(queryParams).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/public?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts);
    });
  });

  describe('getPost', () => {
    it('should return a single post by ref', () => {
      const mockPost = { id: 1, title: 'Post 1', content: 'Content 1' } as Post;
      const ref = 'post-1';

      service.getPost(ref).subscribe(post => {
        expect(post).toEqual(mockPost);
      });

      const req = httpMock.expectOne(`${apiUrl}/ref/${ref}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
    });
  });

  describe('getPostAsAdmin', () => {
    it('should return a post for admin', () => {
      const mockPost = { id: 1, title: 'Post 1', content: 'Content 1' } as Post;
      const id = 1;

      service.getPostAsAdmin(id).subscribe(post => {
        expect(post).toEqual(mockPost);
      });

      const req = httpMock.expectOne(`${apiUrl}/get-as-member/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
    });
  });

  describe('clapPost', () => {
    it('should clap a post', () => {
      const mockPost = { id: 1, title: 'Post 1', clapCount: 1 } as Post;
      const claps = 1;

      service.clapPost(mockPost, claps).subscribe(post => {
        expect(post).toEqual(mockPost);
      });

      const req = httpMock.expectOne(`${apiUrl}/clap-post/${mockPost.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ numIncrease: claps });
      req.flush(mockPost);
    });
  });

  describe('CRUD operations', () => {
    it('should add a post', () => {
      const mockPost = { title: 'New Post', content: 'Content' } as Post;

      service.addPost(mockPost).subscribe(post => {
        expect(post).toEqual(mockPost);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(mockPost);
    });

    it('should update a post', () => {
      const mockPost = { id: 1, title: 'Updated Post' } as Post;

      service.updatePost(1, mockPost).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should delete a post', () => {
      const id = 1;

      service.deletePost(id).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
