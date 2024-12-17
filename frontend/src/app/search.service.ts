// search.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * `SearchService` service
 * 
 * This service is used to manage the state of the search query and the current page number.
 * It provides a reactive interface via `BehaviorSubject`, allowing other components to subscribe
 * to changes in the search query and the current page number, and update these values when needed.
 */
@Injectable({
  providedIn: 'root' // Provides this service as a singleton in the application
})
export class SearchService {

  /**
   * Private `BehaviorSubject` that stores and manages the search query.
   * The initial value is an empty string.
   */
  private searchQuerySource = new BehaviorSubject<string>('');

  /**
   * The `Observable` for the current search query.
   * Other components can subscribe to this property to respond to changes in the search query.
   */
  currentSearchQuery = this.searchQuerySource.asObservable();

  /**
   * Private `BehaviorSubject` that stores and manages the current page number.
   * The initial value is 0, representing the first page.
   */
  private pageSource = new BehaviorSubject<number>(0);

  /**
   * The `Observable` for the current page number.
   * Other components can subscribe to this property to respond to changes in the page number.
   */
  currentPage = this.pageSource.asObservable();

  /**
   * Constructor for initializing the `SearchService`.
   * 
   * The constructor takes no parameters as dependencies are provided by Angular's dependency injection system.
   */
  constructor() { }

  /**
   * Updates the value of the search query.
   * 
   * @param query {string} The new search query to update the `currentSearchQuery`.
   */
  changeSearchQuery(query: string): void {
    this.searchQuerySource.next(query);  // Update the search query
  }

  /**
   * Updates the value of the current page number.
   * 
   * @param page {number} The new page number to update the `currentPage`.
   */
  changePage(page: number): void {
    this.pageSource.next(page);  // Update the current page number
  }
}
