import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { FilterObserver } from '../../shared/filter';
import { Hero, MasterDetailCommands } from '../../core';
import { HeroesService } from '../heroes.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesComponent implements MasterDetailCommands<Hero>, OnInit, OnDestroy {
  commands = this;
  selectedHero: Hero;
  subscription: Subscription;

  filterObserver: FilterObserver;
  filteredHeroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;

  constructor(public heroesService: HeroesService) {
    this.filterObserver = heroesService.filterObserver;
    this.filteredHeroes$ = this.heroesService.filteredEntities$;
    this.loading$ = this.heroesService.loading$;
  }

  ngOnInit() {
    this.subscription = this.heroesService.getAllOnDataSourceChange.subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  close() {
    this.selectedHero = null;
  }

  enableAddMode() {
    this.selectedHero = <any> {};
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
