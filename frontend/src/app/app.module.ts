import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EpisodeComponent } from './episode/episode.component';
import { UsersComponent } from './users/users.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { EpisodeDetailsComponent } from './episode-details/episode-details.component';
import { AuthInterceptor } from './auth.interceptor'; // Update to your interceptor path
import { MatPaginatorIntl, MatPaginatorModule } from "@angular/material/paginator";
import { paginatorIntlComponent } from './pagination/pagination.component';
// @ts-ignore
@NgModule({
  declarations: [
    AppComponent,
    EpisodeComponent,
    UsersComponent,
    EpisodeDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSnackBarModule,
    MatPaginatorModule,

  ],
  providers: [{ provide: MatPaginatorIntl, useClass: paginatorIntlComponent }, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true // Multiple interceptors are allowed
  }],
  bootstrap: [AppComponent],


})
export class AppModule {
}
