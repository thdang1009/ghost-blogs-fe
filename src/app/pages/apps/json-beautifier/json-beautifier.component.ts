import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ExampleJSON } from '@helpers/fake.data';
import { showNoti } from '@shared/common';
import { SAVED_JSON, SAVED_JSON_2 } from '@shared/constant';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import diff from 'diff-sequences';

@Component({
  selector: 'app-json-beautifier',
  templateUrl: './json-beautifier.component.html',
  styleUrls: ['./json-beautifier.component.scss']
})
export class JsonBeautifierComponent implements OnInit, OnDestroy {
  @ViewChild('text1') text1!: ElementRef;
  @ViewChild('text2') text2!: ElementRef;

  public editorOptions!: JsonEditorOptions;
  public editorOptions2!: JsonEditorOptions;
  public initialData: any;
  public initialData2: any;
  public visibleData: any;
  public visibleData2: any;

  isLoadingResults = false;

  constructor() {
    // TODO document why this constructor is empty

  }

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
    const sampleJSON = ExampleJSON;
    this.initialData = this.StringToReadableObject(localStorage.getItem(SAVED_JSON) || sampleJSON);
    this.initialData2 = this.StringToReadableObject(localStorage.getItem(SAVED_JSON_2) || sampleJSON);
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
  findDiff() {
    this.isLoadingResults = true;
    const result = this.callFindDiff() || [];

    const left = document.querySelectorAll('#json-editor-left .ace_line') || [];
    const right = document.querySelectorAll('#json-editor-right .ace_line') || [];
    let currentLineLeft = 0;
    let currentLineRight = 0;
    const coloredRight: any[] = [];
    const coloredLeft: any[] = [];
    for (let [flag, value] of result) {
      const num = (value.toString().match(/[\n]/gm) || []).length;
      switch (flag) {
        case 0:
          for (let i = 0; i <= num; ++i) {
            const thisRow = currentLineLeft + i;
            if (!coloredLeft.includes(thisRow))
              left[thisRow] && ((left[thisRow] as any).style.backgroundColor = 'white');
          }
          currentLineLeft += num;

          for (let i = 0; i <= num; ++i) {
            const thisRow = currentLineRight + i;
            if (!coloredRight.includes(thisRow))
              right[thisRow] && ((right[thisRow] as any).style.backgroundColor = 'white');
          }
          currentLineRight += num;
          break;
        case 1: // left less than right
          for (let i = 0; i <= num; ++i) {
            const thisRow = currentLineRight + i;
            right[thisRow] && ((right[thisRow] as any).style.backgroundColor = '#BDDDFF');
            coloredRight.push(thisRow);
          }
          currentLineRight += num;
          break;
        case -1: // left more than right
          for (let i = 0; i <= num; ++i) {
            const thisRow = currentLineLeft + i;
            left[thisRow] && ((left[thisRow] as any).style.backgroundColor = '#BDDDFF');
            coloredLeft.push(thisRow);
          }
          currentLineLeft += num;
          break;
      }
      this.isLoadingResults = false;
    }
  }

  ngOnDestroy(): void {
    try {
      localStorage.setItem(SAVED_JSON, JSON.stringify(this.visibleData));
      localStorage.setItem(SAVED_JSON_2, JSON.stringify(this.visibleData2));
    } catch (e) {
      showNoti('Lỗi lưu local: ' + e, 'danger');
    }
  }

  callFindDiff() {
    const a = JSON.stringify(this.visibleData, null, 2);
    const b = JSON.stringify(this.visibleData2, null, 2);

    let aIndex = 0;
    let bIndex = 0;
    const array = [];

    let count = 0;
    function isCommon(aIndex: number, bIndex: number) {
      return a[aIndex] === b[bIndex];
    }
    function foundSubsequence(nCommon: number, aCommon: number, bCommon: number) {
      // see examples
      ++count;
      if (aIndex !== aCommon) {
        array.push([-1, a.slice(aIndex, aCommon)]); // delete is -1
      }
      if (bIndex !== bCommon) {
        array.push([1, b.slice(bIndex, bCommon)]); // insert is 1
      }

      aIndex = aCommon + nCommon; // number of characters compared in a
      bIndex = bCommon + nCommon; // number of characters compared in b
      array.push([0, a.slice(aCommon, aIndex)]); // common is 0
    }
    diff(a.length, b.length, isCommon, foundSubsequence);

    // After the last common subsequence, push remaining change items.
    if (aIndex !== a.length) {
      array.push([-1, a.slice(aIndex)]);
    }
    if (bIndex !== b.length) {
      array.push([1, b.slice(bIndex)]);
    }

    return array;
  }

  onScroll1(e: any) {
    // change it to angular and element is 1
    const scrollTop = this.text1.nativeElement.scrollTop;
    this.text2.nativeElement.scrollTop = scrollTop;
  }
  onScroll2(e: any) {
    // change it to angular and element is 2
    const scrollTop = this.text2.nativeElement.scrollTop;
    this.text1.nativeElement.scrollTop = scrollTop;
  }
}
