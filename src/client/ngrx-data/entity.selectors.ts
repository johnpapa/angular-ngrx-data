import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector, Selector } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';

import {
  EntityCache,
  EntityClass,
  getEntityName,
  EntityCollection,
} from './interfaces';

type SelectorFn = <K>(prop: string) => Observable<K>;

@Injectable()
export class EntitySelectors {

  entityCache = createFeatureSelector<EntityCache>('entityCache');

  constructor(private store: Store<EntityCache>) {}

  getSelector<T>(entityClass: EntityClass<T> | string) {
    const typeName = typeof entityClass === 'string' ? entityClass : entityClass.name;
    const selectorFn = createSelectorFn(typeName, this.entityCache, this.store);
    return new EntitySelector<T>(selectorFn);
  }
}

export class EntitySelector<T> {

  constructor(private readonly selectorFn: SelectorFn) { }

  filteredEntities$(): Observable<T[]> {
    return this.selectorFn<T[]>('filteredEntities');
  }

  entities$(): Observable<T[]> {
    return this.selectorFn<T[]>('entities');
  }

  loading$(): Observable<boolean> {
    return this.selectorFn<boolean>('loading');
  }

  filter$(): Observable<string> {
    return this.selectorFn<string>('filter');
  }
}

export function createSelectorFn (
  typeName: string,
  cacheSelector: Selector<Object, EntityCache>,
  store: Store<EntityCache>): SelectorFn {

  return selectorFn;

  function selectorFn<K>(prop: string) {
    return store.select(createSelector(cacheSelector, state =>
      (<any> collection(state, typeName))[prop] as K));
  }

  function collection(state: EntityCache, entityTypeName: string) {
    const c = state[entityTypeName];
    if (c) { return c; }
    throw new Error(`No cached collection named "${entityTypeName}")`);
  }
}
