import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { HeroesRoutingModule } from './heroes-routing.module';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { HeroListComponent } from './hero-list/hero-list.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, HeroesRoutingModule],
  exports: [HeroListComponent, HeroDetailComponent],
  declarations: [HeroListComponent, HeroDetailComponent]
})
export class HeroesModule {}
