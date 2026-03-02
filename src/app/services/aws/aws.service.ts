import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/common';
import { ApiConfigService } from '@services/api-config/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class AWSService {
  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {}

  private get apiUrl(): string {
    return this.apiConfigService.getApiUrl('/v1/aws');
  }

  getAWSStoragedSpace(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/space-left`)
      .pipe(catchError(handleError<any>('getAWSStoragedSpace')));
  }
}
