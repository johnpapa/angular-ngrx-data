import { Injectable } from '@angular/core';
import { Store, createFeatureSelector, createSelector, Selector } from '@ngrx/store';
import { Dictionary } from './ngrx-entity-models';

import { Observable } from 'rxjs/Observable';

import { EntityCache, ENTITY_CACHE_NAME, entityName } from './interfaces';
import { EntityCollection } from './entity-definition';
import { EntityFilterFn } from './entity-filters';

/**
 * The selector functions for entity collection members.
 * Most consumers will want the {EntitySelectors$} but
 * some may need to build custom combination selectors from this set.
 */
export interface EntitySelectors<T> {
  selectKeys: Selector<EntityCollection<T>, string[] | number[]>;
  selectEntities: Selector<EntityCollection<T>, Dictionary<T>>;
  selectAll: Selector<EntityCollection<T>, T[]>;
  selectCount: Selector<EntityCollection<T>, number>;
  selectFilter: Selector<EntityCollection<T>, string>;
  selectFilteredEntities: Selector<EntityCollection<T>, T[]>;
  selectLoading: Selector<EntityCollection<T>, boolean>;

  [selector: string]: Selector<EntityCollection<T>, any>;
}

/**
 * The entity collection Observables that consumers (e.g., components) subscribe to.
 */
export interface EntitySelectors$<T> {
  selectKeys$: Observable<string[] | number[]> | Store<string[] | number[]>;
  selectEntities$: Observable<Dictionary<T>> | Store<Dictionary<T>>;
  selectAll$: Observable<T[]> | Store<T[]>;
  selectCount$: Observable<number> | Store<number>;
  selectFilter$: Observable<string> | Store<string>;
  selectFilteredEntities$: Observable<T[]> | Store<T[]>;
  selectLoading$: Observable<boolean> | Store<boolean>;

  [selector: string]: Observable<any> | Store<any>;
}

/**
 * Creates the selector for the path from the EntityCache through the Collection
 * @param collectionName - which is also the entity name
 * @param cacheSelector - selects the EntityCache from the store.
 * @param initialState - initial state of the collection,
 * used if the collection is undefined when the selector is invoked
 * (as happens with time-travel debugging).
 */
export function createCachedCollectionSelector<T>(
  collectionName: string,
  cacheSelector: Selector<Object, EntityCache>,
  initialState: {}
) {
  const getCollection = (cache: EntityCache) => cache[collectionName] || initialState;
  return createSelector(cacheSelector, getCollection);
}

export const defaultEntityCacheSelector = createFeatureSelector<EntityCache>(ENTITY_CACHE_NAME);

/**
 * Creates an entity collection's selectors$ for a given EntityCache store.
 * `selectors$` are observable selectors of the cached entity collection.
 * @param entityName - is also the name of the collection.
 * @param cacheSelector - an ngrx/entity Selector that selects
 * @param initialState - initial state of the collection,
 * used if the collection is undefined when the selector is invoked
 * (as happens with time-travel debugging).
 * @param selectors - selector functions for this collection.
 * @param store - EntityCache store with the entity collections.
 **/
export function createEntitySelectors$<T>(
  entityName: string,
  cacheSelector: Selector<Object, EntityCache>,
  initialState: any,
  selectors: EntitySelectors<T>,
  store: Store<EntityCache>
) {
  const cc = createCachedCollectionSelector(entityName, cacheSelector, initialState);
  const collection$ = store.select(cc);

  const selectors$: Partial<EntitySelectors$<T>> = {};

  Object.keys(selectors).forEach(
    selector => (selectors$[selector + '$'] = collection$.select(selectors[selector]))
  );
  return selectors$ as EntitySelectors$<T>;
}

/**
 * Creates the ngrx/entity selectors or selector functions for an entity collection
 * that an {EntitySelectors$Factory} turns into selectors$.
 * @param entityName - name of the entity for this collection
 * @param filterFn - the collection's {EntityFilterFn}.
 */
export function createEntitySelectors<T>(
  entityName: string,
  filterFn?: EntityFilterFn<T>
): EntitySelectors<T> {
  // Mostly copied from `@ngrx/entity/state_selectors.ts`
  const selectKeys = (c: EntityCollection<T>) => c.ids;
  const selectEntities = (c: EntityCollection<T>) => c.entities;

  const selectAll = createSelector(
    selectKeys,
    selectEntities,
    (keys: any[], entities: Dictionary<T>): any => keys.map(key => entities[key] as T)
  );

  const selectCount = createSelector(selectKeys, keys => keys.length);

  // EntityCollection selectors that go beyond the ngrx/entity/EntityState selectors
  const selectFilter = (c: EntityCollection<T>) => c.filter;

  const selectFilteredEntities = filterFn
    ? createSelector(selectAll, selectFilter, (entities: T[], pattern: any): T[] =>
        filterFn(entities, pattern)
      )
    : selectAll;

  const selectLoading = (c: EntityCollection<T>) => c.loading;

  return {
    selectKeys,
    selectEntities,
    selectAll,
    selectCount,
    selectFilter,
    selectFilteredEntities,
    selectLoading
  };
}
