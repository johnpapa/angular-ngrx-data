import { Inject, Injectable } from '@angular/core';

import { createFeatureSelector, createSelector, Selector, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import { Dictionary } from '../utils';
import { EntityActions } from '../actions/entity-actions';
import { OP_ERROR } from '../actions/entity-op';
import { EntitySelectors } from './entity-selectors';
import { EntityCache  } from '../reducers/entity-cache';
import { ENTITY_CACHE_NAME_TOKEN } from '../reducers/constants';
import { EntityCollection  } from '../reducers/entity-collection';
import { EntityCollectionCreator } from '../reducers/entity-collection-creator';

/**
 * The selector observable functions for entity collection members.
 */
export interface EntitySelectors$<T> {
  /** Observable of the collection as a whole */
  collection$: Observable<EntityCollection> | Store<EntityCollection>;

  /** Observable of count of entities in the cached collection. */
  count$: Observable<number> | Store<number>;

  /** Observable of all entities in the cached collection. */
  entities$: Observable<T[]> | Store<T[]>;

  /** Observable of actions related to this entity type. */
  entityActions$: EntityActions;

  /** Observable of the map of entity keys to entities */
  entityMap$: Observable<Dictionary<T>> | Store<Dictionary<T>>;

  /** Observable of error actions related to this entity type. */
  errors$: EntityActions;

  /** Observable of the filter pattern applied by the entity collection's filter function */
  filter$: Observable<string> | Store<string>;

  /** Observable of entities in the cached collection that pass the filter function */
  filteredEntities$: Observable<T[]> | Store<T[]>;

  /** Observable of the keys of the cached collection, in the collection's native sort order */
  keys$: Observable<string[] | number[]> | Store<string[] | number[]>;

  /** Observable true when the collection has been loaded */
  loaded$: Observable<boolean> | Store<boolean>;

  /** Observable true when a multi-entity query command is in progress. */
  loading$: Observable<boolean> | Store<boolean>;

  /** Original entity values for entities with unsaved changes */
  originalValues$: Observable<Dictionary<T>> | Store<Dictionary<T>>;
}

@Injectable()
export class EntitySelectors$Factory {

  private cacheSelector: Selector<Object, EntityCache>;

  /** Observable of the EntityCache */
  entityCache$: Store<EntityCache>;

  constructor(
    @Inject(ENTITY_CACHE_NAME_TOKEN) cacheName: string,
    private entityCollectionCreator: EntityCollectionCreator,
    private store: Store<any>,
    private entityActions$: EntityActions
  ) {
      // This service applies to the cache in ngrx/store named `cacheName`
      this.cacheSelector = createFeatureSelector<EntityCache>(cacheName);
      this.entityCache$ = this.store.select(this.cacheSelector);
  }
  /**
   * Creates an entity collection's selectors$ observables for a given EntityCache store.
   * `selectors$` are observable selectors of the cached entity collection.
   * @param entityName - is also the name of the collection.
   * @param selectors - selector functions for this collection.
   **/
  create<
    T,
    S$ extends EntitySelectors$<T> = EntitySelectors$<T>
    >(
    entityName: string,
    selectors: EntitySelectors<T>
  ): S$ {
    const cc = createCachedCollectionSelector<T>(entityName, this.cacheSelector, this.entityCollectionCreator);
    const collection$ = this.store.select(cc);

    const selectors$: S$ = <any> {};

    Object.keys(selectors).forEach(
      name => {
        // strip 'select' prefix from the selector fn name and append `$`
        // Ex: 'selectEntities' => 'entities$'
        const name$ = name[6].toLowerCase() + name.substr(7) + '$';
        (<any>selectors$)[name$] = collection$.select((<any>selectors)[name]
      )}
    );
    selectors$.entityActions$ = this.entityActions$.ofEntityType(entityName);
    selectors$.errors$ = selectors$.entityActions$.where(ea => ea.op.endsWith(OP_ERROR));
    selectors$.collection$ = collection$;

    return selectors$;
  }
}

/**
 * Creates the selector for the path from the EntityCache through the Collection
 * @param collectionName - which is also the entity name
 * @param cacheSelector - selects the EntityCache from the store.
 * @param entityCollectionCreator - can create the initial state of the collection
 * if the collection is undefined when the selector is invoked
 * (as happens with time-travel debugging).
 */
export function createCachedCollectionSelector<T, C extends EntityCollection<T> = EntityCollection<T>> (
  collectionName: string,
  cacheSelector: Selector<Object, EntityCache>,
  entityCollectionCreator: EntityCollectionCreator
): Selector<Object, C> {
  const getCollection = (cache: EntityCache = {}) =>
    <C> (cache[collectionName] || entityCollectionCreator.create<T>(collectionName));
  return createSelector(cacheSelector, getCollection);
}
