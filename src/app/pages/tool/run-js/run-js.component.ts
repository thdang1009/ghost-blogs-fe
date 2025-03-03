import { Component, OnDestroy, OnInit } from '@angular/core';
import { ExampleCode } from '@helpers/fake.data';
import { showNoti } from '@shares/common';
import { SAVED_CODE } from '@shares/constant';
import { CodeModel } from '@ngstack/code-editor';
declare const EVERYTHING = 'everything';
@Component({
  selector: 'app-run-js',
  templateUrl: './run-js.component.html',
  styleUrls: ['./run-js.component.scss']
})
export class RunJsComponent implements OnInit, OnDestroy {

  theme = 'vs-dark';

  codeModel: CodeModel = {
    language: 'javascript',
    uri: 'main.js',
    value: localStorage.getItem(SAVED_CODE) || ExampleCode,
  };

  options = {
    contextmenu: true,
    minimap: {
      enabled: true,
    },
  };
  isLoadingResults = false;
  store = [];

  constructor() {
    // TODO document why this constructor is empty
  
  }

  ngOnDestroy(): void {
    this.saveOnLocal();
  }

  removeConsoleEverything() {
    console[EVERYTHING] = undefined;
  }

  initConsoleEverything() {
    if (console[EVERYTHING] === undefined) {
      console[EVERYTHING] = [];
      const TS = () => {
        return (new Date).toLocaleString("sv", { timeZone: 'UTC' }) + "Z"
      }
      window.onerror = function (error, url, line) {
        console[EVERYTHING].push({
          type: "exception",
          timeStamp: TS(),
          value: { error, url, line }
        })
        return false;
      }
      window.onunhandledrejection = function (e) {
        console[EVERYTHING].push({
          type: "promiseRejection",
          timeStamp: TS(),
          value: e.reason
        })
      }

      const hookLogType = (logType) => {
        const original = console[logType].bind(console)
        return function () {
          console[EVERYTHING].push({
            type: logType,
            timeStamp: TS(),
            value: Array.from(arguments)
          })
          original.apply(console, arguments)
        }
      }

      ['log', 'error', 'warn', 'debug'].forEach(logType => {
        console[logType] = hookLogType(logType)
      })
    }
  }

  ngOnInit(): void {
    const handleFunction = this.handleCmdSave.bind(this);
    (function () {
      let timer;
      let metaflag = false;
      document.addEventListener('keydown', function (event) {
        if (event.ctrlKey || event.metaKey || event.which === 19) {
          //      ctrl           cmd(mac)         break/pause key(?)
          metaflag = true;
          timer = Date.now();
        }
        if (metaflag && event.which === 83 && Date.now() - timer < 100) {
          //                 "S"                                //100ms
          event.preventDefault(); // maybe not necessary
          handleFunction();
          metaflag = false;
        }
      });
    })();
    window.onbeforeunload = () => this.ngOnDestroy();
  }

  saveOnLocal() {
    try {
      localStorage.setItem(SAVED_CODE, this.codeModel.value);
    } catch (e) {
      showNoti('Lỗi lưu local: ' + e, 'danger');
    }
  }

  onCodeChanged(value) {
  }

  handleCmdSave() {
    this.isLoadingResults = true;
    const code = this.codeModel.value;
    try {
      if (console.log['ghost_cheat'] === true) {
        console.log = window['ghost_console'];
        console.log['ghost_cheat'] = false;
      }
      this.handleV1(code);
      this.saveOnLocal();

    } catch (e) {
      showNoti(e, 'danger');
    } finally {
      this.isLoadingResults = false;
    }
  }

  handleCmdCopy() {
    this.isLoadingResults = true;
    const code = this.codeModel.value;
    try {
      navigator.clipboard.writeText(code);
      showNoti('Copied!', 'success');
    } catch (e) {
      showNoti(e, 'danger');
    } finally {
      this.isLoadingResults = false;
    }
  }

  handleV1(code) {
    const myJoin = (arr) => {
      return arr.map(el => (typeof el === 'object' || el === undefined) ? JSON.stringify(el) : el).join(' ');
    }
    const store = [];
    window['ghost_console'] = console.log;
    console.log = function (...value) {
      window['ghost_console'](...value);
      const joinedValue = myJoin(value);
      store.push(joinedValue);
      return value;
    };
    console.log['ghost_cheat'] = true;
    /* tslint:disable no-eval */
    eval(code);
    this.store = store;
  }

  handleV2(code) {
    this.initConsoleEverything();
    eval(code);
    this.removeConsoleEverything();
  }
}
