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

import { Hero, ToastService } from '../../core';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSearchComponent implements OnDestroy, OnInit {
  addingHero = false;
  selectedHero: Hero = null;

  filteredHeroes$: Observable<Hero[]>;
  heroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;
  filter$: Observable<string>;
  dataSource$ = this.appSelectors.dataSource$();
  filterPattern: string;

  private onDestroy = new Subject();
  private heroDispatcher: EntityDispatcher<Hero>;
  private heroSelector: EntitySelector<Hero>;

  constructor(
    private entityDispatchers: EntityDispatchers,
    private entitySelectors: EntitySelectors,
    private appSelectors: AppSelectors,
    private toast: ToastService
  ) {
    this.heroDispatcher = entityDispatchers.getDispatcher(Hero);
    this.heroSelector = entitySelectors.getSelector(Hero);
  }

  ngOnInit() {
    this.filteredHeroes$ = this.heroSelector.filteredEntities$();
    this.heroes$ = this.heroSelector.entities$();
    this.loading$ = this.heroSelector.loading$();
    this.filter$ = this.heroSelector.filterPattern$();

    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe(value => this.getHeroes());

    this.filter$.pipe(takeUntil(this.onDestroy)).subscribe((value: string) => {
      this.filterPattern = value;
      this.filterHeroes();
    });

    this.heroes$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe(heroes => this.toast.openSnackBar('Fetched Heroes', 'GET'));
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
  }

  setFilter(pattern: string) {
    this.heroDispatcher.setFilterPattern(pattern);
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
