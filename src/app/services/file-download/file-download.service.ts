import { HttpClient, HttpEvent, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class FileDownloadService {


  constructor(private http: HttpClient) { }


  /**
   * download file with report progress and save dialog.
   *
   * @param url
   * @param fileName
   *
   * @return Observable contains progress by percent
   *
   */
  downloadFile(url: string, fileName: string): Observable<number> {
    return new Observable(observer => {
      this.requestDownload(url).subscribe((event: HttpEvent<Blob>) => {
        if (event.type === HttpEventType.DownloadProgress) {
          const percentDone = Math.round(100 * (event.loaded ?? 0) / (event.total ?? 1));
          observer.next(percentDone);
        }
        if (event.type === HttpEventType.Response) {
          this.saveDownloadResult(event.body ?? new Blob(), fileName);
          observer.complete();
        }
      });
    }
    );
  }

  private saveDownloadResult(blob: Blob, fileName: string) {
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(
        blob,
        fileName
      );
    }
    else {
      const windowURL = window.URL || window['webkitURL'];
      const downloadLink = document.createElement('a');
      const urlBlob = windowURL.createObjectURL(new Blob([blob]));
      downloadLink.href = urlBlob;
      downloadLink.download = fileName;
      downloadLink.click();
      setTimeout(function () { URL.revokeObjectURL(downloadLink.href) }, 4E4);
    }
  }

  private requestDownload(url: string): Observable<HttpEvent<Blob>> {
    return this.http.get(url, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'events',
    })
  }
}
