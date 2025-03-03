import { Observable, of } from "rxjs";
import { TDTD_STATUS } from "./enum";

declare var $: any;
export interface GhostSiteResponse {
  status: string,
  data: any,
}
export interface LoginResponse extends GhostSiteResponse {
  token: string
}
type NotiType = 'danger' | 'success' | 'error' | 'warning' | 'info';

export function showNoti(content: string, type: NotiType, _timer = 1000, title = 'Notifications') {
  showNotification('top', 'right', title, content, type, _timer);
}

export function showNotiSocket(content: string, type: NotiType, _timer = 1000, title = 'Notifications') {
  showNotification('top', 'left', title, content, type, _timer);
}

export function showNotification(from: string, align: string, title: string, content: string, type: NotiType, _timer = 1000) {
  console.log('showNotificationNotImplemented');
}
export function buildQueryString(object: any) {
  const str = [];
  for (const p in object) {
    if (object.hasOwnProperty(p) && object[p]) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(object[p]));
    }
  }
  return str.join('&');
}
export function isImportant(content: string) {
  return content.includes('**');
}
export function isInPDFView() {
  const pathname = location.pathname;
  return pathname.includes('index') || pathname.includes('view-book');
}
export function checkIsInPDFView(pathname = '') {
  return pathname.includes('index') || pathname.includes('view-book');
}
export function toggleStatus(oldStatus: string) {
  return {
    NEW: TDTD_STATUS.DONE,
    DONE: TDTD_STATUS.NEW,
  }[oldStatus];
}
export function nextStatus(oldStatus: string) {
  return {
    NEW: TDTD_STATUS.DONE,
    DONE: TDTD_STATUS.TOMORROW,
    TOMORROW: TDTD_STATUS.NOT_YET,
    NOT_YET: TDTD_STATUS.IN_PAST,
    IN_PAST: TDTD_STATUS.NEW
  }[oldStatus];
}
export function previousStatus(oldStatus: string) {
  return {
    DONE: TDTD_STATUS.NEW,
    TOMORROW: TDTD_STATUS.DONE,
    NOT_YET: TDTD_STATUS.TOMORROW,
    IN_PAST: TDTD_STATUS.NOT_YET,
    NEW: TDTD_STATUS.IN_PAST
  }[oldStatus];
}
export function isValidFile(file: File) {
  const isValidSize = file.size <= 10 * 1024 * 1024;
  return isValidSize;
}
export function compareWithFunc(a: any, b: any) {
  return a == b;
}
export function openExternalLink(link: string) {
  window.open(link, '_blank');
}

export function handleError<T>(operation = 'operation', result?: T): (error: any) => Observable<T> {
  return (error: any): Observable<T> => {
    console.error(error);
    log(`${operation} failed: ${error.message}`);
    return of(result as T);
  };
}

function log(message: string) {
  console.log(message);
}

export function ghostLog(...params: any[]) {
  console.log(...params);
}
export function debounce<T extends (...args: any[]) => void>(func: T, timeout = 300): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>): void {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
