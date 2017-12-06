import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';
import { tap } from 'rxjs/operators';

import { Hero } from '../../model';
import * as HeroAction from '../actions';
import { EntityEntry, EntityState } from '../reducers';

// selectors
const getEntityState = createFeatureSelector<EntityState>('entityState');

// const getAllHeroes = createSelector(getEntityState, (state: EntityState) => state.heroes.entities);
// const getAllHeroes = getAllEntities(Hero);
// const getAllHeroesFiltered = getAllFilteredEntities(Hero);
// function getStuff<T>(entityType: { new (x: ...x): T }) {
// function getStuff<T>(entityType: new (...x: any[]) => T) {
function getAllEntities<T>(entityType: HeroAction.entityCtor<T>) {
  const name = entityType.name;
  return createSelector(
    getEntityState,
    (state: EntityState) => (state[name] as EntityEntry<T>).entities
  );
}
function getAllFilteredEntities<T>(entityType: HeroAction.entityCtor<T>) {
  const name = entityType.name;
  return createSelector(getEntityState, (state: EntityState) => {
    return (state[name] as EntityEntry<T>).filteredEntities;
  });
}
function getFilter<T>(entityType: HeroAction.entityCtor<T>) {
  const name = entityType.name;
  return createSelector(
    getEntityState,
    (state: EntityState) => (state[name] as EntityEntry<T>).filter
  );
}
function getLoading<T>(entityType: HeroAction.entityCtor<T>) {
  const name = entityType.name;
  return createSelector(
    getEntityState,
    (state: EntityState) => (state[name] as EntityEntry<T>).loading
  );
}

// @Injectable()
// export class Selectors {
//   constructor(private store: Store<EntityState>) {}
//   entities$() {
//     return this.store.select(getAllHeroes);
//     // return this.store.select(state => state.heroes.heroes);
//   }
// }

// const getHeroState = createSelector(getEntityState, (state: EntityState) => state.heroes);
// // const getAllHeroesFiltered = createSelector(
// //   getEntityState,
// //   (state: EntityState) => state.heroes.filteredEntities
// // );
// const getHeroesLoading = createSelector(
//   getEntityState,
//   (state: EntityState) => state.heroes.loading
// );
// const getHeroesFilter = createSelector(getEntityState, (state: EntityState) => state.heroes.filter);

@Injectable()
export class HeroSelectors {
  constructor(private store: Store<EntityState>) {}

  filteredHeroes$() {
    return this.store.select(getAllFilteredEntities(Hero));
    // return this.store.select(getAllHeroesFiltered);
    // return this.store.select(state => state.heroes.filteredHeroes);
    // return this.store.select(state => state.Hero.filteredHeroes);
  }

  heroes$() {
    return this.store.select(getAllEntities(Hero));
    // return this.store.select(getAllHeroes);
    // return this.store.select(state => state.heroes.heroes);
  }

  // heroState$() {
  //   return (
  //     this.store
  //       .select(getHeroState)
  //       // .select(state => state.heroes)
  //       .pipe(tap(heroState => console.log('heroState', heroState)))
  //   );
  // }

  loading$() {
    return (
      this.store
        .select(getLoading(Hero))
        // .select(state => state.heroes.loading)
        .pipe(tap(loading => console.log('loading', loading)))
    );
  }

  filter$() {
    return (
      this.store
        .select(getFilter(Hero))
        // .select(state => state.heroes.filter)
        .pipe(tap(filter => console.log('filter', filter)))
    );
  }
}
