import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TodoLabel } from '@models/_index';
import { environment } from '@environments/environment';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/todo-label';

@Injectable({
  providedIn: 'root'
})
export class TodoLabelService {

  constructor(private http: HttpClient) { }
  mapTodoLabel = new Map<string, String[]>();

  getTodoLabels(name?: string): Observable<TodoLabel[]> {
    const url = `${apiUrl}` + (name ? `?name=${name}` : '');
    return this.http.get<TodoLabel[]>(url).pipe(
      tap(_ => ghostLog(`fetched todoLabel`)),
      catchError(handleError<TodoLabel[]>(`getTodoLabel`))
    );
  }

  getTodoLabel(id: any): Observable<TodoLabel> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<TodoLabel>(url).pipe(
      tap(_ => ghostLog(`fetched todoLabel by id=${id}`),),
      catchError(handleError<TodoLabel>(`getTodoLabel id=${id}`))
    );
  }

  createTodoLabelWithName(name: string): Observable<any> {
    const newItem: TodoLabel = {
      name: name,
      description: undefined,
      imgUrl: undefined,
      autoDetectKeywords: undefined
    }
    return this.addTodoLabel.call(this, newItem);
  }

  addTodoLabel(todoLabel: TodoLabel): Observable<TodoLabel> {
    ghostLog(todoLabel);
    return this.http.post<TodoLabel>(apiUrl, todoLabel).pipe(
      tap((prod: TodoLabel) => ghostLog(`added todoLabel id=${prod.id}`)),
      catchError(handleError<TodoLabel>('addTodoLabel'))
    );
  }

  updateTodoLabel(id: any, todoLabel: TodoLabel): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, todoLabel).pipe(
      tap(_ => ghostLog(`updated todoLabel id=${id}`)),
      catchError(handleError<any>('updateTodoLabel'))
    );
  }

  deleteTodoLabel(id: any): Observable<TodoLabel> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<TodoLabel>(url).pipe(
      tap(_ => ghostLog(`deleted todoLabel id=${id}`)),
      catchError(handleError<TodoLabel>('deleteTodoLabel'))
    );
  }

  extractTodoLabel(content: string, todoLabelList: TodoLabel[]): String[] {
    if (!this.mapTodoLabel || this.mapTodoLabel.size === 0) {
      this.mapTodoLabel = this.makeMapTodoLabel(todoLabelList);
    }
    const listTentativeIcon = new Set<String>();
    if (!content || content.length === 0) {
      return Array.from(listTentativeIcon);
    } else {
      const contentLower = content.toLowerCase();
      const matchedKeywords = new Set<string>();
      
      // First pass: Check for multi-word phrases (phrases with spaces)
      for (let [keyword, icons] of this.mapTodoLabel) {
        if (keyword.includes(' ') && contentLower.includes(keyword)) {
          icons?.forEach(el => listTentativeIcon.add(el));
          matchedKeywords.add(keyword);
        }
      }
      
      // Second pass: Check for single words (backward compatibility)
      const arrayContent = contentLower.split(/\s+/g);
      arrayContent.forEach(word => {
        if (this.mapTodoLabel.has(word) && !matchedKeywords.has(word)) {
          this.mapTodoLabel.get(word)?.forEach(el => listTentativeIcon.add(el));
          matchedKeywords.add(word);
        }
      })
    }
    return Array.from(listTentativeIcon);
  }

  makeMapTodoLabel(todoLabelList: TodoLabel[]) {
    if (!todoLabelList || todoLabelList.length === 0) {
      return this.mapTodoLabel;
    }
    todoLabelList.forEach(todoLabel => {
      const arrayKw = todoLabel.autoDetectKeywords?.split(';');
      arrayKw?.forEach(kw => {
        kw = kw.toLowerCase();
        if (this.mapTodoLabel.has(kw)) {
          this.mapTodoLabel.set(kw, [...(this.mapTodoLabel.get(kw) ?? []), todoLabel.imgAlternative ?? '']);
        } else {
          this.mapTodoLabel.set(kw, [todoLabel.imgAlternative ?? '']);
        }
      })
    });
    return this.mapTodoLabel;
  }
}
