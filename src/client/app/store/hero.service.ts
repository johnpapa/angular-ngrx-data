import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';
import * as HeroAction from './actions';
import { tap } from 'rxjs/operators';
import { Hero } from '../model';
import { HeroicState } from './reducers';

// selectors
export const getHeroicState = createFeatureSelector<HeroicState>('heroic');
export const getHeroState = createSelector(getHeroicState, (state: HeroicState) => state.heroes);
export const getAllHeroesFiltered = createSelector(
  getHeroicState,
  (state: HeroicState) => state.heroes.filteredHeroes
);
export const getAllHeroes = createSelector(
  getHeroicState,
  (state: HeroicState) => state.heroes.heroes
);
export const getHeroesLoading = createSelector(
  getHeroicState,
  (state: HeroicState) => state.heroes.loading
);
export const getHeroesFilter = createSelector(
  getHeroicState,
  (state: HeroicState) => state.heroes.filter
);

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

  // observable selectors
  filteredHeroes$() {
    return this.store.select(getAllHeroesFiltered);
    // return this.store.select(state => state.heroes.filteredHeroes);
  }

  heroes$() {
    return this.store.select(getAllHeroes);
    // return this.store.select(state => state.heroes.heroes);
  }

  heroState$() {
    return (
      this.store
        .select(getHeroState)
        // .select(state => state.heroes)
        .pipe(tap(heroState => console.log('heroState', heroState)))
    );
  }

  loading$() {
    return (
      this.store
        .select(getHeroesLoading)
        // .select(state => state.heroes.loading)
        .pipe(tap(loading => console.log('loading', loading)))
    );
  }

  filter$() {
    return (
      this.store
        .select(getHeroesFilter)
        // .select(state => state.heroes.filter)
        .pipe(tap(filter => console.log('filter', filter)))
    );
  }
}
