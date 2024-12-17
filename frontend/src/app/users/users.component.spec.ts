import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from "../auth.service";
import { LoginModalService } from "../login.service";
import { NotificationService } from "../notification.service";
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Create mock services
    mockAuthService = jasmine.createSpyObj('AuthService', ['modify']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      declarations: [UsersComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: LoginModalService, useValue: { uname: 'glm' } } // Mock LoginModalService
      ]
    });

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the correct username', () => {
    expect(component.username).toBe('glm');
  });

  it('should call loadEpisodes on ngOnInit', () => {
    spyOn(component, 'loadEpisodes').and.callThrough();
    component.ngOnInit();
    expect(component.loadEpisodes).toHaveBeenCalled();
  });

  it('should update user episodes correctly based on userInfo', () => {
    // Mock episode data
    const mockEpisodes = [
      { _id: '1', name: 'Episode 1' },
      { _id: '2', name: 'Episode 2' },
    ];
    component.episodes = mockEpisodes;

    // Mock user information
    const userInfo = {
      favorites: ['1'],
      watched: ['2'],
      watchlist: ['1', '2']
    };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(userInfo));

    component.loadUserEpisodes();

    expect(component.favoriteEpisodes).toEqual([{ _id: '1', name: 'Episode 1' }]);
    expect(component.watchedEpisodes).toEqual([{ _id: '2', name: 'Episode 2' }]);
    expect(component.watchlistEpisodes).toEqual([
      { _id: '1', name: 'Episode 1' },
      { _id: '2', name: 'Episode 2' }
    ]);
  });

  it('should navigate to episode detail page', () => {
    const mockEpisode = { _id: '1', name: 'Episode 1' };
    component.goToEpisodeDetail(mockEpisode);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/episodes', mockEpisode._id]);
  });
});
