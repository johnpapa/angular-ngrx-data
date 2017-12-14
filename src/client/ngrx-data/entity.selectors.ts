import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector, Selector } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import { EntityCache, EntityClass, getEntityName } from './interfaces';
import { Dictionary, EntityCollection } from './entity-definition';
import { EntityFilterFn } from './entity-filters';

export interface EntitySelectors<T> {
  selectKeys: Selector<EntityCollection<T>, string[] | number[]> ;
  selectEntities: Selector<EntityCollection<T>, Dictionary<T>> ;
  selectAll: Selector<EntityCollection<T>, T[]>;
  selectCount: Selector<EntityCollection<T>, number> ;
  selectFilter: Selector<EntityCollection<T>, string> ;
  selectFilteredEntities: Selector<EntityCollection<T>, T[]> ;
  selectLoading: Selector<EntityCollection<T>, boolean>;

  [ selector: string ]: Selector<EntityCollection<T>, any>;
 }

 export interface EntitySelectors$<T> {
  selectKeys$: Observable<string[] | number[]> | Store<string[] | number[]>;
  selectEntities$: Observable<Dictionary<T>> | Store<Dictionary<T>>;
  selectAll$: Observable<T[]> | Store<T[]>;
  selectCount$: Observable<number> | Store<number>;
  selectFilter$: Observable<string> | Store<string>;
  selectFilteredEntities$: Observable<T[]> | Store<T[]>;
  selectLoading$: Observable<boolean> | Store<boolean>;

  [ selector: string ]: Observable<any> | Store<any>;
}

export function cachedCollectionSelector<T>(
  collectionName: string,
  cacheSelector: Selector<Object, EntityCache>) {
  // collection selector
  const c = createFeatureSelector<EntityCollection<T>>(collectionName)
  // cache -> collection selector
  return createSelector(cacheSelector, c);
}

/**
 * Create factory that creates Entity Collection Selector-Observables for a given EntityCache store
 */
export function createEntitySelectors$Factory<T>(
  collectionName: string,
  selectors: EntitySelectors<T>
) {
  /**
   * Create Entity Collection Selector-Observables for a given EntityCache  store
   * @param store - EntityCache store with the entity collections
   * @param cacheSelector - ngrx/entity Selector that selects the EntityCache in the store.
   **/
  return function entitySelectors$Factory (
    store: Store<EntityCache>,
    cacheSelector: Selector<Object, EntityCache>) {
    const cc = cachedCollectionSelector(collectionName, cacheSelector);
    const collection$ = store.select(cc);

    const selectors$: Partial<EntitySelectors$<T>> = {}
    // tslint:disable-next-line:forin
    for (const selector in selectors) {
      selectors$[selector + '$'] = collection$.select(selectors[selector])
    }
    return selectors$ as EntitySelectors$<T>;
  }
}

export type EntitySelectors$Factory<T> =
  (store: Store<EntityCache>, cacheSelector: Selector<Object, EntityCache>) => EntitySelectors$<T>

export function createEntitySelectors<T>(
  entityName: string,
  filterFn?: EntityFilterFn<T>): EntitySelectors<T> {

  // Mostly copied from `state_selectors.ts`
  const selectKeys = (c: EntityCollection<T>) => c.ids;
  const selectEntities = (c: EntityCollection<T>) => c.entities;

  const selectAll = createSelector(
    selectKeys,
    selectEntities,
    (keys: any[], entities: Dictionary<T>): any =>
    keys.map(key => entities[key] as T)
  );

  const selectCount = createSelector(selectKeys, keys => keys.length);

  // EntityCollection selectors (beyond EntityState selectors)
  const selectFilter = (c: EntityCollection<T>) => c.filter;

  const selectFilteredEntities = filterFn ?
    createSelector( selectAll, selectFilter,
      (entities: T[], filter: string): any => filterFn(entities, filter)
    ) : selectAll;

  const selectLoading = (c: EntityCollection<T>) => c.loading;

  return {
    selectKeys,
    selectEntities,
    selectAll,
    selectCount,
    selectFilter,
    selectFilteredEntities,
    selectLoading,
  };
}
