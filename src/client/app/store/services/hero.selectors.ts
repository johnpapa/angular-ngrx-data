import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';
import { tap } from 'rxjs/operators';

import { Hero } from '../../model';
import * as HeroAction from '../actions';
import { HeroicState } from '../reducers';

// selectors
const getHeroicState = createFeatureSelector<HeroicState>('heroic');
const getHeroState = createSelector(getHeroicState, (state: HeroicState) => state.heroes);
const getAllHeroesFiltered = createSelector(
  getHeroicState,
  (state: HeroicState) => state.heroes.filteredHeroes
);
const getAllHeroes = createSelector(getHeroicState, (state: HeroicState) => state.heroes.heroes);
const getHeroesLoading = createSelector(
  getHeroicState,
  (state: HeroicState) => state.heroes.loading
);
const getHeroesFilter = createSelector(getHeroicState, (state: HeroicState) => state.heroes.filter);

@Injectable()
export class HeroSelectors {
  constructor(private store: Store<HeroicState>) {}

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
