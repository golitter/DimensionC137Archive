import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { NotificationService } from './notification.service';

/**
 * This file contains the `AuthService` class, which is used for interacting with the backend API.
 * The service provides multiple methods for user authentication, registration, login, password modification, 
 * as well as fetching and updating episode-related data.
 */
@Injectable({
  providedIn: 'root',
})
/**
 * AuthService Class
 * Provides services for user authentication and interaction with the backend API,
 * including registration, login, logout, and operations related to users and episodes.
 */
export class AuthService {
  /**
   * Base URL of the backend API.
   * @private
   * @type {string}
   */
  private apiUrl = 'http://127.0.0.1:5000/api';
  /**
   * Constructor injecting `HttpClient` for making HTTP requests.
   * @param http Angular's `HttpClient` for executing HTTP operations.
   */
  constructor(private http: HttpClient) {}

  /**
   * User registration.
   * @param user Object containing the username and password.
   * @returns An Observable containing the response from the registration request.
   */
  signIn(user: { password: string; username: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  /**
   * User login.
   * Sends username and password using Basic Auth.
   * @param user Object containing the username and password.
   * @returns An Observable containing the response from the login request.
   */
  login(user: { password: string; username: string }): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/login`, {
      headers: {
        Authorization: 'Basic ' + btoa(user.username + ':' + user.password),
      },
    }).pipe(
      catchError((error:any) => {
        console.error('Login failed', error);
        return error;
      })
    )
  }

  /**
   * User logout.
   * @returns An Observable containing the response from the logout request.
   */
  logout(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/logout`);
  }

  /**
   * Modify user information.
   * @param user Object containing the username and password.
   * @returns An Observable containing the response from the modification request.
   */
  modify(user: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/modify`, user);
  }

  /**
   * Fetch all episode information.
   * @returns An Observable containing the response with a list of episodes.
   */
  getEpisodes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/episodes`);
  }

  /**
   * Update the status of an episode.
   * @param userId User ID.
   * @param episodeId Episode ID.
   * @param status The status to update (e.g., watched, not watched).
   * @returns An Observable containing the response from the status update request.
   */
  updateEpisodeStatus(
    userId: string,
    episodeId: string,
    status: string
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/episodes/${episodeId}/status`, {
      status: status,
    });
  }

  /**
   * Fetch user status.
   * @param username Username.
   * @returns An Observable containing the response with the user's status.
   */
  getUserStatus(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/status/${username}`);
  }
}
