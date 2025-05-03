import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@services/_index';

declare interface Child {
  path: string;
  title: string;
  icon: string;
  class: string;
  permission: string;
}
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  permission: string;
  hasChild: boolean;
  children?: Array<Child>;
}
export const ROUTES: RouteInfo[] = [
  { path: 'dashboard', title: 'Dashboard', icon: 'dashboard', class: '', permission: 'isMember', hasChild: false },
  {
    path: 'user', title: 'User', icon: 'people', class: '', permission: 'isGrandAdmin', hasChild: true,
    children: [
      { path: 'user/user-list', title: 'List User', icon: 'people', class: '', permission: 'isGrandAdmin' },
      { path: 'user/subscriptions', title: 'Subscriptions', icon: 'notifications', class: '', permission: 'isMember' },
    ]
  },
  {
    path: 'tool', title: 'Tool', icon: 'handyman', class: '', permission: 'isMember', hasChild: true,
    children: [
      { path: 'tool/todo-today', title: 'Todo Today', icon: 'checklist_rtl', class: '', permission: 'isMember' },
      { path: 'tool/note', title: 'Note', icon: 'notes', class: '', permission: 'isMember' },
      { path: 'tool/guest-message', title: 'List Guest Message', icon: 'list', class: '', permission: 'isGrandAdmin' },
      { path: 'tool/coupon', title: 'Coupon Management', icon: 'card_giftcard', class: '', permission: 'isGrandAdmin' },
      // { path: 'tool/run-js', title: 'Run JS', icon: 'code', class: '', permission: 'isGrandAdmin' }
    ]
  },
  {
    path: 'file', title: 'File & Book', icon: 'library_books', class: '', permission: 'isAdmin', hasChild: true,
    children: [
      { path: 'file/file-list', title: 'List Files', icon: 'picture_as_pdf', class: '', permission: 'isAdmin' },
      { path: 'file/file', title: 'Add File', icon: 'post_add', class: '', permission: 'isAdmin' },
      { path: 'file/book', title: 'Book', icon: 'library_books', class: '', permission: 'isAdmin' },
      { path: 'file/view-book', title: 'View Book', icon: 'menu_book', class: '', permission: 'isAdmin' },
    ]
  },
  {
    path: 'blog', title: 'Blog', icon: 'library_books', class: '', permission: 'isMember', hasChild: true,
    children: [
      { path: 'blog/post-list', title: 'List Post', icon: 'list', class: '', permission: 'isMember' },
      { path: 'blog/tag-list', title: 'List Tag', icon: 'list', class: '', permission: 'isAdmin' },
      { path: 'blog/category-list', title: 'List Category', icon: 'list', class: '', permission: 'isAdmin' },
      { path: 'blog/series-list', title: 'List Series', icon: 'collections_bookmark', class: '', permission: 'isAdmin' },
    ]
  },
  {
    path: 'operation', title: 'Operation', icon: 'engineering', class: '', permission: 'isMember', hasChild: true,
    children: [
      { path: 'operation/todo-label-list', title: 'List TodoLabel', icon: 'list', class: '', permission: 'isAdmin' },
      { path: 'operation/coupon-settings', title: 'Coupon Settings', icon: 'settings', class: '', permission: 'isGrandAdmin' },
    ]
  },
  // {
  //   path: 'apps', title: 'Apps', icon: 'apps', class: '', permission: 'isMember', hasChild: true,
  //   children: [
  //     { path: 'apps/json-beautifier', title: 'JSON Beautifier', icon: 'code', class: '', permission: 'isMember' },
  //     { path: 'apps/json-excel', title: 'JSON Excel', icon: 'code', class: '', permission: 'isMember' },
  //   ]
  // }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  menuItems: any[] = [];
  // var
  isLogined = false;
  isMember = false;
  isAdmin = false;
  isGrandAdmin = false;
  username = 'Guest';
  fullName = 'Guest';
  permission = 'GUEST';
  stringToSearch = '';
  _isInPDFView: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.isLogined = authService.isLogin();
    if (this.isLogined) {
      this.checkAfterLogin();
    }
  }

  checkAfterLogin() {
    this.setUserInfo();
    this.checkPermission();
  }

  ngOnInit() {
    this.authService.isLoggedIn.subscribe((status: any) => {
      if (status === true) {
        this.isLogined = true;
        this.checkAfterLogin();
      } else {
        this.resetToGuest();
      }
    });
    const checkSubMenu = ROUTES.map(sub => ({
      ...sub,
      children: (sub.children || []).filter(child => this[child.permission as keyof SidebarComponent])
    }))

    this.menuItems = checkSubMenu.filter(menuItem => this[menuItem.permission as keyof SidebarComponent]);
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this._isInPDFView = false;
      }
    });
  }
  checkPermission() {
    this.isAdmin = this.authService.isAdmin();
    this.isGrandAdmin = this.authService.isGrandAdmin();
    this.isMember = this.authService.isMember();
  }
  setUserInfo() {
    const { username, fullName, permission } = this.authService.getUserInfo();
    this.username = username;
    this.fullName = fullName;
    this.permission = ({
      GRAND_ADMIN: 'GRAND ADMIN',
      ADMIN: 'ADMIN',
      MEMBER: 'MEMBER',
    } as Record<string, string>)[permission] || 'GUEST';
  }
  resetToGuest() {
    this.setUserInfo();
    this.checkPermission();
  }

  logout() {
    this.authService.logout()
      .subscribe((res: any) => {
        this.router.navigate(['/']);
      }, err => {
        console.log(err);
      });
  }
  isMobileMenu() {
    if (window.innerWidth > 991) {
      return false;
    }
    return true;
  };

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
}
