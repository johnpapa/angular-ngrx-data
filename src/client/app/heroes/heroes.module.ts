import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { HeroesRoutingModule } from './heroes-routing.module';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { HeroSearchComponent } from './hero-search/hero-search.component';
import { SharedModule } from '../shared/shared.module';
import { HeroListComponent } from './hero-list/hero-list.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, HeroesRoutingModule, SharedModule],
  exports: [HeroSearchComponent, HeroDetailComponent],
  declarations: [HeroSearchComponent, HeroDetailComponent, HeroListComponent]
})
export class HeroesModule {}
