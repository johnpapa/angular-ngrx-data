import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { HeroesRoutingModule } from './heroes-routing.module';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { HeroListComponent } from './hero-list/hero-list.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, HeroesRoutingModule, SharedModule],
  exports: [HeroListComponent, HeroDetailComponent],
  declarations: [HeroListComponent, HeroDetailComponent]
})
export class HeroesModule {}
