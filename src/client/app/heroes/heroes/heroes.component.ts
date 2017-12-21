import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AppSelectors } from '../../store/app-config';
import {
  EntityAction,
  EntityActions,
  EntityDispatcher,
  EntitySelectors$,
  EntityService,
  EntityServiceFactory,
  OP_ERROR,
  OP_SUCCESS
} from '../../../ngrx-data';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';

import { Hero, ToastService } from '../../core';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSearchComponent implements OnDestroy, OnInit {
  addingHero = false;
  selectedHero: Hero;

  actions$: EntityActions<Hero>;
  dataSource$: Observable<string>;
  filteredHeroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;

  heroService: EntityService<Hero>;
  private onDestroy = new Subject();

  constructor(
    entityServiceFactory: EntityServiceFactory,
    appSelectors: AppSelectors,
    private toast: ToastService
  ) {
    this.dataSource$ = appSelectors.dataSource$();
    this.heroService = entityServiceFactory.create<Hero>('Hero');
    this.filteredHeroes$ = this.heroService.filteredEntities$;
    this.loading$ = this.heroService.loading$;
  }

  ngOnInit() {
    this.dataSource$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe(value => this.getHeroes());

    this.heroService.actions$
      .filter(ea => ea.op.includes(OP_SUCCESS) || ea.op.includes(OP_ERROR))
      .until(this.onDestroy)
      .subscribe(action => this.toast.openSnackBar(`${action.entityName} action`, action.op));
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
