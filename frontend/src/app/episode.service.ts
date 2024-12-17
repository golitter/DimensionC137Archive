import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * EpisodeService file
 * 
 * This file contains the `EpisodeService` class, which is used to interact with the backend API.
 * The `EpisodeService` provides methods for data operations related to episodes, primarily for searching episodes based on keywords.
 */

@Injectable({
  providedIn: 'root',
})
/**
 * `EpisodeService` class
 * 
 * This service is used to interact with the backend API and provides operations related to episodes.
 * The methods in this service allow searching for episodes based on keywords and make HTTP requests to the backend.
 * 
 * The service depends on Angular's `HttpClient` to perform communication with the backend and provides the following functionality:
 * 1. Search episodes based on a keyword (`searchEpisodes` method).
 * 
 * The service instance is created through Angular's dependency injection mechanism and is provided to other components or services for use.
 */
export class EpisodeService {
  /**
   * Base path for the backend API, used to access episode-related data.
   * @constant {string} apiUrl - Base path for the backend API.
   */
  private apiUrl = 'http://localhost:5000/api/episodes'; 

  /**
   * Constructor, injecting `HttpClient` to perform HTTP requests.
   * @param http Angular's HttpClient, used to perform HTTP operations.
   */
  constructor(private http: HttpClient) {}

  /**
   * Search for episodes based on the given keyword.
   * 
   * This method sends a GET request to the backend, using the keyword as a query parameter to search for episodes.
   * 
   * @param keyword The search keyword, used to match episode titles or descriptions.
   * @returns {Observable<any>} Returns an `Observable` containing the search results.
   */
  searchEpisodes(keyword: string): Observable<any> {
    const searchUrl = `${this.apiUrl}/search`;
    return this.http.get<any>(searchUrl, { params: { q: keyword } });
  }
}
