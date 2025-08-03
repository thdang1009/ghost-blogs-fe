import { Injectable } from '@angular/core';
import { ApiConfigService } from '@services/api-config/api-config.service';

@Injectable()
export abstract class BaseApiService {
  protected apiConfigService: ApiConfigService;

  constructor(apiConfigService: ApiConfigService) {
    this.apiConfigService = apiConfigService;
  }

  protected getApiUrl(endpoint: string = ''): string {
    return this.apiConfigService.getApiUrl(endpoint);
  }

  protected get baseApiUrl(): string {
    return this.apiConfigService.apiUrl;
  }

  protected isServerSide(): boolean {
    return this.apiConfigService.isServerSide();
  }

  protected isBrowserSide(): boolean {
    return this.apiConfigService.isBrowserSide();
  }
}