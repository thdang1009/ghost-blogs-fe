import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const ALLOWED_EMBED_HOSTS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'player.vimeo.com',
  'www.youtube.com',
  'docs.google.com',
  'dangtrinh.site',
];

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    try {
      const { hostname } = new URL(url);
      const normalised = hostname.replace(/^www\./, '');
      if (
        !ALLOWED_EMBED_HOSTS.some(h => normalised === h.replace(/^www\./, ''))
      ) {
        throw new Error(`[SafePipe] Blocked untrusted embed URL: ${url}`);
      }
    } catch (e: unknown) {
      // Re-throw allowlist violations; wrap invalid URLs with a clear message
      if (e instanceof Error && e.message.startsWith('[SafePipe]')) throw e;
      throw new Error(`[SafePipe] Invalid URL: ${url}`);
    }
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
