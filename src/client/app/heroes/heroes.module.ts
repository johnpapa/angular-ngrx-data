import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { HeroesRoutingModule } from './heroes-routing.module';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { HeroesComponent } from './heroes/heroes.component';
import { HeroesV1Component } from './heroes/heroes.v1.component';
import { HeroListComponent } from './hero-list/hero-list.component';
import { HeroesService } from './heroes.service';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, HeroesRoutingModule, SharedModule],
  declarations: [HeroesComponent, HeroesV1Component, HeroDetailComponent, HeroListComponent],
  providers: [ HeroesService ]
})
export class HeroesModule {}
