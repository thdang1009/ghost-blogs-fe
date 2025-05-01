import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '@services/search/search.service';
import { Post } from '@models/_index';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  searchTerm: string = '';
  searchResults$: Observable<Post[]>;
  loading$: Observable<boolean>;
  errorMessage$: Observable<string>;

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.searchResults$ = this.searchService.searchResults$;
    this.loading$ = this.searchService.loading$;
    this.errorMessage$ = this.searchService.errorMessage$;
  }

  ngOnInit(): void {
    // Get the search term from the route query params
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      if (this.searchTerm) {
        this.searchService.search(this.searchTerm);
      }
    });
  }

  // Navigate to the post detail page
  goToPost(post: Post): void {
    this.router.navigate(['/blogs', post.postReference]);
  }
}
