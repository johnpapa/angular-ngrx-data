import { Injectable } from '@angular/core';
import { Action, createSelector, select, Store } from '@ngrx/store';

import { Observable, of, throwError } from 'rxjs';
import { filter, first, map, mergeMap, share, withLatestFrom } from 'rxjs/operators';

import { EntityAction, EntityActionOptions } from '../actions/entity-action';
import { EntityActionFactory } from '../actions/entity-action-factory';
import { EntityActionGuard } from '../actions/entity-action-guard';
import { EntityCache } from '../reducers/entity-cache';
import { EntityCacheSelector } from '../selectors/entity-cache-selector';
import { EntityCollection } from '../reducers/entity-collection';
import { EntityCommands } from './entity-commands';
import { EntityDispatcher, DefaultDispatcherOptions } from './entity-dispatcher';
import { EntityOp, OP_ERROR, OP_SUCCESS } from '../actions/entity-op';
import { getGuidComb } from '../utils/guid-fns';
import { IdSelector, Update, UpdateData } from '../utils/ngrx-entity-models';
import { defaultSelectId, toUpdateFactory } from '../utils/utilities';
import { QueryParams } from '../dataservices/interfaces';

export class EntityDispatcherBase<T> implements EntityDispatcher<T> {
  /**
   * Utility class with methods to validate EntityAction payloads.
   */
  guard: EntityActionGuard;

  private entityCollection$: Observable<EntityCollection<T>>;

  /**
   * Convert an entity (or partial entity) into the `Update<T>` object
   * `update...` and `upsert...` methods take `Update<T>` args
   */
  toUpdate: (entity: Partial<T>) => Update<T>;

  constructor(
    /** Name of the entity type for which entities are dispatched */
    public entityName: string,
    /** Creates an {EntityAction} */
    public entityActionFactory: EntityActionFactory,
    /** The store, scoped to the EntityCache */
    public store: Store<EntityCache>,
    /** Returns the primary key (id) of this entity */
    public selectId: IdSelector<T> = defaultSelectId,
    /**
     * Dispatcher options configure dispatcher behavior such as
     * whether add is optimistic or pessimistic.
     */
    public defaultDispatcherOptions: DefaultDispatcherOptions,
    /** Actions dispatched to the store after the store processed them with reducers*/
    private actions$: Observable<Action>,
    /** Store selector for the EntityCache */
    entityCacheSelector: EntityCacheSelector
  ) {
    this.guard = new EntityActionGuard(entityName, selectId);
    this.toUpdate = toUpdateFactory<T>(selectId);

    const collectionSelector = createSelector(entityCacheSelector, cache => cache[entityName] as EntityCollection<T>);
    this.entityCollection$ = store.select(collectionSelector);
  }

  /**
   * Create an {EntityAction} for this entity type.
   * @param op {EntityOp} the entity operation
   * @param [data] the action data
   * @param [options] additional options
   * @returns the EntityAction
   */
  createEntityAction<P = any>(op: EntityOp, data?: P, options?: EntityActionOptions): EntityAction<P> {
    return this.entityActionFactory.create({
      entityName: this.entityName,
      op,
      data,
      ...options
    });
  }

  /**
   * Create an {EntityAction} for this entity type and
   * dispatch it immediately to the store.
   * @param op {EntityOp} the entity operation
   * @param [data] the action data
   * @param [options] additional options
   * @returns the dispatched EntityAction
   */
  createAndDispatch<P = any>(op: EntityOp, data?: P, options?: EntityActionOptions): EntityAction<P> {
    const action = this.createEntityAction(op, data);
    this.dispatch(action);
    return action;
  }

  /**
   * Dispatch an Action to the store.
   * @param action the Action
   * @returns the dispatched Action
   */
  dispatch(action: Action): Action {
    this.store.dispatch(action);
    return action;
  }

  /**
   * Dispatch action to save a new entity to remote storage.
   * @param entity entity to add, which may omit its key if pessimistic and the server creates the key;
   * must have a key if optimistic save.
   * @returns Observable of the entity
   * after server reports successful save or the save error.
   */
  add(entity: T, options?: EntityActionOptions): Observable<T> {
    options = setSaveEntityActionOptions(options, this.defaultDispatcherOptions.optimisticAdd);
    const op = options.isOptimistic ? EntityOp.SAVE_ADD_ONE_OPTIMISTIC : EntityOp.SAVE_ADD_ONE;

    const action = this.createEntityAction(op, entity, options);
    if (options.isOptimistic) {
      this.guard.mustBeEntity(action);
    }
    this.dispatch(action);
    return this.getResponseData$<T>(options.correlationId).pipe(
      // Use the returned entity data's id to get the entity from the collection
      // as it might be different from the entity returned from the server.
      withLatestFrom(this.entityCollection$),
      map(([e, collection]) => collection.entities[this.selectId(e)])
    );
  }

  /**
   * Dispatch action to delete entity from remote storage by key.
   * @param key The primary key of the entity to remove
   * @returns Observable of the deleted key
   * after server reports successful save or the save error.
   */
  delete(entity: T, options?: EntityActionOptions): Observable<number | string>;

  /**
   * Dispatch action to delete entity from remote storage by key.
   * @param key The entity to delete
   * @returns Observable of the deleted key
   * after server reports successful save or the save error.
   */
  delete(key: number | string, options?: EntityActionOptions): Observable<number | string>;
  delete(arg: number | string | T, options?: EntityActionOptions): Observable<number | string> {
    options = setSaveEntityActionOptions(options, this.defaultDispatcherOptions.optimisticDelete);
    const op = options.isOptimistic ? EntityOp.SAVE_DELETE_ONE_OPTIMISTIC : EntityOp.SAVE_DELETE_ONE;
    const key = this.getKey(arg);
    const action = this.createEntityAction(op, key, options);
    this.guard.mustBeKey(action);
    this.dispatch(action);
    return this.getResponseData$<number | string>(options.correlationId).pipe(map(() => key));
  }

  /**
   * Dispatch action to query remote storage for all entities and
   * merge the queried entities into the cached collection.
   * @returns Observable of the queried entities that are in the collection
   * after server reports success query or the query error.
   * @see load()
   */
  getAll(options?: EntityActionOptions): Observable<T[]> {
    options = setQueryEntityActionOptions(options);
    const action = this.createEntityAction(EntityOp.QUERY_ALL, null, options);
    this.dispatch(action);
    return this.getResponseData$<T[]>(options.correlationId).pipe(
      // Use the returned entity ids to get the entities from the collection
      // as they might be different from the entities returned from the server
      // because of unsaved changes (deletes or updates).
      withLatestFrom(this.entityCollection$),
      map(([entities, collection]) =>
        entities.reduce(
          (acc, e) => {
            const entity = collection.entities[this.selectId(e)];
            if (entity) {
              acc.push(entity); // only return an entity found in the collection
            }
            return acc;
          },
          [] as T[]
        )
      )
    );
  }

  /**
   * Dispatch action to query remote storage for the entity with this primary key.
   * If the server returns an entity,
   * merge it into the cached collection.
   * @returns Observable of the collection
   * after server reports successful query or the query error.
   */
  getByKey(key: any, options?: EntityActionOptions): Observable<T> {
    options = setQueryEntityActionOptions(options);
    const action = this.createEntityAction(EntityOp.QUERY_BY_KEY, key, options);
    this.dispatch(action);
    return this.getResponseData$<T>(options.correlationId).pipe(
      // Use the returned entity data's id to get the entity from the collection
      // as it might be different from the entity returned from the server.
      withLatestFrom(this.entityCollection$),
      map(([entity, collection]) => collection.entities[this.selectId(entity)])
    );
  }

  /**
   * Dispatch action to query remote storage for the entities that satisfy a query expressed
   * with either a query parameter map or an HTTP URL query string,
   * and merge the results into the cached collection.
   * @params queryParams the query in a form understood by the server
   * @returns Observable of the queried entities
   * after server reports successful query or the query error.
   */
  getWithQuery(queryParams: QueryParams | string, options?: EntityActionOptions): Observable<T[]> {
    options = setQueryEntityActionOptions(options);
    const action = this.createEntityAction(EntityOp.QUERY_MANY, queryParams, options);
    this.dispatch(action);
    return this.getResponseData$<T[]>(options.correlationId).pipe(
      // Use the returned entity ids to get the entities from the collection
      // as they might be different from the entities returned from the server
      // because of unsaved changes (deletes or updates).
      withLatestFrom(this.entityCollection$),
      map(([entities, collection]) =>
        entities.reduce(
          (acc, e) => {
            const entity = collection.entities[this.selectId(e)];
            if (entity) {
              acc.push(entity); // only return an entity found in the collection
            }
            return acc;
          },
          [] as T[]
        )
      )
    );
  }

  /**
   * Dispatch action to query remote storage for all entities and
   * completely replace the cached collection with the queried entities.
   * @returns Observable of the collection
   * after server reports successful query or the query error.
   * @see getAll
   */
  load(options?: EntityActionOptions): Observable<T[]> {
    options = setQueryEntityActionOptions(options);
    const action = this.createEntityAction(EntityOp.QUERY_LOAD, null, options);
    this.dispatch(action);
    return this.getResponseData$<T[]>(options.correlationId);
  }

  /**
   * Dispatch action to save the updated entity (or partial entity) in remote storage.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   * @param entity update entity, which might be a partial of T but must at least have its key.
   * @returns Observable of the updated entity
   * after server reports successful save or the save error.
   */
  update(entity: Partial<T>, options?: EntityActionOptions): Observable<T> {
    // update entity might be a partial of T but must at least have its key.
    // pass the Update<T> structure as the payload
    const update: Update<T> = this.toUpdate(entity);
    options = setSaveEntityActionOptions(options, this.defaultDispatcherOptions.optimisticUpdate);
    const op = options.isOptimistic ? EntityOp.SAVE_ADD_ONE_OPTIMISTIC : EntityOp.SAVE_ADD_ONE;

    const action = this.createEntityAction(op, entity, options);
    if (options.isOptimistic) {
      this.guard.mustBeEntity(action);
    }
    this.dispatch(action);
    return this.getResponseData$<UpdateData<T>>(options.correlationId).pipe(
      // Use the update entity data id to get the entity from the collection
      // as might be different from the entity returned from the server
      // because the id changed or there are unsaved changes.
      map(updateData => updateData.changes),
      withLatestFrom(this.entityCollection$),
      map(([e, collection]) => collection.entities[this.selectId(e)])
    );
  }

  /*** Cache-only operations that do not update remote storage ***/

  // Unguarded for performance.
  // EntityCollectionReducer<T> runs a guard (which throws)
  // Developer should understand cache-only methods well enough
  // to call them with the proper entities.
  // May reconsider and add guards in future.

  /**
   * Replace all entities in the cached collection.
   * Does not save to remote storage.
   */
  addAllToCache(entities: T[]): void {
    this.createAndDispatch(EntityOp.ADD_ALL, entities);
  }

  /**
   * Add a new entity directly to the cache.
   * Does not save to remote storage.
   * Ignored if an entity with the same primary key is already in cache.
   */
  addOneToCache(entity: T): void {
    this.createAndDispatch(EntityOp.ADD_ONE, entity);
  }

  /**
   * Add multiple new entities directly to the cache.
   * Does not save to remote storage.
   * Entities with primary keys already in cache are ignored.
   */
  addManyToCache(entities: T[]): void {
    this.createAndDispatch(EntityOp.ADD_MANY, entities);
  }

  /** Clear the cached entity collection */
  clearCache(): void {
    this.createAndDispatch(EntityOp.REMOVE_ALL);
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
    this.createAndDispatch(EntityOp.REMOVE_ONE, this.getKey(arg));
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
    if (!args || args.length === 0) {
      return;
    }
    const keys =
      typeof args[0] === 'object'
        ? // if array[0] is a key, assume they're all keys
          (<T[]>args).map(arg => this.getKey(arg))
        : args;
    this.createAndDispatch(EntityOp.REMOVE_MANY, keys);
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
    const update: Update<T> = this.toUpdate(entity);
    this.createAndDispatch(EntityOp.UPDATE_ONE, update);
  }

  /**
   * Update multiple cached entities directly.
   * Does not update these entities in remote storage.
   * Entities whose primary keys are not in cache are ignored.
   * Update entities may be partial but must at least have their keys.
   * such partial entities patch their cached counterparts.
   */
  updateManyInCache(entities: Partial<T>[]): void {
    if (!entities || entities.length === 0) {
      return;
    }
    const updates: Update<T>[] = entities.map(entity => this.toUpdate(entity));
    this.createAndDispatch(EntityOp.UPDATE_MANY, updates);
  }

  /**
   * Add or update a new entity directly to the cache.
   * Does not save to remote storage.
   * Upsert entity might be a partial of T but must at least have its key.
   * Pass the Update<T> structure as the payload
   */
  upsertOneInCache(entity: Partial<T>): void {
    const upsert: Update<T> = this.toUpdate(entity);
    this.createAndDispatch(EntityOp.UPSERT_ONE, upsert);
  }

  /**
   * Add or update multiple cached entities directly.
   * Does not save to remote storage.
   */
  upsertManyInCache(entities: Partial<T>[]): void {
    if (!entities || entities.length === 0) {
      return;
    }
    const upserts: Update<T>[] = entities.map(entity => this.toUpdate(entity));
    this.createAndDispatch(EntityOp.UPSERT_MANY, upserts);
  }

  /**
   * Set the pattern that the collection's filter applies
   * when using the `filteredEntities` selector.
   */
  setFilter(pattern: any): void {
    this.createAndDispatch(EntityOp.SET_FILTER, pattern);
  }

  /** Set the loaded flag */
  setLoaded(isLoaded: boolean): void {
    this.createAndDispatch(EntityOp.SET_LOADED, !!isLoaded);
  }

  /** Set the loading flag */
  setLoading(isLoading: boolean): void {
    this.createAndDispatch(EntityOp.SET_LOADED, !!isLoading);
  }

  /** Get key from entity (unless arg is already a key) */
  private getKey(arg: number | string | T) {
    return typeof arg === 'object' ? this.selectId(arg) : arg;
  }

  /**
   * Return Observable of data from the server-success EntityAction with
   * the given Correlation Id, after that action was processed by the ngrx store.
   * or else put the server error on the Observable error channel.
   * @param coRelId The correlationId for both the save and response actions.
   */
  private getResponseData$<D = any>(coRelId: any): Observable<D> {
    return this.actions$.pipe(
      filter((act: EntityAction) => {
        const { correlationId, entityName, op } = act.payload;
        return entityName === this.entityName && correlationId === coRelId && (op.endsWith(OP_ERROR) || op.endsWith(OP_SUCCESS));
      }),
      first(),
      mergeMap(act => (act.payload.op.endsWith(OP_SUCCESS) ? of(act.payload.data as D) : throwError(act.payload.data))),
      share()
    );
  }
}

export function setQueryEntityActionOptions(options: EntityActionOptions): EntityActionOptions {
  options = options || {};
  const correlationId = options.correlationId == null ? getGuidComb() : options.correlationId;
  return { ...options, correlationId };
}

export function setSaveEntityActionOptions(options: EntityActionOptions, defaultOptimism: boolean): EntityActionOptions {
  options = options || {};
  const isOptimistic = options.isOptimistic == null ? defaultOptimism || false : options.isOptimistic === true;
  const correlationId = options.correlationId == null ? getGuidComb() : options.correlationId;
  return { ...options, correlationId, isOptimistic };
}
