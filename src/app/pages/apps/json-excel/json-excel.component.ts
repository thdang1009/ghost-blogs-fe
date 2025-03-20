import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ExampleJSON2 } from '@helpers/fake.data';
import { showNoti } from '@shared/common';
import { SAVED_JSON_EXCEL, SAVED_JSON_EXCEL_2 } from '@shared/constant';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { NgxFileDropEntry } from 'ngx-file-drop';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-json-excel',
  templateUrl: './json-excel.component.html',
  styleUrls: ['./json-excel.component.scss']
})
export class JsonExcelComponent implements OnInit, OnDestroy {

  public editorOptions!: JsonEditorOptions;
  public editorOptions2!: JsonEditorOptions;
  public initialData: any;
  public initialData2: any;
  public visibleData: any;
  public visibleData2: any;

  @ViewChild(JsonEditorComponent, { static: false }) editor!: JsonEditorComponent;
  @ViewChild(JsonEditorComponent, { static: false }) editor2!: JsonEditorComponent;

  mod = 'jsonToExcel';

  isLoadingResults = false;

  // drag and drop zone

  public files: NgxFileDropEntry[] = [];
  private file!: Blob;

  StringToReadableObject(s: string) {
    return JSON.parse(s);
  }

  ngOnInit(): void {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text', 'tree', 'view'];
    this.editorOptions.mode = this.editorOptions.modes[0];
    this.editorOptions2 = new JsonEditorOptions()
    this.editorOptions2.modes = ['code', 'text', 'tree', 'view'];
    this.editorOptions2.mode = this.editorOptions2.modes[0];
    const sampleJSON = ExampleJSON2;
    this.initialData = this.StringToReadableObject(localStorage.getItem(SAVED_JSON_EXCEL) || sampleJSON);
    this.initialData2 = this.StringToReadableObject(localStorage.getItem(SAVED_JSON_EXCEL_2) || sampleJSON);
    this.visibleData = JSON.parse(JSON.stringify(this.initialData));
    this.visibleData2 = JSON.parse(JSON.stringify(this.initialData2));
    window.onbeforeunload = () => this.ngOnDestroy();
  }

  showJson(d: Event) {
    if (d.isTrusted) {
      return;
    }
    this.visibleData = d;
  }

  showJson2(d: Event) {
    if (d.isTrusted) {
      return;
    }
    this.visibleData2 = d;
  }

  ngOnDestroy(): void {
    try {
      localStorage.setItem(SAVED_JSON_EXCEL, JSON.stringify(this.visibleData));
      localStorage.setItem(SAVED_JSON_EXCEL_2, JSON.stringify(this.visibleData2));
    } catch (e) {
      showNoti('Lỗi lưu local: ' + e, 'danger');
    }
  }

  execute(mod: string) {
    if (mod === 'excelToJSON') {
      this.exportJSON();
    } else {
      this.exportExcel();
    }
  }
  formatJSONArray(jsonObject: any) {
    const result = jsonObject;
    if (!Array.isArray(result)) {
      throw new Error(('Để cái mảng vô pa ơi'));
    }

    return result.map(item => {
      for (const prop in item) {
        if (item.hasOwnProperty(prop)) {
          if (Array.isArray(item[prop] || typeof item[prop] === 'object')) {
            item[prop] = JSON.stringify(item[prop]);
          }
        }
      }
      return item;
    });
  }
  exportExcel(): void {
    let json: any;
    let formatedJSON: any;
    try {
      this.initialData = this.visibleData;
      json = this.visibleData;
      formatedJSON = this.formatJSONArray(json);
    } catch (e) {
      showNoti('Error JSON: ' + e, 'danger');
    }
    try {
      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      /* json to sheet */
      const ws = XLSX.utils.json_to_sheet(formatedJSON);
      /* book add sheet */
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      /* save to file */
      XLSX.writeFile(wb, `Excel_${new Date}.xlsx`);
    } catch (e) {
      showNoti('Error: ' + e, 'danger');
      showNoti('Only Support Array', 'info');
    }
  }

  exportJSON() {
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      /* save data */
      const data = (XLSX.utils.sheet_to_json(ws, {

      }));
      this.visibleData2 = data;
      this.initialData2 = data;
    }
    reader.readAsBinaryString(this.file);
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as any;
        fileEntry.file((file: File) => {
          this.file = file;
          // Here you can access the real file
          // console.log(droppedFile.relativePath, file);
          console.log(typeof file, file);


          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as any;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public fileOver(event: any) {
    console.log(event);
  }

  public fileLeave(event: any) {
    console.log(event);
  }
  // drag and drop zone end
}
