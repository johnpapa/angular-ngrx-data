import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';

import {
  EntityCache,
  EntityClass,
  getEntityName,
} from './interfaces';

const entityCache = createFeatureSelector<EntityCache>('entityCache');

function collection(cache: EntityCache, entityTypeName: string) {
  const c = cache[entityTypeName];
  if (c) {
    return c;
  }
  throw new Error(`No cached collection named "${entityTypeName}")`);
}

@Injectable()
export class EntitySelectors {
  private selectors: { [name: string]: EntitySelector<any> } = {};

  constructor(private store: Store<EntityCache>) {}

  /**
   * Get (or create) a selector class for entity type
   * @param entityClass - the name of the class or the class itself
   *
   * Examples:
   *   getSelector(Hero);  // selector for Heroes, typed as Hero
   *   getSelector('Hero'); // selector for Heroes, untyped
   */
  getSelector<T>(entityClass: EntityClass<T>) {
    const entityName = getEntityName(entityClass);
    let selector = this.selectors[entityName];
    if (!selector) {
      selector = new EntitySelector<T>(entityClass, this.store);
      this.selectors[entityName] = selector;
    }
    return selector;
  }
   /**
   * Register a selector class for an entity class
   * @param entityClass - the name of the entity class or the class itself
   * @param selector - selector for that entity class
   */
  registerSelector<T>(
    entityClass: string | EntityClass<T>,
    selector: EntitySelector<T>
  ) {
    this.selectors[getEntityName(entityClass)] = selector;
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
    return this.store.select(
      createSelector(entityCache, state => collection(state, this.typeName).loading)
    );
  }

  filter$(): Observable<string> {
    return this.store.select(
      createSelector(entityCache, state => collection(state, this.typeName).filter)
    );
  }
}
