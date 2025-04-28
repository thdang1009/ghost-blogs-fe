import { Observable, of } from "rxjs";
import { TDTD_STATUS } from "./enum";
import { Renderer2 } from '@angular/core';

export interface GhostSiteResponse {
  status: string,
  data: any,
}
export interface LoginResponse extends GhostSiteResponse {
  token: string
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
export function addStructuredData(_document: Document) {
  const script = _document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Website",
    "name": "Ghost's blogs",
    "description": "Ghost's blogs",
    "url": "https://dangtrinh.site"
  });
  _document.head.appendChild(script);
}

/**
 * Opens a URL in a new tab using the provided Renderer2 instance.
 * @param renderer - The Renderer2 instance to use for DOM manipulation.
 * @param url - The URL to open in a new tab.
 */
export function openNewTab(renderer: Renderer2, url: string): void {
  const a = renderer.createElement('a');
  renderer.setAttribute(a, 'href', url);
  renderer.setAttribute(a, 'target', '_blank');
  renderer.setAttribute(a, 'rel', 'noopener noreferrer');
  renderer.appendChild(document.body, a);
  a.click();
  renderer.removeChild(document.body, a); // Clean up
}



// Calculate Levenshtein distance between two strings
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1      // insertion
        );
      }
    }
  }

  return dp[m][n];
}

// Calculate similarity percentage between two strings
export function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return ((maxLength - distance) / maxLength) * 100;
}
