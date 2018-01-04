import { Injectable } from '@angular/core';
import { createFeatureSelector, createSelector, Selector, Store } from '@ngrx/store';
import { Dictionary } from './ngrx-entity-models';

import { Observable } from 'rxjs/Observable';

import { EntityCache, ENTITY_CACHE_NAME } from './interfaces';
import { EntityCollection } from './entity-definition';
import { EntityFilterFn } from './entity-filters';
import { EntityMetadata } from './entity-metadata';

/**
 * The selector functions for entity collection members.
 */
export interface EntitySelectors<T> {
  selectKeys: Selector<EntityCollection<T>, string[] | number[]>;
  selectEntities: Selector<EntityCollection<T>, Dictionary<T>>;
  selectAll: Selector<EntityCollection<T>, T[]>;
  selectCount: Selector<EntityCollection<T>, number>;
  selectFilter: Selector<EntityCollection<T>, string>;
  selectFilteredEntities: Selector<EntityCollection<T>, T[]>;
  selectLoading: Selector<EntityCollection<T>, boolean>;
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
}

/**
 * Creates the selector for the path from the EntityCache through the Collection
 * @param collectionName - which is also the entity name
 * @param cacheSelector - selects the EntityCache from the store.
 * @param initialState - initial state of the collection,
 * used if the collection is undefined when the selector is invoked
 * (as happens with time-travel debugging).
 */
export function createCachedCollectionSelector<T, C extends EntityCollection<T> = EntityCollection<T>> (
  collectionName: string,
  cacheSelector: Selector<Object, EntityCache>,
  initialState?: C
): Selector<Object, C> {
  initialState = initialState || createEmptyEntityCollection<T, C>();
  const getCollection = (cache: EntityCache) => <C> cache[collectionName] || initialState;
  return createSelector(cacheSelector, getCollection);
}

function createEmptyEntityCollection<T, C extends EntityCollection<T> = EntityCollection<T>>(): C {
  return <C> {
    ids: [],
    entities: {},
    filter: undefined,
    loading: false
  };
}

/**
 * Creates the ngrx/entity selectors or selector functions for an entity collection
 * that an {EntitySelectors$Factory} turns into selectors$.
 * @param entityName - name of the entity for this collection
 * @param filterFn - the collection's {EntityFilterFn}.
 */
export function createEntitySelectors<
  T, S extends EntitySelectors<T> = EntitySelectors<T>>(
  metadata: EntityMetadata<T>
): S {
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

  const filterFn = metadata.filterFn;
  const selectFilteredEntities = filterFn
    ? createSelector(selectAll, selectFilter, (entities: T[], pattern: any): T[] =>
        filterFn(entities, pattern)
      )
    : selectAll;

  const selectLoading = (c: EntityCollection<T>) => c.loading;

  // Create selectors for each `additionalCollectionState` property.
  const extra = metadata.additionalCollectionState || {};
  const extraSelectors: { [name: string]: Selector<any, any> } = {};
  Object.keys(extra).forEach(k =>
    extraSelectors['select' + k[0].toUpperCase() + k.slice(1)] =
      (c: any) => c[k]);

  return <S> <any> {
    selectKeys,
    selectEntities,
    selectAll,
    selectCount,
    selectFilter,
    selectFilteredEntities,
    selectLoading,
    ...extraSelectors
  };
}

/**
 * Creates an entity collection's selectors$ observables for a given EntityCache store.
 * `selectors$` are observable selectors of the cached entity collection.
 * @param entityName - is also the name of the collection.
 * @param store - Ngrx store at runtime. Often the application's root store which holds the entity cache.
 * @param cacheSelector - an ngrx/entity Selector that selects the entity cache from that store
 * @param selectors - selector functions for this collection.
 * @param defaultCollectionState - default state of the collection,
 * if the collection is undefined when the selector is invoked
 * (as happens with time-travel debugging).
 **/
export function createEntitySelectors$<
  T,
  S$ extends EntitySelectors$<T> = EntitySelectors$<T>,
  C extends EntityCollection<T> = EntityCollection<T>
  >(
  entityName: string,
  store: Store<any>,
  cacheSelector: Selector<Object, EntityCache>,
  selectors: EntitySelectors<T>,
  defaultCollectionState?: C
): S$ {
  defaultCollectionState = defaultCollectionState || createEmptyEntityCollection<T, C>();
  const cc = createCachedCollectionSelector(entityName, cacheSelector, defaultCollectionState);
  const collection$ = store.select(cc);

  const selectors$: Partial<EntitySelectors$<T>> = {};

  Object.keys(selectors).forEach(
    name => (<any>selectors$)[name + '$'] = collection$.select((<any>selectors)[name])
  );
  return selectors$ as S$;
}

