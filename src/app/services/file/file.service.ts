import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { MyFile } from '@models/_index';
import { buildQueryString, ghostLog, handleError } from '@shared/common';
const apiUrl = environment.apiUrl + '/v1/file';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  getRawFile(urlGet: string): Observable<File> {
    const url = `${apiUrl}/id/${urlGet}`;
    return this.http.get<File>(url).pipe(
      tap(_ => ghostLog(`fetched raw file by link`)),
      catchError(handleError<File>(`getRawFile`))
    );
  }

  getFile(id: string): Observable<MyFile[]> {
    const url = `${apiUrl}/id/${id}`;
    return this.http.get<MyFile[]>(url).pipe(
      tap(_ => ghostLog(`fetched my file`)),
      catchError(handleError<MyFile[]>(`getMyFile`))
    );
  }

  getAllFile(req = {}): Observable<MyFile[]> {
    const queryString = buildQueryString(req);
    const url = `${apiUrl}?${queryString}`;
    return this.http.get<MyFile[]>(url).pipe(
      tap(_ => ghostLog(`fetched my file`)),
      catchError(handleError<MyFile[]>(`getMyFile`))
    );
  }

  getMyFile(req = {}): Observable<MyFile[]> {
    const queryString = buildQueryString(req);
    const url = `${apiUrl}/my-file?${queryString}`;
    return this.http.get<MyFile[]>(url).pipe(
      tap(_ => ghostLog(`fetched my file`)),
      catchError(handleError<MyFile[]>(`getMyFile`))
    );
  }

  addFile(item: MyFile): Observable<MyFile> {
    return this.http.post<MyFile>(apiUrl, item).pipe(
      tap((prod: MyFile) => ghostLog(`added file`)),
      catchError(handleError<MyFile>('addFile'))
    );
  }

  updateFile(id: string, item: MyFile): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.put(url, item).pipe(
      tap(_ => ghostLog(`updated item id=${id}`)),
      catchError(handleError<any>('updateFile'))
    );
  }

  deleteFile(id: any): Observable<MyFile> {
    const url = `${apiUrl}/${id}`;
    return this.http.delete<MyFile>(url).pipe(
      tap(_ => ghostLog(`deleted item id=${id}`)),
      catchError(handleError<MyFile>('deleteFile'))
    );
  }

  uploadFile(formData: FormData): Observable<MyFile> {
    return this.http.post<MyFile>(apiUrl + '/upload', formData).pipe(
      tap((prod: MyFile) => ghostLog(`upload file`)),
      catchError(handleError<MyFile>('upload file'))
    );
  }

  createObservableUploadFile(formData: FormData, callbackReset = () => { }): Observable<HttpEvent<Object>> {
    const upload$ = this.http.post(apiUrl + '/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      finalize(callbackReset)
    );
    return upload$;
  }
}
