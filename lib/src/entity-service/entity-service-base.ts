import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';

import { Dictionary, IdSelector, Update } from '../utils/ngrx-entity-models';
import { EntityAction } from '../actions/entity-action';
import { EntityActions } from '../actions/entity-actions';
import { EntityOp } from '../actions/entity-op';
import { EntityActionGuard } from '../actions/entity-action-guard';
import { EntityCache } from '../reducers/entity-cache';
import { EntityCollection } from '../reducers/entity-collection';
import { EntityDispatcher } from '../dispatchers/entity-dispatcher';
import { EntitySelectors } from '../selectors/entity-selectors';
import { EntitySelectors$ } from '../selectors/entity-selectors$';
import {
  EntityService,
  EntityServiceFactory
} from './entity-service-interfaces';
import { QueryParams } from '../dataservices/interfaces';

// tslint:disable:member-ordering
/**
 * Base class for a concrete EntityService<T>.
 * Can be instantiated. Cannot be injected.
 * @param entityName Entity type name
 * @param entityServiceFactory A creator of an EntityService<T> which here serves
 * as a source of supporting services for creating an EntityService<T> instance.
 */
export class EntityServiceBase<
  T,
  S$ extends EntitySelectors$<T> = EntitySelectors$<T>
> implements EntityService<T> {
  /** Dispatch entity actions for this entity collection */
  readonly dispatcher: EntityDispatcher<T>;

  /** All selectors of entity collection properties */
  readonly selectors: EntitySelectors<T>;

  /** All selectors$ (observables of entity collection properties) */
  readonly selectors$: S$;

  constructor(
    public readonly entityName: string,
    entityServiceFactory: EntityServiceFactory
  ) {
    entityName = entityName.trim();
    const {
      dispatcher,
      selectors,
      selectors$
    } = entityServiceFactory.getEntityServiceElements<T, S$>(entityName);

    this.entityName = entityName;
    this.dispatcher = dispatcher;
    this.guard = dispatcher.guard;
    this.selectId = dispatcher.selectId;
    this.toUpdate = dispatcher.toUpdate;

    this.selectors = selectors;
    this.selectors$ = selectors$;
    this.collection$ = selectors$.collection$;
    this.count$ = selectors$.count$;
    this.entities$ = selectors$.entities$;
    this.entityActions$ = selectors$.entityActions$;
    this.entityCache$ = selectors$.entityCache$;
    this.entityMap$ = selectors$.entityMap$;
    this.errors$ = selectors$.errors$;
    this.filter$ = selectors$.filter$;
    this.filteredEntities$ = selectors$.filteredEntities$;
    this.keys$ = selectors$.keys$;
    this.loaded$ = selectors$.loaded$;
    this.loading$ = selectors$.loading$;
    this.originalValues$ = selectors$.originalValues$;
  }

  /**
   * Create an {EntityAction} for this entity type.
   * @param op {EntityOp} the entity operation
   * @param payload the action payload
   */
  createEntityAction(op: EntityOp, payload?: any): EntityAction<T> {
    return this.dispatcher.createEntityAction(op, payload);
  }

  /**
   * Create an {EntityAction} for this entity type and
   * dispatch it immediately to the store.
   * @param op {EntityOp} the entity operation
   * @param payload the action payload
   */
  createAndDispatch(op: EntityOp, payload?: any): void {
    this.dispatcher.createAndDispatch(op, payload);
  }

  /**
   * Dispatch action to the store.
   * @param action the EntityAction
   */
  dispatch(action: Action): void {
    this.dispatcher.dispatch(action);
  }

  /** The NgRx Store for the {EntityCache} */
  get store() {
    return this.dispatcher.store;
  }

  /**
   * Utility class with methods to validate EntityAction payloads.
   */
  guard: EntityActionGuard;

  /** Returns the primary key (id) of this entity */
  selectId: IdSelector<T>;

  /**
   * Convert an entity (or partial entity) into the `Update<T>` object
   * `update...` and `upsert...` methods take `Update<T>` args
   */
  toUpdate: (entity: Partial<T>) => Update<T>;

  // region Dispatch commands

  /**
   * Save a new entity to remote storage.
   * Does not add to cache until save succeeds.
   * Ignored by cache-add if the entity is already in cache.
   */
  add(entity: T, isOptimistic?: boolean): void {
    this.dispatcher.add(entity, isOptimistic);
  }

  /**
   * Removes entity from the cache (if it is in the cache)
   * and deletes entity from remote storage by key.
   * Does not restore to cache if the delete fails.
   * @param entity The entity to remove
   */
  delete(entity: T, isOptimistic?: boolean): void;

  /**
   * Removes entity from the cache by key (if it is in the cache)
   * and deletes entity from remote storage by key.
   * Does not restore to cache if the delete fails.
   * @param key The primary key of the entity to remove
   */
  delete(key: number | string, isOptimistic?: boolean): void;
  delete(arg: (number | string) | T, isOptimistic?: boolean): void {
    this.dispatcher.delete(arg as any, isOptimistic);
  }

  /**
   * Query remote storage for all entities and
   * completely replace the cached collection with the queried entities.
   */
  getAll(): void {
    this.dispatcher.getAll();
  }

  /**
   * Query remote storage for the entity with this primary key.
   * If the server returns an entity,
   * merge it into the cached collection.
   */
  getByKey(key: any): void {
    this.dispatcher.getByKey(key);
  }

  /**
   * Query remote storage for the entities that satisfy a query expressed
   * with either a query parameter map or an HTTP URL query string.
   * and merge the results into the cached collection.
   */
  getWithQuery(queryParams: QueryParams | string): void {
    this.dispatcher.getWithQuery(queryParams);
  }

  /**
   * Save the updated entity (or partial entity) to remote storage.
   * Updates the cached entity after the save succeeds.
   * Update in cache is ignored if the entity's key is not found in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  update(entity: Partial<T>, isOptimistic?: boolean): void {
    this.dispatcher.update(entity, isOptimistic);
  }

  /*** Cache-only operations that do not update remote storage ***/

  /**
   * Replace all entities in the cached collection.
   * Does not save to remote storage.
   */
  addAllToCache(entities: T[]): void {
    this.dispatcher.addAllToCache(entities);
  }

  /**
   * Add a new entity directly to the cache.
   * Does not save to remote storage.
   * Ignored if an entity with the same primary key is already in cache.
   */
  addOneToCache(entity: T): void {
    this.dispatcher.addOneToCache(entity);
  }

  /**
   * Add multiple new entities directly to the cache.
   * Does not save to remote storage.
   * Entities with primary keys already in cache are ignored.
   */
  addManyToCache(entities: T[]): void {
    this.dispatcher.addManyToCache(entities);
  }

  /** Clear the cached entity collection */
  clearCache(): void {
    this.dispatcher.clearCache();
  }

  /**
   * Remove an entity directly from the cache.
   * Does not delete that entity from remote storage.
   * @param entity The entity to remove
   */
  removeOneFromCache(entity: T): void;

  /**
   * Remove an entity directly from the cache.
   * Does not delete that entity from remote storage.
   * @param key The primary key of the entity to remove
   */
  removeOneFromCache(key: number | string): void;
  removeOneFromCache(arg: (number | string) | T): void {
    this.dispatcher.removeOneFromCache(arg as any);
  }

  /**
   * Remove multiple entities directly from the cache.
   * Does not delete these entities from remote storage.
   * @param entity The entities to remove
   */
  removeManyFromCache(entities: T[]): void;

  /**
   * Remove multiple entities directly from the cache.
   * Does not delete these entities from remote storage.
   * @param keys The primary keys of the entities to remove
   */
  removeManyFromCache(keys: (number | string)[]): void;
  removeManyFromCache(args: (number | string)[] | T[]): void {
    this.dispatcher.removeManyFromCache(args as any[]);
  }

  /**
   * Update a cached entity directly.
   * Does not update that entity in remote storage.
   * Ignored if an entity with matching primary key is not in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  updateOneInCache(entity: Partial<T>): void {
    // update entity might be a partial of T but must at least have its key.
    // pass the Update<T> structure as the payload
    this.dispatcher.updateOneInCache(entity);
  }

  /**
   * Update multiple cached entities directly.
   * Does not update these entities in remote storage.
   * Entities whose primary keys are not in cache are ignored.
   * Update entities may be partial but must at least have their keys.
   * such partial entities patch their cached counterparts.
   */
  updateManyInCache(entities: Partial<T>[]): void {
    this.dispatcher.updateManyInCache(entities);
  }

  /**
   * Add or update a new entity directly to the cache.
   * Does not save to remote storage.
   * Upsert entity might be a partial of T but must at least have its key.
   * Pass the Update<T> structure as the payload
   */
  upsertOneInCache(entity: Partial<T>): void {
    this.dispatcher.upsertOneInCache(entity);
  }

  /**
   * Add or update multiple cached entities directly.
   * Does not save to remote storage.
   */
  upsertManyInCache(entities: Partial<T>[]): void {
    this.dispatcher.upsertManyInCache(entities);
  }

  /**
   * Set the pattern that the collection's filter applies
   * when using the `filteredEntities` selector.
   */
  setFilter(pattern: any): void {
    this.dispatcher.setFilter(pattern);
  }

  /** Set the loaded flag */
  setLoaded(isLoaded: boolean): void {
    this.dispatcher.setLoaded(!!isLoaded);
  }

  /** Set the loading flag */
  setLoading(isLoading: boolean): void {
    this.dispatcher.setLoading(!!isLoading);
  }

  // endregion Dispatch commands

  // region Selectors$
  /** Observable of the collection as a whole */
  collection$: Observable<EntityCollection<T>> | Store<EntityCollection<T>>;

  /** Observable of count of entities in the cached collection. */
  count$: Observable<number> | Store<number>;

  /** Observable of all entities in the cached collection. */
  entities$: Observable<T[]> | Store<T[]>;

  /** Observable of actions related to this entity type. */
  entityActions$: EntityActions;

  /** Observable of error actions related to this entity type. */
  entityCache$: Observable<EntityCache> | Store<EntityCache>;

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

  // endregion Selectors$
}
