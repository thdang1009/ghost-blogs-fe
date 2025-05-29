import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, SecurityContext } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { ComponentsModule } from './components/components.module';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

// my codes
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './layouts/guest-layout/guest-layout.component';
import { TokenInterceptor } from './helpers/_index';
import { CommonModule, DatePipe } from '@angular/common';
import {
  AuthService
} from './services/_index';
import { markedOptionsFactory } from './pages/blogs/blog.module';

// third party
import { MarkdownModule, ClipboardButtonComponent, MARKED_OPTIONS, CLIPBOARD_OPTIONS } from 'ngx-markdown';
import { AnchorModule } from '@shared/anchor/anchor.module';
import { DonationComponent } from '@pages/donation/donation.component';
import { AuthModule } from '@pages/auth/auth.module';
import { AnchorService } from '@shared/anchor/anchor.service';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { environment } from '@environments/environment';
import { AlertModule } from '@components/alert/alert.module';
// NgModule
@NgModule({
  imports: [
    AnchorModule,
    AuthModule,
    AlertModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    CommonModule,
    // third party
    // CodeEditorModule.forRoot(),
    NgxGoogleAnalyticsModule.forRoot(environment.gaCode),
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MARKED_OPTIONS,
        useFactory: markedOptionsFactory,
        deps: [AnchorService],
      },
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: {
          buttonComponent: ClipboardButtonComponent,
        },
      },
      sanitize: SecurityContext.NONE,
    }),
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    GuestLayoutComponent,
    DonationComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    DatePipe,
    AuthService,
    provideClientHydration(),
  ],
  bootstrap: [AppComponent],
  exports: [
    AnchorModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    CommonModule,
    // third party
    MarkdownModule,
  ]
})
export class AppModule { }
