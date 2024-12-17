import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoginModalService } from "./login.service";
import { AuthService } from "./auth.service";
import { Subscription } from 'rxjs';
import { Router } from "@angular/router";
import { SearchService } from "./search.service";
import { NotificationService } from "./notification.service";

/**
 * The main component of the app, responsible for controlling login, logout, registration, and navigation functions.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  /** Current user's authentication token */
  token: string | null = null;

  /** Information of the current user. */
  userInfo: any = null;

  /** The display state of the login modal window. */
  showLoginModal: boolean | undefined;

  /** The currently active tab (login or registration) */
  activeTab: 'login' | 'register' = 'login';

  /** Subscribe to the service for the modal login box status */
  private subscription: Subscription;

  /** Search for service instances */
  private searchService: SearchService;

  /** Notification service instance */
  private notificationService: NotificationService;

  /** Element reference for login modal box */
  // @ts-ignore
  @ViewChild('loginModal') loginModal: ElementRef | undefined;

  /** The current page title */
  title = 'Viewing Archive - "Rick and Morty"';

  /** The currently active submenu */
  activeSubMenu: string = '';

  /** Timer for hiding submenus */
  hideSubMenuTimer: any;

  /** Search for keywords in the box */
  searchQuery: string = '';

  /** Whether the user is logged in */
  isLoggedIn = localStorage.getItem('token') !== null;

  /**
   * A form model to store passwords entered by users.
   */
  passwordModel: any;

  /**
   * Form model to store the confirmation password entered by the user.
   */
  repasswordModel: any;

  /**
   * Form model, used to store user-entered email addresses.
   */
  emailModel: any;

  /**
   * Stores the password entered by the user for form validation or submission.
   */
  password: any;

  /**
   * Stores the email address entered by the user for form validation or submission.
   */
  email: any;

  /**
   * Stores the email address entered by the user for form validation or submission.
   */
  emailInfoModel: any;


  /**
   * Constructor to initialize the injected services.
   * @param router Angular Router service
   * @param authService Authentication service
   * @param loginModalService Login modal service
   * @param _searchService Search service
   * @param _notificationService Notification service
   */
  constructor(
    public router: Router,
    private authService: AuthService,
    public loginModalService: LoginModalService,
    private _searchService: SearchService,
    private _notificationService: NotificationService
  ) {
    this.subscription = this.loginModalService.showModal$.subscribe(show => {
      this.showLoginModal = show;
    });
    this.searchService = _searchService;
    this.notificationService = _notificationService;
  }

  /**
   * Initializes the life cycle hook, which is used to operate when the component is loaded.
   */
  ngOnInit(): void {
    this.searchQuery = '';
  }

  /**
   * Check the login status of the user and verify.
   */
  checkUserStatus(): void {
    const token = this.getToken();
    const userInfo = this.getUserInfo();

    if (token && userInfo) {
      this.authService.getUserStatus(userInfo.username).subscribe(
        response => {
          if (response.status === 'success') {
            this.isLoggedIn = true;
            this.userInfo = userInfo;
          } else {
            this.clearUserData();
          }
        },
        error => {
          this.clearUserData();
        }
      );
    } else {
      this.clearUserData();
    }
  }

  /**
   * Clear user data and local storage.
   */
  clearUserData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    this.token = null;
    this.userInfo = null;
    this.isLoggedIn = false;
  }

  /**
   * Retrieves the stored token.
   * @returns The user token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Retrieves the stored user information.
   * @returns The user information
   */
  getUserInfo() {
    return localStorage.getItem('userInfo') != 'undefined'
      ? JSON.parse(localStorage.getItem('userInfo') || '{}')
      : null;
  }


  /**
   * Displays the login mode box.
   */
  showlogin() {
    this.loginModalService.toggleModal();
  }

  /**
   * Hide the submenu.
   */
  hideSubMenu() {
    this.activeSubMenu = '';
  }

  /**
   * User logout operation.
   */
  logout() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.logout().subscribe(response => {
        this.token = null;
        this.userInfo = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });
      }, error => {
        console.error('Logout failed', error);
      });
    }
  }

  /**
   * User login operation.
   * @param email User's email
   * @param password User's password
   */
  login(email: string, password: string) {
    const user = { username: email, password: password };
    this.authService.login(user).subscribe(response => {
      console.log("tset" + response.message);
      if (response.status === "success") {
        this.token = response.token;
        this.userInfo = response.userInfo;
        localStorage.setItem('token', this.token!);
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        this.notificationService.showMessage("Login successful.");
        this.isLoggedIn = true;
        window.location.reload();
      } else {
        this.notificationService.showMessage("Login failed: " + response.message);
      }
    });
    this.loginModalService.toggleModal();
    this.email = '';
    this.password = '';
  }

  /**
   * Switches between tabs (login or registration).
   * @param tab The tab to switch to
   */
  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
  }

  /**
   * User registration operation.
   * @param email User's email
   * @param password User's password
   * @param repassword Confirmation password
   * @param emailInfo Additional email information
   */
  register(email: string, password: string, repassword: string, emailInfo: string) {
    if (password !== repassword) {
      this.notificationService.showMessage("Passwords do not match.");
      return;
    }
    const user = { username: email, password: password, repassword: repassword, emailInfo: emailInfo };
    this.authService.signIn(user).subscribe(response => {
      console.log(response.message);
      if (response.message === "User registered successfully") {
        this.notificationService.showMessage("User registered successfully.");
      } else {
        this.notificationService.showMessage("Registration failed: " + response.message);
      }
    });
    this.loginModalService.toggleModal();
    this.emailModel = '';
    this.passwordModel = '';
  }

  /**
   * Toggles the display status of the login mode box.
   */
  toggleLoginModal() {
    this.loginModalService.toggleModal();
  }

  /**
   * Toggles the display status of the login mode box.
   */
  goToHome() {
    this.searchQuery = '';
    this.onSearch();
  }

  /**
   * Perform a search operation.
   */
  onSearch(): void {
    this.searchService.changeSearchQuery(this.searchQuery);
  }
}
