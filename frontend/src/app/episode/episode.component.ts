import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { AppComponent } from '../app.component';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { LoginModalService } from '../login.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { EpisodeService } from "../../app/episode.service";
import { SearchService } from '../search.service';  // 导入服务
import { PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { NotificationService } from '../notification.service';
/**
 * @fileoverview
 * This file contains the implementation of the `EpisodeComponent`. This component is responsible for displaying and managing functionalities related to episodes, including loading episodes, sorting episodes, paginated display, searching episodes, marking as watched, and adding to the watchlist. 
 * This component integrates services like `EpisodeService`, `SearchService`, `NotificationService`, etc., to handle business logic. It also uses the `@ViewChild` decorator to reference the modal and paginator DOM elements.
 */
@Component({
  selector: 'app-episode',
  templateUrl: './episode.component.html',
  styleUrls: ['./episode.component.css'],
})
export class EpisodeComponent implements OnInit {
  /**
   * Subscription object for managing the subscription lifecycle
   */
  private subscription: Subscription;

  /**
   * API base URL
   */
  private apiUrl = 'http://127.0.0.1:5000';

  /**
   * EpisodeService service for fetching and processing episode data
   */
  private episodeService: EpisodeService;

  /**
   * SearchService service for handling search logic
   */
  private searchService: SearchService;

  /**
   * NotificationService service for displaying notification messages
   */
  private notificationService: NotificationService;

  /**
   * Stores the fetched episode data
   * @type {any[]}
   */
  episodes: any[] = [];

  /**
   * The currently selected sort option (default is "all")
   * @type {string}
   */
  selectedSortOption: string = 'all';

  /**
   * The current user's ID
   * @type {string | undefined}
   */
  userId: string | undefined;

  /**
   * Object to store the user's episode statuses, tracking which episodes have been watched or not
   * @type {object}
   */
  userEpisodesStatus = {};

  /**
   * Controls the visibility of the login modal
   * @type {boolean}
   */
  showLoginModal = false;

  /**
   * Set to store the IDs of episodes that have been watched
   * @type {Set<string>}
   */
  watchedEpisodes: Set<string> = new Set();

  /**
   * Set to store the IDs of episodes in the user's watchlist
   * @type {Set<string>}
   */
  watchlistEpisodes: Set<string> = new Set();

  /**
   * The search query bound to the search box
   * @type {string}
   */
  searchQuery: string = '';

  /**
   * The list of episodes to be displayed on the current page
   * @type {any[]}
   */
  paginatedEpisodes: any[] = [];

  /**
   * The number of episodes displayed per page
   * @type {number}
   */
  pageSize: number = 8;

  /**
   * The current page number
   * @type {number}
   */
  currentPage: number = 0;

  /**
   * Reference to the login modal for showing/hiding it
   * @type {ElementRef | undefined}
   */
  @ViewChild('loginModal') loginModal: ElementRef | undefined;

  /**
   * The currently active tab ("login" or "register")
   * @type {'login' | 'register'}
   */
  activeTab: 'login' | 'register' = 'login';

  /**
   * The password model for the login form
   * @type {any}
   */
  passwordModel: any;

  /**
   * The email model for the login form
   * @type {any}
   */
  emailModel: any;

  /**
   * The password entered by the user
   * @type {any}
   */
  password: any;

  /**
   * The email entered by the user
   * @type {any}
   */
  email: any;

  /**
   * Reference to the MatPaginator component for handling pagination
   * @type {MatPaginator | undefined}
   */
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;


  /**
   * Constructor that initializes the dependencies and services related to the `EpisodeComponent` component.
   * 
   * This constructor injects multiple services that provide functionality to the component, including episode data processing, search, user authentication, notifications, etc.
   * It also subscribes to the `loginModalService.showModal$` Observable to control the display and hiding of the login modal.
   *
   * @param {ChangeDetectorRef} cdr - Angular's `ChangeDetectorRef` service used to manually trigger view updates.
   * @param {EpisodeService} _episodeService - The service responsible for handling episode-related network requests.
   * @param {SearchService} _searchService - The service responsible for handling episode search requests.
   * @param {Router} router - Angular's Router service used for navigation to other pages.
   * @param {AuthService} authService - The service used for user authentication and user information management.
   * @param {NotificationService} _notificationService - The service used to display user notifications.
   * @param {HttpClient} http - Angular's `HttpClient` service used for making HTTP requests to the backend server.
   * @param {AppComponent} appComponent - The root component of the application, used for sharing the application's state.
   * @param {LoginModalService} loginModalService - The service used for managing the login modal's display state.
   * 
   * @see {@link EpisodeService} for operations related to episodes.
   * @see {@link SearchService} for searching episodes.
   * @see {@link NotificationService} for displaying notification messages.
   * @see {@link AuthService} for handling user authentication.
   * @see {@link LoginModalService} for controlling the login modal.
   */
  constructor(

    private cdr: ChangeDetectorRef,
    private _episodeService: EpisodeService,
    private _searchService: SearchService,
    private router: Router,
    private authService: AuthService,
    private _notificationService: NotificationService,
    public http: HttpClient,
    public appComponent: AppComponent,
    public loginModalService: LoginModalService
  ) {
    this.subscription = this.loginModalService.showModal$.subscribe((show) => {
      this.showLoginModal = show;
    });
    this.episodeService = _episodeService;
    this.searchService = _searchService;
    this.notificationService = _notificationService;
  }

  /**
   * Angular lifecycle hook method `ngOnInit`, called during the component initialization.
   * 
   * @returns {void} No return value.
   */
  ngOnInit(): void {
    this.userId = this.getUserInfo()._id;
    this.loadEpisodes();
    this.loadUserWatchedEpisodes();
    this.searchService.currentSearchQuery.subscribe(query => {
      this.searchQuery = query;
      this.searchEpisodes();  // Call search method whenever the search query is updated
    });
  }

  /**
   * Pagination change event handler
   * @param event The pagination event object
   */
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatedEpisodes();
  }

  /**
   * Reset the paginator
   */
  resetPagination(): void {
    // Reset the paginator to page 0, which is the first page
    if (this.paginator)
      this.paginator.firstPage();  // Reset the paginator to the first page
  }

  /**
   * Update the list of episodes displayed on the current page
   */
  updatePaginatedEpisodes(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEpisodes = this.episodes.slice(startIndex, endIndex);
  }


  /**
 * Check if the episode has been watched
 * @param episodeId The episode ID
 * @returns {boolean} Whether the episode has been watched
 */
  isWatched(episodeId: string): boolean {
    return this.watchedEpisodes.has(episodeId);
  }

  /**
   * Load the episodes that the user has watched
   */
  loadUserWatchedEpisodes(): void {
    // Get the watched episodes from user information
    const watchedEpisodes = this.getUserInfo().watched || [];
    // Add the watched episode IDs to the set
    this.watchedEpisodes = new Set(this.getUserInfo().watched); // Store watched episode IDs
    this.watchlistEpisodes = new Set(this.getUserInfo().watchlist); // Store watchlist episode IDs
  }

  /**
   * Check if the episode is in the watchlist
   * @param episodeId The episode ID
   * @returns {boolean} Whether the episode is in the watchlist
   */
  isInWatchlist(episodeId: string): boolean {
    return this.watchlistEpisodes.has(episodeId);
  }

  /**
   * Load a random episode
   */
  loadRandomEpisode(): void {
    this.http.get<any>(`${this.apiUrl}/api/episodes/random`).subscribe(
      (randomEpisode) => {
        this.episodes = [randomEpisode]; // Replace with a random episode
      },
      (error) => {
        this.notificationService.showError('Unable to load random episode');
      }
    );
  }

  /**
   * Load episodes based on the selected sorting option
   */
  onSortChange(): void {
    if (this.selectedSortOption === 'all') {
      this.loadEpisodes(); // If "All" is selected, load the original episode data
    } else {
      this.sortEpisodes(this.selectedSortOption); // Otherwise, load the sorted episodes based on the selected option
    }
  }

  /**
   * Sort episodes based on the criteria
   * @param criteria The sorting criteria
   */
  sortEpisodes(criteria: string): void {
    let endpoint = '';
    if (criteria === 'rating') {
      endpoint = '/api/episodes/sorted_by_rating';
    } else if (criteria === 'likes') {
      endpoint = '/api/episodes/sorted_by_likes';
    }

    this.http.get<any[]>(`${this.apiUrl}${endpoint}`).subscribe(
      (sortedEpisodes) => {
        this.episodes = sortedEpisodes.map((episode) => ({
          ...episode,
          expanded: false,
          cleanedSummary: this.stripHtml(episode.summary || ''),
        }));
        this.updatePaginatedEpisodes();
      },
      (error) => {
        this.notificationService.showError('Unable to load sorted episodes');
      }
    );
  }

  /**
   * Load all episodes
   */
  loadEpisodes(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/episodes`).subscribe((episodes) => {
      this.episodes = episodes.map((episode) => ({
        ...episode,
        expanded: false,
        cleanedSummary: this.stripHtml(episode.summary || ''),
      }));
      this.updatePaginatedEpisodes();
    });
  }
  /**
  * Toggle the expanded and collapsed state of the episode details
  * @param episode The episode
  * @param event The mouse event
  */
  toggleSummary(episode: any, event: MouseEvent): void {
    debugger;
    event.preventDefault(); // Prevent default behavior
    event.stopPropagation(); // Stop event propagation
    episode.expanded = !episode.expanded;
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  /**
   * Remove HTML tags from a string
   * @param html The HTML string
   * @returns {string} The string after removing HTML tags
   */
  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Mark the status of an episode
   * @param episodeId The episode ID  
   * @param watchlist The watchlist status
   * @param event The mouse event
   * @returns {void} No return value
   */
  markEpisodeStatus(
    episodeId: string,
    watchlist: string,
    event: MouseEvent
  ): void {
    event.stopPropagation(); // Prevent click event propagation to parent container
    const token = localStorage.getItem('token');
    if (!token) {
      this.notificationService.showMessage('Please ensure you are logged in.');
      return;
    }
    // Determine the status based on whether it's marked as "watched" or "unwatched"
    let status = '';
    if (watchlist === 'to_watch') {
      status = 'to_watch';
    } else {
      status = this.isWatched(episodeId) ? 'unwatched' : 'watched';
    }
    // Determine whether to add or remove the episode ID from the watched list
    if (status === 'watched') {
      this.watchedEpisodes.add(episodeId);
      this.watchlistEpisodes.delete(episodeId);
    } else if (status === 'unwatched') {
      this.watchedEpisodes.delete(episodeId);
    } else if (status === 'to_watch') {
      this.watchlistEpisodes.add(episodeId);
    }
    // Update the user information in the frontend cache with the watched episodes
    const userInfo = this.getUserInfo();
    userInfo.watched = Array.from(this.watchedEpisodes);
    userInfo.watchlist = Array.from(this.watchlistEpisodes);

    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    // Update the user's episode status via API
    const userId = this.getUserInfo()._id;
    this.authService
      .updateEpisodeStatus(userId, episodeId, status)
      .subscribe((response) => {
        if (response.status === 'success') {
          // Update the user's episode status
          // @ts-ignore
          this.userEpisodesStatus[episodeId] = status;
          // Update the set of watched episode IDs
          this.watchedEpisodes.add(episodeId);
        } else {
        }
      });
  }

  /**
 * Navigate to the episode detail page
 * @param episodeId The episode ID
 * @returns {void} No return value
 */
  goToEpisodeDetail(episodeId: string) {
    this.router.navigate(['/episodes', episodeId]); // Navigate to the episode detail page
  }

  /**
   * Add episode to the watchlist
   * @param episodeId The episode ID
   * @returns {void} No return value
   */
  favoriteEpisode(episodeId: string) {
    const token = this.getToken(); // Get the JWT Token

    if (token) {
      this.http
        .post(
          `${this.apiUrl}/api/episodes/${episodeId}/favorite`,
          {},
          {
            headers: { 'x-access-token': token },
          }
        )
        .subscribe((response) => {
          console.log('Episode favorited:', response);
        });
    } else {
      console.log('User is not logged in');
    }
  }

  /**
   * Get the JWT Token
   * @returns {string | null} JWT Token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Get user information
   * @returns {any} User information
   */
  getUserInfo() {
    return JSON.parse(localStorage.getItem('userInfo') || '{}');
  }

  /**
   * Search for episodes
   */
  searchEpisodes(): void {
    // console.log('Searching episodes:', this.searchQuery);
    if (this.searchQuery.trim()) {
      this.episodeService.searchEpisodes(this.searchQuery).subscribe(
        (data) => {
          this.episodes = data.map((episode: any) => ({
            ...episode,
            expanded: false, // Initially collapsed
            cleanedSummary: this.stripHtml(episode.summary || ''), // Remove HTML tags
          }));
          // console.log('Episodes found:', this.episodes);
          this.resetPagination();
          this.currentPage = 0;
          console.log(this.currentPage);
          this.updatePaginatedEpisodes();
        },
        (error) => {
          console.error('Error searching episodes:', error);
        }
      );
    } else {
      this.loadEpisodes(); // If search query is empty, load all episodes
      this.updatePaginatedEpisodes();
    }
  }

}
