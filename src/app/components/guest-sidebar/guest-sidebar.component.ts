import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@services/_index';
import { checkIsInPDFView } from '@shared/common';
import { SearchService } from '@services/search/search.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AlertService } from '@components/alert/alert.service';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  // permission: string;
}
export const ROUTES: RouteInfo[] = [
  // {
  //   path: 'apps/json-beautifier',
  //   title: 'JSON Beautifier',
  //   icon: 'code',
  //   class: ''
  // },
  // {
  //   path: 'apps/json-excel',
  //   title: 'JSON Excel',
  //   icon: 'code',
  //   class: ''
  // },
  // {
  //   path: 'apps/text-diff',
  //   title: 'Text Diff',
  //   icon: 'description',
  //   class: ''
  // },
  // {
  //   path: 'admin/dashboard',
  //   title: 'Amin',
  //   icon: 'dashboard',
  //   class: ''
  // }
];

@Component({
  selector: 'app-guest-sidebar',
  templateUrl: './guest-sidebar.component.html',
})
export class GuestSidebarComponent implements OnInit {

  _isInPDFView = false;
  menuItems: any[] = [];
  isLogined = false;
  stringToSearch = '';
  isMember = false;
  showSuggestions: boolean = false;
  searchSuggestions: string[] = [];
  private searchTerms = new Subject<string>();

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService, private searchService: SearchService, private alertService: AlertService) {
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

    // Setup search term debounce for suggestions
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      if (term.length > 2) {
        this.getSuggestions(term);
      } else {
        this.searchSuggestions = [];
        this.showSuggestions = false;
      }
    });

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this._isInPDFView = checkIsInPDFView(event.url);
      }
    });
  }

  search() {
    // Validate search term length
    if (this.stringToSearch && this.stringToSearch.trim().length < 4) {
      this.alertService.warn('Search term must be at least 4 characters');
      return;
    }

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
      // Navigate to search results page with the search term
      if (this.stringToSearch && this.stringToSearch.trim() !== '') {
        this.router.navigate(['/search'], { queryParams: { q: this.stringToSearch } });
        this.showSuggestions = false;
      }
    }
  }

  // Handle input changes for search suggestions
  onSearchInput(term: string) {
    if (term.length > 2) {
      this.searchTerms.next(term);
    } else {
      this.searchSuggestions = [];
      this.showSuggestions = false;
    }
  }

  // Get search suggestions
  getSuggestions(term: string) {
    this.searchService.getSuggestions(term).subscribe(
      suggestions => {
        this.searchSuggestions = suggestions;
        this.showSuggestions = suggestions.length > 0;
      },
      error => {
        console.error('Error fetching suggestions:', error);
        this.searchSuggestions = [];
        this.showSuggestions = false;
      }
    );
  }

  // Select a suggestion
  selectSuggestion(suggestion: string) {
    this.stringToSearch = suggestion;
    this.showSuggestions = false;
    this.search();
  }

  isMobileMenu() {
    if (window.innerWidth > 991) {
      return false;
    }
    return true;
  };
}
