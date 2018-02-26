import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EntityService, EntityServiceFactory } from 'ngrx-data';

import { Observable } from 'rxjs/Observable';

import { FilterObserver } from '../../shared/filter';
import { Hero } from '../../core';

// Simpler version;
// How it could be if the app didn't toggle between local and remote API endpoints
// Instead of creating a HeroService, use the EntityServiceFactory to create it.

@Component({
  selector: 'app-heroes-v1',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesV1Component implements OnInit {
  addingHero = false;
  selectedHero: Hero;

  filterObserver: FilterObserver;
  filteredHeroes$: Observable<Hero[]>;
  heroesService: EntityService<Hero>;
  loading$: Observable<boolean>;

  constructor(entityServiceFactory: EntityServiceFactory) {
    this.heroesService = entityServiceFactory.create<Hero>('Hero');
    this.filteredHeroes$ = this.heroesService.filteredEntities$;
    this.loading$ = this.heroesService.loading$;

    /** User's filter pattern */
    this.filterObserver = {
      filter$: this.heroesService.filter$,
      setFilter: this.heroesService.setFilter.bind(this)
    };
  }

  ngOnInit() {
    this.getHeroes();
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.unselect();
    this.heroesService.delete(hero);
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
  }

  getHeroes() {
    this.heroesService.getAll();
    this.unselect();
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
  }

  update(hero: Hero) {
    this.heroesService.update(hero);
  }

  add(hero: Hero) {
    this.heroesService.add(hero);
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
