import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit, AfterViewInit {
  private _router: Subscription | undefined;
  private lastPoppedUrl: string | undefined;
  private yScrollStack: number[] = [];

  constructor(public location: Location, private router: Router) { }

  ngOnInit() {
    const isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

    if (isWindows && !document.getElementsByTagName('body')[0].classList.contains('sidebar-mini')) {
      // Use native scrolling instead of perfect-scrollbar
      document.getElementsByTagName('body')[0].classList.add('native-scrollbar-on');
    } else {
      document.getElementsByTagName('body')[0].classList.remove('native-scrollbar-off');
    }
    const elemMainPanel = document.querySelector('.main-panel');
    const elemSidebar = document.querySelector('.sidebar .sidebar-wrapper');

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
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    const sidebarResponsive = document.querySelector('body > .navbar-collapse') as HTMLElement;
    const sidebarImgContainer = sidebar?.querySelector('.sidebar-background') as HTMLElement;

    if (windowWidth > 767) {
      const fixedPluginDropdown = document.querySelector('.fixed-plugin .dropdown');
      if (fixedPluginDropdown?.classList.contains('show-dropdown')) {
        fixedPluginDropdown.classList.add('open');
      }
    }

    // Setup click handlers
    const fixedPluginLinks = document.querySelectorAll('.fixed-plugin a');
    fixedPluginLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        if ((link as HTMLElement).classList.contains('switch-trigger')) {
          event.stopPropagation();
        }
      });
    });

    const badges = document.querySelectorAll('.fixed-plugin .badge');
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

    const imgHolders = document.querySelectorAll('.fixed-plugin .img-holder');
    imgHolders.forEach(holder => {
      holder.addEventListener('click', function (this: HTMLElement) {
        const fullPageBackground = document.querySelector('.full-page-background');

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
  isMaps(path: string) {
    let titlee = this.location.prepareExternalUrl(this.location.path());
    titlee = titlee.slice(1);
    if (path === titlee) {
      return false;
    } else {
      return true;
    }
  }
  runOnRouteChange(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemMainPanel = document.querySelector('.main-panel');
      if (elemMainPanel) {
        // Use native scrolling instead of perfect-scrollbar
        elemMainPanel.scrollTop = 0;
      }
    }
  }
  isMac(): boolean {
    let bool = false;
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
      bool = true;
    }
    return bool;
  }

}
