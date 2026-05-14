import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  SecurityContext,
} from '@angular/core';
import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withViewTransitions,
  withInMemoryScrolling,
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withFetch,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

import { routes } from './app.routes';
import { GlobalErrorHandlerService } from './services/error-handler/global-error-handler.service';
import { TokenInterceptor } from './helpers/_index';
import {
  MarkdownModule,
  ClipboardButtonComponent,
  MARKED_OPTIONS,
  CLIPBOARD_OPTIONS,
} from 'ngx-markdown';
import { AnchorService } from '@shared/anchor/anchor.service';
import { markedOptionsFactory } from './pages/blogs/blog.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimationsAsync(),
    provideClientHydration(
      withEventReplay(),
      // Carry SSR GET responses to the browser via <script type="ng-state">.
      // Hydration reads them so the same data isn't re-fetched. We exclude
      // requests carrying an Authorization header — those are per-user and
      // must not leak through the shared SSR transfer state. Analytics POSTs
      // are never cached.
      withHttpTransferCacheOptions({
        includePostRequests: false,
        includeRequestsWithAuthHeaders: false,
        filter: req => {
          if (req.method !== 'GET') return false;
          // Per-user / admin endpoints — don't transfer.
          if (/\/v1\/(user|me|admin|auth)(\/|$|\?)/.test(req.url)) return false;
          if (/\/v1\/post-analytics(\/|$|\?)/.test(req.url)) return false;
          // Anything explicitly flagged private in the query string.
          if (/[?&]private=true(&|$)/.test(req.url)) return false;
          return true;
        },
      })
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    DatePipe,
    AnchorService,
    importProvidersFrom(
      MarkdownModule.forRoot({
        loader: HttpClient,
        markedOptions: {
          provide: MARKED_OPTIONS,
          useFactory: markedOptionsFactory,
          deps: [AnchorService],
        },
        clipboardOptions: {
          provide: CLIPBOARD_OPTIONS,
          useValue: { buttonComponent: ClipboardButtonComponent },
        },
        sanitize: SecurityContext.NONE,
      })
    ),
  ],
};
