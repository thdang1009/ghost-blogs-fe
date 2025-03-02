import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { checkIsInPDFView } from '@shared/common';
import { AuthService } from '@services/_index';
import { ROUTES } from '../guest-sidebar/guest-sidebar.component';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-guest-navbar',
  templateUrl: './guest-navbar.component.html',
  styleUrls: ['./guest-navbar.component.css']
})
export class GuestNavbarComponent implements OnInit {
  isAdmin = false;
  private listTitles: any[] = [];
  mobile_menu_visible: any = 0;
  private toggleButton: any;
  private sidebarVisible: boolean = true;
  stringToSearch = '';
  _isInPDFView = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private element: ElementRef,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isAdmin = this.authService.isAdmin();
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
    this.router.events.subscribe((event) => {
      this.sidebarClose();
      const closeLayer = this.document.getElementsByClassName('close-layer')[0] as HTMLElement;
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

  search() {
    if (this._isInPDFView) {
      // call search in pdf
      // just update the ?searchInPDF=...
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

  gotoAdminView() {
    if (this.isLogined()) {
      this.router.navigate(['admin/dashboard']);
    }
  }

  isLogined() {
    return this.authService.isLogin();
  }

  login() {
    this.router.navigate(['login']);
  }
  logout() {
    this.router.navigate(['logout']);
  }
  sidebarToggle() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const toggle = this.document.getElementsByClassName('navbar-toggler')[0] as HTMLElement;
    const body = this.document.getElementsByTagName('body')[0];

    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }

    if (this.mobile_menu_visible === 1) {
      body.classList.remove('nav-open');
      const closeLayer = this.document.getElementsByClassName('close-layer')[0] as HTMLElement;
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

      const closeLayer = this.document.createElement('div');
      closeLayer.setAttribute('class', 'close-layer');

      if (body.querySelectorAll('.main-panel')) {
        this.document.getElementsByClassName('main-panel')[0].appendChild(closeLayer);
      } else if (body.classList.contains('off-canvas-sidebar')) {
        this.document.getElementsByClassName('wrapper-full-page')[0].appendChild(closeLayer);
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
  }

  sidebarOpen() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const toggleButton = this.toggleButton;
    const body = this.document.getElementsByTagName('body')[0];
    setTimeout(function () {
      toggleButton.classList.add('toggled');
    }, 500);

    body.classList.add('nav-open');
    this.sidebarVisible = true;
  }

  sidebarClose() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const body = this.document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    body.classList.remove('nav-open');
  }
}
