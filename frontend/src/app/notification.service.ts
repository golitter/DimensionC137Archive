import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * `NotificationService` service
 * 
 * This service provides common notification message display functionalities, using Angular Material's `MatSnackBar` component to display simple messages.
 * It encapsulates common types of messages, such as general information, error messages, and success messages, simplifying the process of displaying messages.
 */
@Injectable({
  providedIn: 'root' // Provides this service as a singleton in the application
})
export class NotificationService {

  /**
   * Constructor, injecting `MatSnackBar` to use the Snackbar functionality provided by Angular Material.
   * 
   * @param snackBar The injected `MatSnackBar` instance used to display messages.
   */
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Displays a message in a snackbar.
   * 
   * This is a general method that allows customization of the message content, button text, and display duration.
   * By default, the snackbar will automatically disappear after 5 seconds and display a "Close" button.
   * 
   * @param message {string} The message content to display.
   * @param action {string} The text for the action button, default is 'Close'.
   * @param duration {number} The duration (in milliseconds) for which the snackbar is displayed, default is 5000 ms (5 seconds).
   */
  showMessage(message: string, action: string = 'Close', duration: number = 5000): void {
    this.snackBar.open(message, action, {
      duration: duration,
      verticalPosition: 'top',  // Display at the top
      horizontalPosition: 'center',  // Centered display
    });
  }

  /**
   * Displays an error message in a snackbar.
   * 
   * This method is a wrapper for `showMessage`, specifically used to display error messages, with a default duration of 7 seconds.
   * 
   * @param message {string} The error message content.
   */
  showError(message: string): void {
    this.showMessage(message, 'Close', 7000);  // Error message lasts for 7 seconds
  }

  /**
   * Displays a success message in a snackbar.
   * 
   * This method is a wrapper for `showMessage`, specifically used to display success messages, with a default duration of 3 seconds.
   * 
   * @param message {string} The success message content.
   */
  showSuccess(message: string): void {
    this.showMessage(message, 'Close', 3000);  // Success message lasts for 3 seconds
  }
}
