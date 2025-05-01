import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, debounceTime, switchMap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Post } from '@models/_index';
import { buildQueryString, handleError, ghostLog } from '@shared/common';

const apiUrl = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private searchTermsSubject = new BehaviorSubject<string>('');
    private searchResultsSubject = new BehaviorSubject<Post[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorMessageSubject = new BehaviorSubject<string>('');

    searchResults$ = this.searchResultsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();
    errorMessage$ = this.errorMessageSubject.asObservable();

    constructor(private http: HttpClient) {
        // Initialize search suggestions/results stream when search terms change
        this.searchTermsSubject.pipe(
            debounceTime(300),
            switchMap(term => {
                // Clear any previous error messages
                this.errorMessageSubject.next('');

                // Validate search term length
                if (term && term.length < 4) {
                    this.errorMessageSubject.next('Search term must be at least 4 characters');
                    return of([]);
                }

                return this.searchPosts(term);
            })
        ).subscribe(results => {
            this.searchResultsSubject.next(results);
            this.loadingSubject.next(false);
        });
    }

    search(term: string): void {
        this.loadingSubject.next(true);

        // Validate search term length
        if (term && term.length < 4) {
            this.errorMessageSubject.next('Search term must be at least 4 characters');
            this.loadingSubject.next(false);
            this.searchResultsSubject.next([]);
            return;
        }

        this.searchTermsSubject.next(term);
    }

    searchPosts(term: string): Observable<Post[]> {
        if (!term.trim()) {
            return of([]);
        }

        const url = `${apiUrl}/v1/post/search?searchTerm=${encodeURIComponent(term)}`;
        return this.http.get<Post[]>(url).pipe(
            tap(results => ghostLog(`found ${results.length} posts matching "${term}"`)),
            catchError(handleError<Post[]>('searchPosts', []))
        );
    }

    // Method for real-time suggestions as user types
    getSuggestions(term: string): Observable<string[]> {
        if (!term.trim()) {
            return of([]);
        }

        const url = `${apiUrl}/v1/post/suggestions?searchTerm=${encodeURIComponent(term)}`;
        return this.http.get<string[]>(url).pipe(
            tap(results => ghostLog(`found ${results.length} suggestions for "${term}"`)),
            catchError(handleError<string[]>('getSuggestions', []))
        );
    }
}
