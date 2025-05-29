import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-guest-layout',
  templateUrl: './guest-layout.component.html',
  styleUrls: ['./guest-layout.component.scss']
})
export class GuestLayoutComponent implements OnInit, AfterViewInit {
  private _router: Subscription | undefined;
  private lastPoppedUrl: string | undefined;
  private yScrollStack: number[] = [];

  constructor(
    public location: Location,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const isWindows = navigator.platform.indexOf('Win') > -1;
    const body = this.document.getElementsByTagName('body')[0];

    if (isWindows && !body.classList.contains('sidebar-mini')) {
      body.classList.add('native-scrollbar-on');
    } else {
      body.classList.remove('native-scrollbar-off');
    }

    const elemMainPanel = this.document.querySelector('.main-panel');
    const elemSidebar = this.document.querySelector('.sidebar .sidebar-wrapper');

    this.location.subscribe((ev: PopStateEvent) => {
      this.lastPoppedUrl = ev.url;
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        if (event.url !== this.lastPoppedUrl) {
          this.yScrollStack.push(window.scrollY);
        }
      } else if (event instanceof NavigationEnd) {
        if (event.url === this.lastPoppedUrl) {
          this.lastPoppedUrl = undefined;
          window.scrollTo(0, this.yScrollStack.pop() || 0);
        } else {
          window.scrollTo(0, 0);
        }
      }
    });
    this._router = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      if (elemMainPanel && elemSidebar) {
        elemMainPanel.scrollTop = 0;
        elemSidebar.scrollTop = 0;
      }
    });

    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      // TODO document why this block is empty
    }

    const windowWidth = window.innerWidth;
    const sidebar = this.document.querySelector('.sidebar');
    const sidebarResponsive = this.document.querySelector('body > .navbar-collapse');
    const sidebarImgContainer = sidebar?.querySelector('.sidebar-background');

    if (windowWidth > 767) {
      const fixedPluginDropdown = this.document.querySelector('.fixed-plugin .dropdown');
      if (fixedPluginDropdown?.classList.contains('show-dropdown')) {
        fixedPluginDropdown.classList.add('open');
      }
    }

    const switchTriggers = this.document.querySelectorAll('.fixed-plugin a.switch-trigger');
    switchTriggers.forEach(trigger => {
      trigger.addEventListener('click', function (this: HTMLElement, event: Event) {
        event.stopPropagation();
      });
    });

    const badges = this.document.querySelectorAll('.fixed-plugin .badge');
    badges.forEach(badge => {
      badge.addEventListener('click', function (this: HTMLElement) {
        const siblings = Array.from(this.parentElement?.children || []);
        siblings.forEach(sibling => (sibling as HTMLElement).classList.remove('active'));
        this.classList.add('active');

        const newColor = (this as HTMLElement).dataset['color'];

        if (sidebar) {
          sidebar.setAttribute('data-color', newColor || '');
        }

        if (sidebarResponsive) {
          sidebarResponsive.setAttribute('data-color', newColor || '');
        }
      });
    });

    const imgHolders = this.document.querySelectorAll('.fixed-plugin .img-holder');
    const that = this;
    imgHolders.forEach(holder => {
      holder.addEventListener('click', function (this: HTMLElement) {
        const fullPageBackground = that.document.querySelector('.full-page-background');

        const parentLi = this.parentElement;
        if (parentLi?.parentElement) {
          const siblings = Array.from(parentLi.parentElement.children);
          siblings.forEach(sibling => sibling.classList.remove('active'));
          parentLi.classList.add('active');
        }

        const newImage = this.querySelector('img')?.getAttribute('src');

        const updateBackground = (element: Element | null) => {
          if (element) {
            (element as HTMLElement).style.opacity = '0';
            setTimeout(() => {
              (element as HTMLElement).style.backgroundImage = `url("${newImage}")`;
              (element as HTMLElement).style.opacity = '1';
            }, 50);
          }
        };

        updateBackground(sidebarImgContainer as HTMLElement);
        updateBackground(fullPageBackground as HTMLElement);

        if (sidebarResponsive) {
          (sidebarResponsive as HTMLElement).style.backgroundImage = `url("${newImage}")`;
        }
      });
    });
  }

  ngAfterViewInit() {
    this.runOnRouteChange();
  }

  isMaps(path: string): boolean {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    titlee = titlee.slice(1);
    return path !== titlee;
  }

  runOnRouteChange(): void {
    if (isPlatformBrowser(this.platformId) && window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemMainPanel = this.document.querySelector('.main-panel');
      if (elemMainPanel) {
        elemMainPanel.scrollTop = 0;
      }
    }
  }

  isMac(): boolean {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
      navigator.platform.toUpperCase().indexOf('IPAD') >= 0;
  }

  isMobileMenu(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth <= 991;
    }
    return false; // Default for server-side rendering
  }
}
