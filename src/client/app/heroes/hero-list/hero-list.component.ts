import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AppSelectors } from '../../store/app-config';
import {
  EntityDispatchers,
  EntityDispatcher,
  EntitySelectors,
  EntitySelector
} from '../../../ngrx-data';

import { Observable } from 'rxjs/Observable';
import { pipe } from 'rxjs/util/pipe';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, skip, takeUntil, tap } from 'rxjs/operators';

import { Hero } from '../../core';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroListComponent implements OnDestroy, OnInit {
  addingHero = false;
  selectedHero: Hero = null;

  filteredHeroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;
  filter$: Observable<string>;
  dataSource$ = this.appSelectors.dataSource$();
  filter: FormControl = new FormControl();

  private onDestroy = new Subject();
  private heroDispatcher: EntityDispatcher<Hero>;
  private heroSelector: EntitySelector<Hero>;
  private filterLogic = pipe(
    takeUntil(this.onDestroy),
    tap(value => this.filter.setValue(value)),
    debounceTime(300),
    distinctUntilChanged()
  );

  constructor(
    entityDispatchers: EntityDispatchers,
    entitySelectors: EntitySelectors,
    private appSelectors: AppSelectors
  ) {
    this.heroDispatcher = entityDispatchers.getDispatcher(Hero);
    this.heroSelector = entitySelectors.getSelector(Hero);
  }

  ngOnInit() {
    this.filteredHeroes$ = this.heroSelector.filteredEntities$();
    this.loading$ = this.heroSelector.loading$();
    this.filter$ = this.heroSelector.filter$();

    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe(value => this.getHeroes());

    this.filter$.pipe(this.filterLogic).subscribe(value => this.filterHeroes());
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }

  setFilter(value: string) {
    this.heroDispatcher.setFilter(value);
    this.clear();
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.unselect();
    this.heroDispatcher.delete(hero);
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
  }

  filterHeroes() {
    this.heroDispatcher.getFiltered();
  }

  getHeroes() {
    this.heroDispatcher.getAll();
    this.unselect();
  }

  onSelect(hero: Hero) {
    this.addingHero = false;
    this.selectedHero = hero;
  }

  update(hero: Hero) {
    this.heroDispatcher.update(hero);
  }

  add(hero: Hero) {
    this.heroDispatcher.add(hero);
  }

  unselect() {
    this.addingHero = false;
    this.selectedHero = null;
  }
}
