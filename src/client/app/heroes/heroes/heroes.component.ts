import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AppSelectors } from '../../store/app-config';
import { EntityService, EntityServiceFactory } from '../../../ngrx-data';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';

import { Hero } from '../../core';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSearchComponent implements OnDestroy, OnInit {
  private onDestroy = new Subject();
  addingHero = false;
  selectedHero: Hero;
  heroService: EntityService<Hero>;

  dataSource$: Observable<string>;
  filteredHeroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;

  constructor(
    appSelectors: AppSelectors,
    entityServiceFactory: EntityServiceFactory
  ) {
    this.dataSource$ = appSelectors.dataSource$();
    this.heroService = entityServiceFactory.create<Hero>('Hero');
    this.filteredHeroes$ = this.heroService.filteredEntities$;
    this.loading$ = this.heroService.loading$;
  }

  ngOnInit() {
    this.dataSource$
    .pipe(takeUntil(this.onDestroy))
    .subscribe(value => this.getHeroes());
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.unselect();
    this.heroService.delete(hero.id);
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
  }

  getHeroes() {
    this.heroService.getAll();
    this.unselect();
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
  }

  update(hero: Hero) {
    this.heroService.update(hero);
  }

  add(hero: Hero) {
    this.heroService.add(hero);
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
