import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../notification.service';
/**
 * This component displays the episode details and provides functionalities for user interactions with the episode, such as liking, favoriting, commenting, and rating.
 * It also supports browsing to the previous and next episodes.
 */
@Component({
  selector: 'app-episode-details',
  templateUrl: './episode-details.component.html',
  styleUrls: ['./episode-details.component.css'],
})
export class EpisodeDetailsComponent implements OnInit {
  /**
   * Whether it is loading
   * @param isLoading Whether it is loading
   */
  isLoading(isLoading: any) {
    throw new Error('Method not implemented.');
  }
  /**
   * Base URL for backend API
   * @private
   */
  private apiUrl = 'http://127.0.0.1:5000/api';

  /**
   * Service for displaying notification messages
   * @private
   */
  private notificationService: NotificationService;

  /**
   * Current episode ID
   */
  episodeId!: string;

  /**
   * Details of the current episode
   */
  episode: any = {};

  /**
   * Whether it is liked
   */
  isLiked = false;

  /**
   * Whether it is favorited
   */
  isFavorite = false;

  /**
   * Content of the new comment
   */
  newComment = '';

  /**
   * Average rating
   */
  averageRating = 0;

  /**
   * User rating
   */
  userRating = 10;

  /**
   * Array representing ten stars for the rating
   */
  stars = Array(10).fill(0);

  /**
     * Constructor to inject HttpClient, ActivatedRoute, and NotificationService
     * 
     * @param http HttpClient instance for making HTTP requests
     * @param route ActivatedRoute instance for accessing route parameters
     * @param _notificationService NotificationService instance for displaying notification messages
     */
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private _notificationService: NotificationService
  ) {
    this.notificationService = _notificationService;
  }

  /**
    * Logic to be executed when the component initializes
    */
  ngOnInit(): void {
    this.episodeId = this.route.snapshot.paramMap.get('id')!;
    this.getEpisodeDetails(this.episodeId);
  }

  /**
     * Retrieve user information from local storage
     * 
     * @returns {object} User information object
     */
  getUserInfo() {
    return JSON.parse(localStorage.getItem('userInfo') || '{}');
  }

  /**
     * Fetch episode details
     * 
     * @param id Episode ID
     */
  getEpisodeDetails(id: string): void {
    this.http.get<any>(`${this.apiUrl}/episodes/${id}`).subscribe(
      (episode) => {
        this.episode = episode;
        this.episode.id = episode._id;
        this.episodeId = episode._id;
        this.updateNavigationStates();

        this.averageRating = episode.rating.average;
      },
      (error) => console.error('Error fetching episode details:', error)
    );
  }

  /**
    * Update the like and favorite states
    */
  updateNavigationStates(): void {
    this.isLiked =
      this.getUserInfo().likedEpisodes?.includes(this.episode.id) || false;
    this.isFavorite =
      this.getUserInfo().favorites?.includes(this.episode.id) || false;
  }

  /**
  * Toggle the like status of the episode
  */
  toggleLike(): void {
    this.http
      .post(`${this.apiUrl}/episodes/${this.episode.id}/like`, {})
      .subscribe(
        () => {
          this.isLiked = !this.isLiked;
          this.episode.likes += this.isLiked ? 1 : -1;
          const userInfo = this.getUserInfo();
          if (this.isLiked) {
            userInfo.likedEpisodes = [
              ...(userInfo.likedEpisodes || []),
              this.episode.id,
            ];
          } else {
            userInfo.likedEpisodes = (userInfo.likedEpisodes || []).filter(
              (id: string) => id !== this.episode.id
            );
          }
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        },
        (error) => {
          console.error('Error toggling like:', error);
        }
      );
  }

  /**
  * Toggle the favorite status of the episode
  */
  toggleFavorite(): void {
    this.http
      .post(`${this.apiUrl}/episodes/${this.episode.id}/favorite`, {})
      .subscribe(
        () => {
          this.isFavorite = !this.isFavorite;
          const userInfo = this.getUserInfo();
          if (!userInfo) {
            this.notificationService.showMessage('Please ensure you are logged in.');
            return;
          }
          if (this.isFavorite) {
            userInfo.favorites = [
              ...(userInfo.favorites || []),
              this.episode.id,
            ];
          } else {
            userInfo.favorites = (userInfo.favorites || []).filter(
              (id: string) => id !== this.episode.id
            );
          }
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        },
        (error) => {
          console.error('Error toggling favorite:', error);
          if (error.status === 401) {
            this.notificationService.showMessage('Please ensure you are logged in.');
          }
        }
      );
  }

  /**
  * Get the details of the previous episode
  */
  getPreviousEpisode(): void {
    const { season, number } = this.episode;
    this.http
      .get<any>(`${this.apiUrl}/episodes/${season}/${number}/prev`)
      .subscribe(
        (response) => {
          if (response.previous_episode) {
            this.episode = response.previous_episode;
            this.updateNavigationStates();
            this.getEpisodeDetails(this.episode._id);
          }
        },
        (error) => console.error('Error fetching previous episode:', error)
      );
  }
  /**
   * Get the details of the next episode
   */
  getNextEpisode(): void {
    const { season, number } = this.episode;
    this.http
      .get<any>(`${this.apiUrl}/episodes/${season}/${number}/next`)
      .subscribe(
        (response) => {
          if (response.next_episode) {
            this.episode = response.next_episode;
            this.updateNavigationStates();
            this.getEpisodeDetails(this.episode._id);
          }
        },
        (error) => console.error('Error fetching next episode:', error)
      );
  }

  /**
  * Get a random episode's details
  */
  getRandomEpisode(): void {
    this.http.get<any>(`${this.apiUrl}/episodes/random`).subscribe(
      (response) => {
        if (response) {
          this.episode = response;
          this.updateNavigationStates();
          this.getEpisodeDetails(this.episode._id);
        }
      },
      (error) => console.error('Error fetching random episode:', error)
    );
  }
  /**
   * Submit a comment
   */
  submitComment(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.notificationService.showMessage('Please ensure you are logged in.');
      return;
    }
    if (this.newComment.trim()) {
      const payload = { comment: this.newComment };
      this.http
        .post(`${this.apiUrl}/episodes/${this.episode.id}/comments`, payload)
        .subscribe(
          () => {
            this.getEpisodeDetails(this.episode.id);
            this.newComment = '';
          },
          (error) => console.error('Error submitting comment:', error)
        );
    } else {
      this.notificationService.showMessage('Please enter a comment.');
    }
  }
  /**
   * Get the average rating
   */
  getAverageRating(): void {
    console.log(this.episode);
  }

  /**
   * User rates the episode
   * @param rating The rating
   */
  rateEpisode(rating: number): void {
    const payload = { rating };
    this.http
      .post(`${this.apiUrl}/episodes/${this.episodeId}/rate`, payload)
      .subscribe(
        () => {
          this.userRating = rating;
          this.getAverageRating(); // Update the average rating
        },
        (error) => console.error('Error submitting rating:', error)
      );
  }

  /**
    * Like a comment
    * 
    * @param $event Triggering event
    * @param commentId Comment's ID
    */
  likeComment($event: MouseEvent, commentId: string): void {
    $event.preventDefault();
    this.getEpisodeDetails(this.episodeId);
    this.http
      .post(
        `${this.apiUrl}/episodes/${this.episode.id}/comments/${commentId}/like`,
        {}
      )
      .subscribe(
        () => {
          const comment = this.episode.comments.find(
            (c: any) => c._id === commentId
          );
          if (comment) {
            comment.likes += 1;
          }
        },
        (error) => {
          console.error('Error liking comment:', error);
          if (error.status === 401) {
            this.notificationService.showMessage('Please ensure you are logged in.');
          } else if (error.status === 403) {
            this.notificationService.showMessage('No permission');
          }
        }
      );
  }
  /**
     * Delete a comment
     * 
     * @param $event Triggering event
     * @param commentId Comment's ID
     */
  deleteComment($event: MouseEvent, commentId: string): void {
    $event.preventDefault();
    this.getEpisodeDetails(this.episode.id);
    this.http
      .delete(
        `${this.apiUrl}/episodes/${this.episode.id}/comments/${commentId}`
      )
      .subscribe(
        () => {
          this.episode.comments = this.episode.comments.filter(
            (c: any) => c._id !== commentId
          );
        },
        (error) => {
          console.error('Error deleting comment:', error);
          if (error.status === 401) {
            this.notificationService.showMessage('Please ensure you are logged in.');
          } else if (error.status === 403) {
            this.notificationService.showMessage('No permission');
          }
        }
      );
  }
}
