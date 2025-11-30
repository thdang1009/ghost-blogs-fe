import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ScriptLoaderService } from '../script-loader/script-loader.service';
import { environment } from '@environments/environment';

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

@Injectable({
  providedIn: 'root',
})
export class ThirdPartyLoaderService {
  private isBrowser: boolean;

  constructor(
    private scriptLoader: ScriptLoaderService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Initialize all third-party scripts with lazy loading
   * This should be called from app initialization
   */
  initializeThirdPartyScripts(): void {
    // Only run in browser
    if (!this.isBrowser) return;

    // Load Google Analytics after 3 seconds
    this.loadGoogleAnalytics(3000);

    // Load Facebook SDK after 4 seconds
    this.loadFacebookSDK(4000);

    // Load Google Sign-In after 5 seconds
    this.loadGoogleSignIn(5000);
  }

  /**
   * Load Google Analytics (gtag.js)
   */
  private loadGoogleAnalytics(delayMs: number = 3000): void {
    if (!this.isBrowser || !environment.gaCode) return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', environment.gaCode, {
      page_path: window.location.pathname,
    });

    // Load the script
    this.scriptLoader
      .loadScriptLazy(
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${environment.gaCode}`,
          async: true,
        },
        delayMs
      )
      .catch(err => console.error('Failed to load Google Analytics:', err));
  }

  /**
   * Load Facebook SDK
   */
  private loadFacebookSDK(delayMs: number = 4000): void {
    // Initialize FB async
    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId: '598355823212592',
          xfbml: true,
          version: 'v22.0',
        });
        window.FB.AppEvents.logPageView();
      }
    };

    // Load the script
    this.scriptLoader
      .loadScriptLazy(
        {
          src: 'https://connect.facebook.net/en_US/sdk.js',
          id: 'facebook-jssdk',
          async: true,
          defer: true,
        },
        delayMs
      )
      .catch(err => console.error('Failed to load Facebook SDK:', err));
  }

  /**
   * Load Google Sign-In
   */
  private loadGoogleSignIn(delayMs: number = 5000): void {
    this.scriptLoader
      .loadScriptLazy(
        {
          src: 'https://accounts.google.com/gsi/client',
          async: true,
          defer: true,
        },
        delayMs
      )
      .catch(err => console.error('Failed to load Google Sign-In:', err));
  }

  /**
   * Track page view (for SPA routing)
   */
  trackPageView(url: string): void {
    if (window.gtag) {
      window.gtag('config', environment.gaCode, {
        page_path: url,
      });
    }
  }
}
