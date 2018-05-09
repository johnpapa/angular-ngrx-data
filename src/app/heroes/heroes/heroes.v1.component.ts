import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EntityCollectionService, EntityServices } from 'ngrx-data';

import { Observable } from 'rxjs';

import { FilterObserver } from '../../shared/filter';
import { Hero, MasterDetailCommands } from '../../core';

// Simpler version;
// How it could be if the app didn't toggle between local and remote API endpoints

@Component({
  selector: 'app-heroes-v1',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesV1Component implements MasterDetailCommands<Hero>, OnInit {
  commands = this;
  selectedHero: Hero;

  filterObserver: FilterObserver;
  filteredHeroes$: Observable<Hero[]>;
  heroesService: EntityCollectionService<Hero>;
  loading$: Observable<boolean>;

  constructor(entityServices: EntityServices) {
    this.heroesService = entityServices.getEntityCollectionService('Hero');
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

  close() {
    this.selectedHero = null;
  }

  enableAddMode() {
    this.selectedHero = <any>{};
  }

  getHeroes() {
    this.heroesService.getAll();
    this.close();
  }

  add(hero: Hero) {
    this.heroesService.add(hero);
  }

  delete(hero: Hero) {
    this.close();
    this.heroesService.delete(hero);
  }

  select(hero: Hero) {
    this.selectedHero = hero;
  }

  update(hero: Hero) {
    this.heroesService.update(hero);
  }
}
