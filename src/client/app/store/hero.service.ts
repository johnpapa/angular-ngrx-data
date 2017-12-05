import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';
import * as HeroAction from './actions';
import { tap } from 'rxjs/operators';
import { Hero } from '../model';
import { HeroicState } from './reducers';

@Injectable()
export class HeroService {
  constructor(private store: Store<HeroicState>) {}

  // dispatchers
  deleteHero(hero: Hero) {
    this.store.dispatch(new HeroAction.DeleteHero(hero));
  }

  setFilter(filter: string) {
    this.store.dispatch(new HeroAction.SetFilter(filter));
  }

  saveHero(hero: Hero, mode: 'add' | 'update') {
    if (mode === 'add') {
      this.store.dispatch(new HeroAction.AddHero(hero));
    } else {
      this.store.dispatch(new HeroAction.UpdateHero(hero));
    }
  }

  getHeroes() {
    this.store.dispatch(new HeroAction.GetHeroes());
  }

  getFilteredHeroes(filter: string) {
    this.store.dispatch(new HeroAction.GetFilteredHeroes(filter));
  }

  /////////
  // When using these feature selectors, we need a named feature.
  // And routing helps.
  /////////
  // // selectors
  // // tslint:disable-next-line:member-ordering
  // getHeroicState = createFeatureSelector<HeroicState>('heroic');
  // // tslint:disable-next-line:member-ordering
  // getHeroState = createSelector(this.getHeroicState, (state: HeroicState) => state.heroes);
  // // tslint:disable-next-line:member-ordering
  // getAllHeroesFiltered = createSelector(
  //   this.getHeroicState,
  //   (state: HeroicState) => state.heroes.filteredHeroes
  // );

  // observable selectors
  filteredHeroes$() {
    // return this.store.select(this.getAllHeroesFiltered);
    return this.store.select(state => state.heroes.filteredHeroes);
  }

  heroes$() {
    return this.store.select(state => state.heroes.heroes);
  }

  heroState$() {
    return this.store
      .select(state => state.heroes)
      .pipe(tap(heroState => console.log('heroState', heroState)));
  }

  loading$() {
    return this.store
      .select(state => state.heroes.loading)
      .pipe(tap(loading => console.log('loading', loading)));
  }

  filter$() {
    return this.store
      .select(state => state.heroes.filter)
      .pipe(tap(filter => console.log('filter', filter)));
  }
}
