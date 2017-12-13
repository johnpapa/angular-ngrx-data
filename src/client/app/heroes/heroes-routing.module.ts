import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HeroSearchComponent } from './hero-search/hero-search.component';

const routes: Routes = [{ path: '', pathMatch: 'full', component: HeroSearchComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeroesRoutingModule {}
