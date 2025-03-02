import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { checkIsInPDFView } from '@shared/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private listTitles: any[] = [];
  title = '';
  mobile_menu_visible: number = 0;
  private toggleButton: HTMLElement | null = null;
  private sidebarVisible: boolean = true;
  stringToSearch = '';
  _isInPDFView = false;

  constructor(
    private location: Location,
    private element: ElementRef,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.sidebarVisible = false;
  }

  ngOnInit() {
    this.listTitles = ROUTES.reduce((pre: any[], cur: any) => {
      const arr = [cur, ...(cur.children && cur.children.map((el: any) => el) || [])];
      return [...pre, ...arr];
    }, []);
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0] as HTMLElement;
    this.router.events.subscribe((event) => {
      this.sidebarClose();
      const closeLayer = document.getElementsByClassName('close-layer')[0] as HTMLElement;
      if (closeLayer) {
        closeLayer.remove();
        this.mobile_menu_visible = 0;
      }
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this._isInPDFView = checkIsInPDFView(event.url);
      }
    });
  }

  sidebarOpen() {
    const body = document.getElementsByTagName('body')[0];
    setTimeout(() => {
      this.toggleButton?.classList.add('toggled');
    }, 500);

    body.classList.add('nav-open');
    this.sidebarVisible = true;
  };
  sidebarClose() {
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton?.classList.remove('toggled');
    this.sidebarVisible = false;
    body.classList.remove('nav-open');
  };
  sidebarToggle() {
    const toggle = document.getElementsByClassName('navbar-toggler')[0] as HTMLElement;
    const body = document.getElementsByTagName('body')[0];

    if (!this.sidebarVisible) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }

    if (this.mobile_menu_visible === 1) {
      body.classList.remove('nav-open');
      const closeLayer = document.getElementsByClassName('close-layer')[0] as HTMLElement;
      if (closeLayer) {
        closeLayer.remove();
      }
      setTimeout(() => {
        toggle.classList.remove('toggled');
      }, 400);

      this.mobile_menu_visible = 0;
    } else {
      setTimeout(() => {
        toggle.classList.add('toggled');
      }, 430);

      const closeLayer = document.createElement('div');
      closeLayer.setAttribute('class', 'close-layer');

      const mainPanel = document.getElementsByClassName('main-panel')[0];
      const wrapperFullPage = document.getElementsByClassName('wrapper-full-page')[0];

      if (mainPanel) {
        mainPanel.appendChild(closeLayer);
      } else if (body.classList.contains('off-canvas-sidebar')) {
        wrapperFullPage.appendChild(closeLayer);
      }

      setTimeout(() => {
        closeLayer.classList.add('visible');
      }, 100);

      closeLayer.onclick = () => {
        body.classList.remove('nav-open');
        this.mobile_menu_visible = 0;
        closeLayer.classList.remove('visible');
        setTimeout(() => {
          closeLayer.remove();
          toggle.classList.remove('toggled');
        }, 400);
      };

      body.classList.add('nav-open');
      this.mobile_menu_visible = 1;
    }
  };

  getTitle() {
    const titlee = this.location.prepareExternalUrl(this.location.path());
    const regexPath = /\/(admin|guest)\/.*/;
    const subpath = ((titlee.match(regexPath) || [])[0] || '')
      .replace(/\/(admin|guest)\//, '')
      .replace(/\?.*/, '');
    const found = (this.listTitles.filter(item => item.path === subpath) || [])[0] || {};
    const title = found.title || 'Dashboard';
    return title;
  }

  search() {
    if (this._isInPDFView) {
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute,
          queryParams: { searchInPDF: this.stringToSearch || null, time: (new Date()).getTime() },
          queryParamsHandling: 'merge'
        });
    } else {
      // call search normal in all page
    }
  }
}
