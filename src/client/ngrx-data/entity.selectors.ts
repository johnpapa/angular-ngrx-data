import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';

import { EntityCollection, EntityCache, EntityClass } from '../ngrx-data';

const entityCache = createFeatureSelector<EntityCache>('entityCache');

function collection(state: EntityCache, entityTypeName: string) {
  const c = state[entityTypeName];
  if (c) {
    return c;
  }
  throw new Error(`No cached collection named "${entityTypeName}")`);
}

@Injectable()
export class EntitySelectors {
  constructor(private store: Store<EntityCache>) {}

  getSelector<T>(entityClass: EntityClass<T>) {
    return new EntitySelector<T>(entityClass, this.store);
  }
}

export class EntitySelector<T> {
  readonly typeName: string;

  constructor(private entityClass: EntityClass<T>, private store: Store<EntityCache>) {
    this.typeName = entityClass.name;
  }

  filteredEntities$(): Observable<T[]> {
    return this.store.select(
      createSelector(entityCache, state => collection(state, this.typeName).filteredEntities as T[])
    );
  }

  entities$(): Observable<T[]> {
    return this.store.select(
      createSelector(entityCache, state => collection(state, this.typeName).entities as T[])
    );
  }

  loading$(): Observable<boolean> {
    return this.store
      .select(createSelector(entityCache, state => collection(state, this.typeName).loading))
      .pipe(tap(loading => console.log('loading', loading)));
  }

  filter$(): Observable<string> {
    return this.store
      .select(createSelector(entityCache, state => collection(state, this.typeName).filter))
      .pipe(tap(filter => console.log('filter', filter)));
  }
}
