import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EpisodeComponent } from './episode/episode.component';
import { UsersComponent } from './users/users.component';
import {EpisodeDetailsComponent} from "./episode-details/episode-details.component";




const routes: Routes = [
  { path: '', component: EpisodeComponent },
  { path: 'users', component: UsersComponent },
  { path: 'episodes/:id', component: EpisodeDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
