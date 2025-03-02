import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@services/_index';
import { checkIsInPDFView } from '@shares/common';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  // permission: string;
}
export const ROUTES: RouteInfo[] = [
  {
    path: 'useful-app/json-beautifier',
    title: 'JSON Beautifier',
    icon: 'code',
    class: ''
  },
  {
    path: 'useful-app/json-excel',
    title: 'JSON Excel',
    icon: 'code',
    class: ''
  },
  {
    path: 'useful-app/text-diff',
    title: 'Text Diff',
    icon: 'description',
    class: ''
  },
  {
    path: 'admin/dashboard',
    title: 'Amin',
    icon: 'dashboard',
    class: ''
  }
];

@Component({
  selector: 'app-guest-sidebar',
  templateUrl: './guest-sidebar.component.html',
})
export class GuestSidebarComponent implements OnInit {

  _isInPDFView;
  menuItems: any[];
  isLogined = false;
  stringToSearch = '';
  isMember = false;
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService) {
    this.isLogined = this.authService.isLogin();
    this.isMember = this.authService.isMember();
    if (this.isLogined) {
    }
  }

  ngOnInit(): void {

    let tempMenu = ROUTES;
    if (!this.isMember) {
      tempMenu = ROUTES.filter(el => el && el.path !== 'admin/dashboard');
    }
    this.menuItems = tempMenu;
    this.router.events.subscribe((event: NavigationEnd) => {
      if (event instanceof NavigationEnd) {
        this._isInPDFView = checkIsInPDFView(event.url);
      }
    });
  }

  search() {
    // alert(this.stringToSearch)
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

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };
}
