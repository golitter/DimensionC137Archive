import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";
import { Router } from '@angular/router';
import { LoginModalService } from "../login.service";
import { HttpClient } from '@angular/common/http';
import { NotificationService } from "../notification.service";

/**
 * This file contains the implementation of the `UsersComponent` component, which handles user-related functionalities:
 * - Displays user information (e.g., username).
 * - Loads and displays episode data, including the user's favorites, watched, and to-watch episodes.
 * - Provides the ability to change the password, allowing users to update their password.
 * - Supports users clicking on episodes and navigating to the detailed episode page.
 */

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
/**
 * `UsersComponent` component
 * 
 * This component is the user center in the application, providing functionality for user information, changing passwords,
 * favorite episodes, watched episodes, and to-watch episodes. It also works with the `NotificationService` to display
 * notification messages for operation results.
 */
export class UsersComponent implements OnInit {
  /**
   * Backend API address for interacting with the backend.
   * @type {string}
   */
  private apiUrl = 'http://127.0.0.1:5000';

  /**
   * Service for displaying notification messages.
   * @type {NotificationService}
   */
  public notificationService: NotificationService;

  /**
   * Simulated username representing the current user.
   * @type {string}
   */
  username = 'glm';

  /**
   * Stores the retrieved list of episodes.
   * @type {any[]}
   */
  episodes: any[] = [];

  /**
   * Current date, formatted as a local date string.
   * @type {string}
   */
  currentDate = new Date().toLocaleDateString();

  /**
   * Controls the visibility of the change password modal.
   * @type {boolean}
   */
  isChangePasswordVisible = false;

  /**
   * New password field, the password set by the user.
   * @type {string}
   */
  newPassword = '';

  /**
   * Confirm new password field, the password confirmed by the user.
   * @type {string}
   */
  confirmNewPassword = '';

  /**
   * User's favorite episodes list, containing episodes marked as favorites.
   * @type {any[]}
   */
  favoriteEpisodes: any[] = [];

  /**
   * User's watched episodes list, containing episodes the user has watched.
   * @type {any[]}
   */
  watchedEpisodes: any[] = [];

  /**
   * User's watchlist episodes list, containing episodes the user plans to watch.
   * @type {any[]}
   */
  watchlistEpisodes: any[] = [];


  /**
   * Constructor to inject required services and dependencies.
   * 
   * @param router Service used for navigation to other pages.
   * @param _notificationService Service for displaying notifications.
   * @param authService Service for user authentication.
   * @param http Angular's HTTP client, used for interaction with the backend.
   * @param loginModalService Login modal service for managing user login state.
   */
  constructor(
    private router: Router,
    public _notificationService: NotificationService,
    private authService: AuthService,
    public http: HttpClient,
    public loginModalService: LoginModalService
  ) {
    this.notificationService = _notificationService;  // Initialize notification service
  }

  /**
   * Initialize the component, load the current username, and fetch user episode data.
   * 
   * During component initialization, the username is fetched from `LoginModalService` and episode data is loaded.
   */
  ngOnInit(): void {
    console.log(this.loginModalService.uname);  // Ensure the username exists
    this.username = this.loginModalService.uname;  // Set the current username
    this.loadEpisodes();  // Load episode data
  }

  /**
   * Load episode data.
   * 
   * Fetch all episode data from the backend API, and call `loadUserEpisodes` method to load user-specific episodes (favorites, watched, to-watch).
   */
  loadEpisodes() {
    this.http.get<any[]>(`${this.apiUrl}/api/episodes`).subscribe((episodes) => {
      this.episodes = episodes.map(episode => ({ ...episode }));  // Deep copy the data
      this.loadUserEpisodes();  // Load user-specific episodes
    });
  }

  /**
   * Load user episode categories (favorites, watched, to-watch).
   * 
   * Based on the locally stored user information, retrieve the user's favorite, watched, and to-watch episode IDs.
   * Then, fill the corresponding episode arrays in the component's `favoriteEpisodes`, `watchedEpisodes`, and `watchlistEpisodes`.
   */
  loadUserEpisodes(): void {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');  // Get user information

    // Populate the corresponding episode arrays based on the user's favorite, watched, and to-watch episode IDs
    this.favoriteEpisodes = this.episodes.filter(episode => userInfo.favorites.includes(episode._id));
    this.watchedEpisodes = this.episodes.filter(episode => userInfo.watched.includes(episode._id));
    this.watchlistEpisodes = this.episodes.filter(episode => userInfo.watchlist.includes(episode._id));

    console.log(this.favoriteEpisodes);  // Print data to check if it's loaded correctly
  }

  /**
   * Open the change password modal.
   * 
   * Set `isChangePasswordVisible` to `true` to display the change password modal.
   */
  openChangePasswordModal(): void {
    this.isChangePasswordVisible = true;
  }

  /**
   * Cancel the password change operation, close the modal and clear the entered password.
   */
  cancelChangePassword(): void {
    this.isChangePasswordVisible = false;  // Hide the modal
    this.newPassword = '';  // Clear the new password input
    this.confirmNewPassword = '';  // Clear the confirm new password input
  }

  /**
   * Perform the password change operation.
   * 
   * Call the `modify` method of `AuthService` to send the new password to the backend and display a success or failure message based on the response.
   */
  changePassword(): void {
    const user = { username: this.username, password: this.newPassword };  // Create user info object
    console.log(user);
    this.isChangePasswordVisible = false;  // Hide the modal
    this.newPassword = '';  // Clear the new password input
    this.confirmNewPassword = '';  // Clear the confirm password input

    // Call the password change API
    this.authService.modify(user).subscribe(response => {
      console.log(response);
      if (response.status === "success") {
        this.notificationService.showSuccess("Modify successful.");  // Show success message
      } else {
        this.notificationService.showError(response.message);  // Show error message
      }
    });
  }

  /**
   * Navigate to the detailed page of the selected episode.
   * 
   * When the user clicks on an episode, this method navigates to the corresponding episode detail page.
   * 
   * @param episode {any} The episode object to view.
   */
  goToEpisodeDetail(episode: any): void {
    debugger;  // Debugging to check the episode data when navigating
    this.router.navigate(['/episodes', episode._id]);  // Navigate to episode detail page
  }
}
