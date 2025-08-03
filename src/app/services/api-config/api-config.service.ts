import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private _apiUrl: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this._apiUrl = this.determineApiUrl();
  }

  get apiUrl(): string {
    return this._apiUrl;
  }

  private determineApiUrl(): string {
    if (isPlatformServer(this.platformId)) {
      // Phase 1: Server-side rendering - use localhost for fastest data access
      return 'http://localhost:3000';
    } else if (isPlatformBrowser(this.platformId)) {
      // Phase 2: Client-side - use the correct domain API
      return environment.production ? 'https://dangtrinh.site/api' : environment.apiUrl;
    }
    
    // Fallback
    return environment.apiUrl;
  }

  // Method to get full API URL for specific endpoints
  getApiUrl(endpoint: string = ''): string {
    const baseUrl = this.apiUrl;
    return endpoint ? `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}` : baseUrl;
  }

  // Method to check if we're in SSR mode
  isServerSide(): boolean {
    return isPlatformServer(this.platformId);
  }

  // Method to check if we're in browser mode
  isBrowserSide(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}