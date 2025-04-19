import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { StorageService } from '../storage/storage.service';
import { environment } from '@environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check if user is logged in', () => {
    storageService.getItem.and.returnValue('{"user": "test"}');
    expect(service.isLogin()).toBeTrue();

    storageService.getItem.and.returnValue(null);
    expect(service.isLogin()).toBeFalse();
  });

  // it('should login user', () => {
  //   const mockCredentials = { username: 'test', password: 'test123' };
  //   const mockResponse = { token: 'test-token', user: { id: 1, name: 'Test User' } };

  //   service.login(mockCredentials).subscribe(response => {
  //     expect(response).toEqual(mockResponse);
  //   });

  //   const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
  //   expect(req.request.method).toBe('POST');
  //   expect(req.request.body).toEqual(mockCredentials);
  //   req.flush(mockResponse);
  // });
});
