import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Category } from '@models/_index';
import { ghostLog, handleError } from '@shared/common';
import { ApiConfigService } from '@services/api-config/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private get apiUrl(): string {
    return this.apiConfigService.getApiUrl('/v1/category');
  }

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) { }

  getCategorys(): Observable<Category[]> {
    const url = `${this.apiUrl}`;
    return this.http.get<Category[]>(url).pipe(
      tap(_ => ghostLog(`fetched category`)),
      catchError(handleError<Category[]>(`getCategory`, []))
    );
  }

  getCategory(id: any): Observable<Category> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Category>(url).pipe(
      tap(_ => ghostLog(`fetched category by id=${id}`)),
      catchError(handleError<Category>(`getCategory id=${id}`))
    );
  }

  createCategoryWithName(name: string) {
    const newItem: Category = {
      name: name,
      description: undefined,
      imgUrl: undefined,
      content: undefined
    }
    return this.addCategory(newItem);
  }


  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category).pipe(
      tap((prod: Category) => ghostLog(`added category id=${category.id}`)),
      catchError(handleError<Category>('addCategory'))
    );
  }

  updateCategory(id: any, category: Category): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, category).pipe(
      tap(_ => ghostLog(`updated category id=${id}`)),
      catchError(handleError<any>('updateCategory'))
    );
  }

  deleteCategory(id: any): Observable<Category> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Category>(url).pipe(
      tap(_ => ghostLog(`deleted category id=${id}`)),
      catchError(handleError<Category>('deleteCategory'))
    );
  }
}
