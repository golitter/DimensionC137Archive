import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { MatSnackBarModule } from '@angular/material/snack-bar'; 
import { FormsModule } from '@angular/forms'; 
import { EpisodeComponent } from './episode/episode.component';
import { UsersComponent } from './users/users.component';
import { EpisodeDetailsComponent } from './episode-details/episode-details.component';
import { AuthService } from './auth.service'; 
import { NotificationService } from './notification.service'; 
import { of } from 'rxjs';

// Mock AuthService
class MockAuthService {
  login(user: any) {
    return of({ status: 'success', token: 'mock-token', userInfo: { username: user.username } });
  }

  logout() {
    return of({ message: 'Logout successful' });
  }
}

// Mock NotificationService
class MockNotificationService {
  show(message: string) {
    console.log(message); // Or perform other mock actions such as simulating success messages
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, EpisodeComponent, UsersComponent, EpisodeDetailsComponent],
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: EpisodeComponent },
          { path: 'users', component: UsersComponent },
          { path: 'episodes/:id', component: EpisodeDetailsComponent },
        ]),
        HttpClientTestingModule, // Import HttpClientTestingModule
        MatSnackBarModule, // Import MatSnackBarModule
        FormsModule, // Import FormsModule to support ngModel
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }, // Mock AuthService
        { provide: NotificationService, useClass: MockNotificationService }, // Mock NotificationService
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router); // Get Router instance
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
  
  // Other tests...
  it('should switch between login and register tabs', () => {
    component.switchTab('register');
    expect(component.activeTab).toBe('register');
  
    component.switchTab('login');
    expect(component.activeTab).toBe('login');
  });

  it('should initialize searchQuery to an empty string', () => {
    component.ngOnInit();
    expect(component.searchQuery).toBe('');
  });

  it('should clear user data when no token or userInfo', () => {
    spyOn(component, 'clearUserData');
  
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  
    component.checkUserStatus();
  
    expect(component.clearUserData).toHaveBeenCalled();
  });

  it('should clear token and userInfo from localStorage', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userInfo', JSON.stringify({ username: 'test' }));
  
    component.clearUserData();
  
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userInfo')).toBeNull();
    expect(component.token).toBeNull();
    expect(component.userInfo).toBeNull();
  });
});
