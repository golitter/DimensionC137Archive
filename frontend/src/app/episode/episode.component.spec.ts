import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EpisodeComponent } from './episode.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { EpisodeService } from "../../app/episode.service";
import { NotificationService } from '../notification.service';
import { AuthService } from '../auth.service';
import { LoginModalService } from '../login.service';
import { SearchService } from '../search.service';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../app.component';

// Mock services
class MockEpisodeService {
  searchEpisodes(query: string) {
    return of([]);  // Mock returning an empty array
  }
}
class MockNotificationService {
  showMessage(msg: string) {}
  showError(msg: string) {}
}
class MockAuthService {
  updateEpisodeStatus(userId: string, episodeId: string, status: string) {
    return of({ status: 'success' });
  }
}
class MockSearchService {
  currentSearchQuery = of('');
}
class MockLoginModalService {
  showModal$ = of(false);
}
class MockAppComponent {}

describe('EpisodeComponent', () => {
  let component: EpisodeComponent;
  let fixture: ComponentFixture<EpisodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EpisodeComponent],  // Declare only the component under test
      imports: [
        HttpClientTestingModule,
        MatPaginatorModule,
        MatSnackBarModule,
        RouterTestingModule,
        FormsModule  // Add FormsModule
      ],
      providers: [
        { provide: EpisodeService, useClass: MockEpisodeService },
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: SearchService, useClass: MockSearchService },
        { provide: LoginModalService, useClass: MockLoginModalService },
        ChangeDetectorRef,
        { provide: AppComponent, useClass: MockAppComponent }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EpisodeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user watched episodes on initialization', () => {
    spyOn(component, 'loadUserWatchedEpisodes');
    component.ngOnInit();
    expect(component.loadUserWatchedEpisodes).toHaveBeenCalled();
  });

  it('should update pagination when page size or page index changes', () => {
    const event = { pageIndex: 1, pageSize: 10 } as PageEvent;
    spyOn(component, 'updatePaginatedEpisodes');
    component.onPageChange(event);
    expect(component.updatePaginatedEpisodes).toHaveBeenCalled();
  });

  it('should update episodes when search query changes', () => {
    const searchQuery = 'Test Episode';
    component.searchQuery = searchQuery;
    spyOn(component, 'searchEpisodes');
    component.searchEpisodes();
    expect(component.searchEpisodes).toHaveBeenCalled();
  });

  it('should sort episodes by rating when selected option is "rating"', () => {
    component.selectedSortOption = 'rating';
    spyOn(component, 'sortEpisodes');
    component.onSortChange();
    expect(component.sortEpisodes).toHaveBeenCalledWith('rating');
  });
});
