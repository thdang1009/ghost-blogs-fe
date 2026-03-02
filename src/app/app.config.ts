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
    provideClientHydration(withEventReplay()),
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
