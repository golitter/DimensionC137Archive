import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EpisodeDetailsComponent } from './episode-details.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '../notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs'; // Import `of` to return mock observables
import { FormsModule } from '@angular/forms'; // Import FormsModule

describe('EpisodeDetailsComponent', () => {
  let component: EpisodeDetailsComponent;
  let fixture: ComponentFixture<EpisodeDetailsComponent>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showMessage']);
    
    // Create a mock for paramMap and initialize get() spy
    const mockParamMap = jasmine.createSpyObj('ParamMap', ['get']);
    mockParamMap.get.and.returnValue('123'); // Mock value for paramMap.get()

    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
    mockActivatedRoute.snapshot = { paramMap: mockParamMap } as any; // Assign the mock to snapshot

    // Mock HttpClient get method to return an observable with a mock response
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['get', 'post', 'delete']);
    mockHttpClient.get.and.returnValue(of({ // Use `of` to return an observable
      _id: '123',
      name: 'Episode 1',
      rating: { average: 4.5 },
      comments: [],
      likes: 10,
      favorites: 5
    }));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        FormsModule // Import FormsModule to use ngModel
      ],
      declarations: [EpisodeDetailsComponent],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: Router, useValue: {} },
      ]
    });

    fixture = TestBed.createComponent(EpisodeDetailsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  it('should get episodeId from route parameters', () => {
    // Assert that the route parameter is '123'
    expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(component.episodeId).toBe('123');
  });
  it('should make an API request in ngOnInit', () => {
    spyOn(component, 'getEpisodeDetails');
  
    // Trigger ngOnInit manually
    component.ngOnInit();
    
    // Assert that getEpisodeDetails is called
    expect(component.getEpisodeDetails).toHaveBeenCalled();
  });
  it('should load data on ngOnInit', () => {
    spyOn(component, 'getEpisodeDetails');  // Spy on the method that loads the data
    
    component.ngOnInit();
    
    // Assert that the method was called
    expect(component.getEpisodeDetails).toHaveBeenCalled();
  });
  it('should call getEpisodeDetails method to load episode data', () => {
    spyOn(component, 'getEpisodeDetails').and.callThrough();
    
    // Manually trigger ngOnInit to test if the method is called
    component.ngOnInit();
    
    // Assert that getEpisodeDetails is called
    expect(component.getEpisodeDetails).toHaveBeenCalled();
  });
  
});
