import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AppSelectors } from '../../store/app-config';
import {
  EntityDispatcherService,
  EntityDispatcher,
  EntitySelectorsService,
  EntitySelectors$
} from '../../../ngrx-data';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { distinctUntilChanged, skip, takeUntil, tap } from 'rxjs/operators';

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
  private heroSelectors: EntitySelectors$<Hero>;

  constructor(
    dispatcherService: EntityDispatcherService,
    selectorsService: EntitySelectorsService,
    private appSelectors: AppSelectors,
    private toast: ToastService
  ) {
    this.heroDispatcher = dispatcherService.getDispatcher(Hero);
    this.heroSelectors = selectorsService.getSelectors$(Hero);
  }

  ngOnInit() {
    this.filteredHeroes$ = this.heroSelectors.selectFilteredEntities$;
    this.heroes$ = this.heroSelectors.selectAll$;
    this.loading$ = this.heroSelectors.selectLoading$;
    this.filter$ = this.heroSelectors.selectFilter$;

    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe(value => this.getHeroes());

    this.filter$.pipe(takeUntil(this.onDestroy)).subscribe(value => (this.filterPattern = value));

    this.heroes$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe(heroes => this.toast.openSnackBar('Fetched Heroes', 'GET'));
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  setFilter(pattern: string) {
    this.heroDispatcher.setFilter(pattern);
    this.clear();
  }

  clear() {
    this.addingHero = false;
    this.selectedHero = null;
  }

  deleteHero(hero: Hero) {
    this.unselect();
    this.heroDispatcher.delete(hero.id);
  }

  enableAddMode() {
    this.addingHero = true;
    this.selectedHero = null;
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
