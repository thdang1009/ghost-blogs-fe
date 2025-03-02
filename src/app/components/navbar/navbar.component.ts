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
  mobile_menu_visible: any = 0;
  private toggleButton: any;
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
    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
    this.router.events.subscribe((event) => {
      this.sidebarClose();
      /* tslint:disable-next-line */
      var $layer: any = document.getElementsByClassName('close-layer')[0];
      if ($layer) {
        $layer.remove();
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
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    setTimeout(function () {
      toggleButton.classList.add('toggled');
    }, 500);

    body.classList.add('nav-open');

    this.sidebarVisible = true;
  };
  sidebarClose() {
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    body.classList.remove('nav-open');
  };
  sidebarToggle() {
    // TODO: Implement sidebar toggle
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
