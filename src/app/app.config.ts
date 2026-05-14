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
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
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
    // No withFetch() — at 485955d (last known good) HttpClient was XHR-based,
    // and the SSR pass reliably waited for /v1/post/ref/:ref before
    // serializing. The switch to native fetch broke that handoff and every
    // SSR render lost its post body / OG tags. Keep the XHR backend until we
    // have a reproducible fix on the fetch path.
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideClientHydration(),
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
