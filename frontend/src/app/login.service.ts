import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * `LoginModalService` service
 * 
 * This service is used to manage the display state of the login modal and store the username.
 * It provides a reactive interface via `BehaviorSubject`, allowing other components to subscribe to changes in the modal's display state
 * and switch that state when needed.
 * Additionally, it offers a getter and setter for accessing and modifying the username.
 */
@Injectable({
  providedIn: 'root' // Provides this service as a singleton in the application
})
export class LoginModalService {
  
  /**
   * `BehaviorSubject` used to store and manage the display state of the login modal.
   * The initial value is `false`, indicating that the modal is hidden by default.
   */
  private showModalSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable for the login modal's display state.
   * Other components can subscribe to this property to respond to changes in the modal's state.
   */
  showModal$ = this.showModalSubject.asObservable();

  /**
   * Toggles the display state of the login modal.
   * If the current state is showing, it will be switched to hidden; otherwise, it will be shown.
   */
  toggleModal(): void {
    const currentValue = this.showModalSubject.getValue();
    this.showModalSubject.next(!currentValue);  // Toggle modal state
  }

  /**
   * Private variable `_uname` to store the username.
   * The username is accessed and modified through getter and setter methods.
   */
  private _uname: string = '';

  /**
   * Gets the username.
   * @returns {string} The currently stored username.
   */
  get uname(): string {
    return this._uname;
  }

  /**
   * Sets the username.
   * @param value {string} The new username value.
   */
  set uname(value: string) {
    this._uname = value;
  }
}
