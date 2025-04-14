import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get configuration values by keys
   * @param keys Array of configuration keys to retrieve
   * @returns Observable with the configuration values
   */
  getConfig(keys: string[]): Observable<any> {
    const queryParams = keys.map(key => `keys=${key}`).join('&');
    return this.http.get(`${this.apiUrl}/v1/config?${queryParams}`);
  }

  /**
   * Save configuration values
   * @param config Configuration object with key-value pairs
   * @returns Observable with the response
   */
  saveConfig(config: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/v1/config`, config);
  }
}
