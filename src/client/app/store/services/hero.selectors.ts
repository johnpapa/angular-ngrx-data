import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';
import { tap } from 'rxjs/operators';

import { Hero } from '../../model';
import { EntityCollection, EntityCache, EntityClass } from '../ngrx-data';

// selectors
const getEntityCache = createFeatureSelector<EntityCache>('heroState');

function getAllEntities<T>(entityType: EntityClass<T>) {
  const name = entityType.name;
  return createSelector(
    getEntityCache,
    (state: EntityCache) => (state[name] as EntityCollection<T>).entities
  );
}
function getAllFilteredEntities<T>(entityType: EntityClass<T>) {
  const name = entityType.name;
  return createSelector(
    getEntityCache,
    (state: EntityCache) => (state[name] as EntityCollection<T>).filteredEntities
  );
}
function getFilter<T>(entityType: EntityClass<T>) {
  const name = entityType.name;
  return createSelector(
    getEntityCache,
    (state: EntityCache) => (state[name] as EntityCollection<T>).filter
  );
}
function getLoading<T>(entityType: EntityClass<T>) {
  const name = entityType.name;
  return createSelector(
    getEntityCache,
    (state: EntityCache) => (state[name] as EntityCollection<T>).loading
  );
}

@Injectable()
export class HeroSelectors {
  constructor(private store: Store<EntityCache>) {}

  filteredHeroes$() {
    return this.store.select(getAllFilteredEntities(Hero));
  }

  heroes$() {
    return this.store.select(getAllEntities(Hero));
  }

  loading$() {
    return this.store
      .select(getLoading(Hero))
      .pipe(tap(loading => console.log('loading', loading)));
  }

  filter$() {
    return this.store.select(getFilter(Hero)).pipe(tap(filter => console.log('filter', filter)));
  }
}
