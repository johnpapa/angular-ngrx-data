import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector, Selector } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import { EntityCache, EntityClass, getEntityName } from './interfaces';

type SelectorFn = <K>(prop: string) => Observable<K>;

@Injectable()
export class EntitySelectors {

  entityCache = createFeatureSelector<EntityCache>('entityCache');
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
  getSelector<T>(entityClass: EntityClass<T> | string) {
    const entityName = getEntityName(entityClass);
    let selector = this.selectors[entityName];
    if (!selector) {
      const selectorFn = createSelectorFn(entityName, this.entityCache, this.store);
      selector = new EntitySelector<T>(selectorFn);
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

  /**
   * Register a batch of selectors.
   * @param selectors - selectors to merge into existing selectors
   */
  registerSelectors(
    selectors: { [name: string ]: EntitySelector<any> }
  ) {
    this.selectors = { ...this.selectors, ...selectors };
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

  function collection(state: EntityCache, entityName: string) {
    const c = state[entityName];
    if (c) { return c; }
    throw new Error(`No cached collection named "${entityName}")`);
  }
}
