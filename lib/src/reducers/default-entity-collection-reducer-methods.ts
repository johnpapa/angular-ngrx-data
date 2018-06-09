import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { ChangeStateMap, ChangeType, EntityCollection } from './entity-collection';
import { Dictionary, IdSelector, Update, UpdateData } from '../utils/ngrx-entity-models';
import { defaultSelectId, toUpdateFactory } from '../utils/utilities';
import { EntityAction, extractActionData, MergeStrategy } from '../actions/entity-action';
import { EntityActionGuard } from '../actions/entity-action-guard';
import { EntityChangeTracker, NoopEntityChangeTracker } from './entity-change-tracker';
import { DefaultEntityChangeTracker } from './default-entity-change-tracker';
import { EntityCollectionReducerMethods, EntityCollectionReducerMethodsFactory } from './entity-collection-reducer';
import { EntityDefinition } from '../entity-metadata/entity-definition';
import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';
import { EntityOp } from '../actions/entity-op';

/**
 * Default reducer methods for an entity collection.
 */
export class DefaultEntityCollectionReducerMethods<T> {
  protected adapter: EntityAdapter<T>;
  protected guard: EntityActionGuard;
  /** True if this collection tracks unsaved changes */
  protected isChangeTracking: boolean;

  /** Extract the primary key (id); default to `id` */
  selectId: IdSelector<T>;

  /**
   * Convert an entity (or partial entity) into the `Update<T>` object
   * `id`: the primary key and
   * `changes`: the entity (or partial entity of changes).
   */
  protected toUpdate: (entity: Partial<T>) => Update<T>;

  /**
   * Dictionary of the {EntityCollectionReducerMethods} for this entity type,
   * keyed by the {EntityOp}
   */
  readonly methods: EntityCollectionReducerMethods<T> = {
    [EntityOp.QUERY_ALL]: this.queryAll.bind(this),
    [EntityOp.QUERY_ALL_ERROR]: this.queryAllError.bind(this),
    [EntityOp.QUERY_ALL_SUCCESS]: this.queryAllSuccess.bind(this),

    [EntityOp.QUERY_BY_KEY]: this.queryByKey.bind(this),
    [EntityOp.QUERY_BY_KEY_ERROR]: this.queryByKeyError.bind(this),
    [EntityOp.QUERY_BY_KEY_SUCCESS]: this.queryByKeySuccess.bind(this),

    [EntityOp.QUERY_LOAD]: this.queryLoad.bind(this),
    [EntityOp.QUERY_LOAD_ERROR]: this.queryLoadError.bind(this),
    [EntityOp.QUERY_LOAD_SUCCESS]: this.queryLoadSuccess.bind(this),

    [EntityOp.QUERY_MANY]: this.queryMany.bind(this),
    [EntityOp.QUERY_MANY_ERROR]: this.queryManyError.bind(this),
    [EntityOp.QUERY_MANY_SUCCESS]: this.queryManySuccess.bind(this),

    [EntityOp.SAVE_ADD_ONE]: this.saveAddOne.bind(this),
    [EntityOp.SAVE_ADD_ONE_ERROR]: this.saveAddOneError.bind(this),
    [EntityOp.SAVE_ADD_ONE_SUCCESS]: this.saveAddOneSuccess.bind(this),

    [EntityOp.SAVE_ADD_ONE_OPTIMISTIC]: this.saveAddOneOptimistic.bind(this),
    [EntityOp.SAVE_ADD_ONE_OPTIMISTIC_ERROR]: this.saveAddOneOptimisticError.bind(this),
    [EntityOp.SAVE_ADD_ONE_OPTIMISTIC_SUCCESS]: this.saveAddOneOptimisticSuccess.bind(this),

    [EntityOp.SAVE_DELETE_ONE]: this.saveDeleteOne.bind(this),
    [EntityOp.SAVE_DELETE_ONE_ERROR]: this.saveDeleteOneError.bind(this),
    [EntityOp.SAVE_DELETE_ONE_SUCCESS]: this.saveDeleteOneSuccess.bind(this),

    [EntityOp.SAVE_DELETE_ONE_OPTIMISTIC]: this.saveDeleteOneOptimistic.bind(this),
    [EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_ERROR]: this.saveDeleteOneOptimisticError.bind(this),
    [EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS]: this.saveDeleteOneOptimisticSuccess.bind(this),

    [EntityOp.SAVE_UPDATE_ONE]: this.saveUpdateOne.bind(this),
    [EntityOp.SAVE_UPDATE_ONE_ERROR]: this.saveUpdateOneError.bind(this),
    [EntityOp.SAVE_UPDATE_ONE_SUCCESS]: this.saveUpdateOneSuccess.bind(this),

    [EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC]: this.saveUpdateOneOptimistic.bind(this),
    [EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_ERROR]: this.saveUpdateOneOptimisticError.bind(this),
    [EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS]: this.saveUpdateOneOptimisticSuccess.bind(this),

    // Do nothing on save errors except turn the loading flag off.
    // See the ChangeTrackerMetaReducers
    // Or the app could listen for those errors and do something

    /// cache only operations ///

    [EntityOp.ADD_ALL]: this.addAll.bind(this),
    [EntityOp.ADD_MANY]: this.addMany.bind(this),
    [EntityOp.ADD_ONE]: this.addOne.bind(this),

    [EntityOp.REMOVE_ALL]: this.removeAll.bind(this),
    [EntityOp.REMOVE_MANY]: this.removeMany.bind(this),
    [EntityOp.REMOVE_ONE]: this.removeOne.bind(this),

    [EntityOp.UPDATE_MANY]: this.updateMany.bind(this),
    [EntityOp.UPDATE_ONE]: this.updateOne.bind(this),

    [EntityOp.UPSERT_MANY]: this.upsertMany.bind(this),
    [EntityOp.UPSERT_ONE]: this.upsertOne.bind(this),

    [EntityOp.COMMIT_ALL]: this.commitAll.bind(this),
    [EntityOp.COMMIT_MANY]: this.commitMany.bind(this),
    [EntityOp.COMMIT_ONE]: this.commitOne.bind(this),
    [EntityOp.UNDO_ALL]: this.undoAll.bind(this),
    [EntityOp.UNDO_MANY]: this.undoMany.bind(this),
    [EntityOp.UNDO_ONE]: this.undoOne.bind(this),

    [EntityOp.SET_CHANGE_STATE]: this.setChangeState.bind(this),
    [EntityOp.SET_COLLECTION]: this.setCollection.bind(this),
    [EntityOp.SET_FILTER]: this.setFilter.bind(this),
    [EntityOp.SET_LOADED]: this.setLoaded.bind(this),
    [EntityOp.SET_LOADING]: this.setLoading.bind(this)
  };

  /** @deprecated() in favor of the reducerMethods property
   * Get the reducer methods.
   */
  getMethods() {
    return this.methods;
  }

  constructor(
    public entityName: string,
    public definition: EntityDefinition<T>,
    /*
     * Track changes to entities since the last query or save
     * Can revert some or all of those changes
     */
    public entityChangeTracker?: EntityChangeTracker<T>
  ) {
    this.adapter = definition.entityAdapter;

    this.isChangeTracking = definition.noChangeTracking !== true;
    if (!entityChangeTracker) {
      this.entityChangeTracker = this.isChangeTracking
        ? new DefaultEntityChangeTracker<T>(this.adapter, this.selectId)
        : new NoopEntityChangeTracker<T>();
    }

    this.guard = new EntityActionGuard(this.selectId);
    this.selectId = definition.selectId;
    this.toUpdate = toUpdateFactory(this.selectId);
  }

  protected queryAll(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryAllError(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /**
   * Replaces all entities in the collection
   * Sets loaded flag to true.
   * Merges query results, preserving unsaved changes
   */
  protected queryAllSuccess(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    return this.addAll(collection, action);
  }

  protected queryByKey(collection: EntityCollection<T>, action: EntityAction<number | string>): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryByKeyError(collection: EntityCollection<T>, action: EntityAction<number | string>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected queryByKeySuccess(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    const entity = extractActionData(action);
    if (entity != null) {
      const changeState = this.entityChangeTracker.mergeQueryResults([entity], collection);
      collection =
        changeState === collection.changeState
          ? this.adapter.upsertOne(entity, collection) // upsert because no pending change for this entity
          : { ...collection, changeState }; // entity has pending change; do not upsert
    }
    return collection;
  }

  protected queryLoad(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryLoadError(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /**
   * Replaces all entities in the collection
   * Sets loaded flag to true, loading flag to false,
   * and clears changeState for the entire collection.
   */
  protected queryLoadSuccess(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    return {
      ...this.adapter.addAll(action.payload.data, collection),
      loading: false,
      loaded: true,
      changeState: {}
    };
  }

  protected queryMany(collection: EntityCollection<T>, action: EntityAction): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryManyError(collection: EntityCollection<T>, action: EntityAction): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected queryManySuccess(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    let entities = extractActionData(action);
    if (entities != null && entities.length > 0) {
      const changeState = this.entityChangeTracker.mergeQueryResults(entities, collection);
      if (changeState !== collection.changeState) {
        // Some queried entities have pending changes and they were merged into changeState original values
        collection = { ...collection, changeState };
        // Only upsert those queried entities which do not have pending changes.
        entities = entities.filter(entity => changeState[this.selectId(entity)] == null);
      }
      collection = this.adapter.upsertMany(entities, collection);
    }
    return collection;
  }

  /** pessimistic add upon success */
  protected saveAddOne(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected saveAddOneError(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected saveAddOneSuccess(collection: EntityCollection<T>, action: EntityAction<T>) {
    // Ensure the server generated the primary key if the client didn't send one.
    const entity = this.guard.mustBeEntity<T>(action);
    collection = this.setLoadingFalse(collection);
    collection = this.entityChangeTracker.commitOne(entity, collection);
    return this.adapter.addOne(entity, collection);
  }

  /** optimistic add; add entity immediately
   * Must have pkey to add optimistically
   */
  protected saveAddOneOptimistic(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    // Ensure the server generated the primary key if the client didn't send one.
    const entity = this.guard.mustBeEntity<T>(action);
    collection = this.setLoadingTrue(collection);
    collection = this.entityChangeTracker.trackAddOne(entity, collection);
    return this.adapter.addOne(entity, collection);
  }

  /** optimistic add error; item already added to collection.
   * TODO: consider compensation to undo.
   */
  protected saveAddOneOptimisticError(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  // Although already added to collection
  // the server might have added other fields (e.g, concurrency field)
  // Therefore, update with returned value
  // Caution: in a race, this update could overwrite unsaved user changes.
  // Use pessimistic add to avoid this risk.
  /** optimistic add succeeded. */
  protected saveAddOneOptimisticSuccess(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    const entity = this.guard.mustBeEntity(action);
    collection = this.setLoadingFalse(collection);
    collection = this.entityChangeTracker.commitOne(entity, collection);
    const update = this.toUpdate(entity);
    return this.adapter.updateOne(update, collection);
  }

  /** pessimistic delete, after success */
  protected saveDeleteOne(collection: EntityCollection<T>, action: EntityAction<number | string | T>): EntityCollection<T> {
    collection = this.setLoadingTrue(collection);
    const toDelete = extractActionData(action);
    const deleteId = typeof toDelete === 'object' ? this.selectId(toDelete) : toDelete;

    // if entity to delete is known to be an added entity
    const change = collection.changeState[deleteId];
    if (change && change.changeType === ChangeType.Added) {
      // Remove the added entity immediately and forget about its changes (via commit).
      collection = this.entityChangeTracker.commitOne(deleteId, collection);
      collection = this.adapter.removeOne(deleteId as string, collection);
      action.payload.skip = true; // Should not waste effort trying to delete on the server.
    }
    return collection;
  }

  protected saveDeleteOneError(collection: EntityCollection<T>, action: EntityAction<number | string | T>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected saveDeleteOneSuccess(collection: EntityCollection<T>, action: EntityAction<number | string | T>): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    const toDelete = extractActionData(action);
    const deleteId = typeof toDelete === 'object' ? this.selectId(toDelete) : toDelete;
    collection = this.entityChangeTracker.commitOne(deleteId, collection);
    return this.adapter.removeOne(deleteId as string, collection);
  }

  /** optimistic delete by entity key immediately */
  protected saveDeleteOneOptimistic(collection: EntityCollection<T>, action: EntityAction<number | string | T>): EntityCollection<T> {
    collection = this.setLoadingTrue(collection);
    const toDelete = extractActionData(action);
    const deleteId = typeof toDelete === 'object' ? this.selectId(toDelete) : toDelete;
    // if entity to delete is known to be an added entity
    const change = collection.changeState[deleteId];
    if (change && change.changeType === ChangeType.Added) {
      // Don't track for undo because do not save or undo deletion of added entity
      collection = this.entityChangeTracker.commitOne(deleteId, collection);
      action.payload.skip = true; // Should not waste effort trying to delete on the server.
    } else {
      collection = this.entityChangeTracker.trackDeleteOne(deleteId, collection);
    }
    // Remove immediately (optimistically)
    return this.adapter.removeOne(deleteId as string, collection);
  }

  /** optimistic delete error; item already removed from collection. */
  protected saveDeleteOneOptimisticError(collection: EntityCollection<T>, action: EntityAction<number | string | T>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected saveDeleteOneOptimisticSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<number | string | T>
  ): EntityCollection<T> {
    collection = this.entityChangeTracker.commitOne(extractActionData(action), collection);
    return this.setLoadingFalse(collection);
  }

  /**
   * pessimistic update; update entity only upon success
   * payload must be an {Update<T>}
   */
  protected saveUpdateOne(collection: EntityCollection<T>, action: EntityAction<Update<T>>): EntityCollection<T> {
    this.guard.mustBeUpdate(action);
    return this.setLoadingTrue(collection);
  }

  protected saveUpdateOneError(collection: EntityCollection<T>, action: EntityAction<Update<T>>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /** pessimistic update upon success */
  protected saveUpdateOneSuccess(collection: EntityCollection<T>, action: EntityAction<Update<T>>): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    const { unchanged, ...update } = this.guard.mustBeUpdate<T>(action) as UpdateData<T>;
    collection = this.entityChangeTracker.commitOne(update.changes as T, collection);
    return this.adapter.updateOne(update, collection);
  }

  /**
   * optimistic update; update entity immediately
   * payload must be an {Update<T>}
   */
  protected saveUpdateOneOptimistic(collection: EntityCollection<T>, action: EntityAction<Update<T>>): EntityCollection<T> {
    const update = this.guard.mustBeUpdate<T>(action);
    collection = this.setLoadingTrue(collection);
    collection = this.entityChangeTracker.trackUpdateOne(update.changes as T, collection);
    return this.adapter.updateOne(update, collection);
  }

  /** optimistic update error; collection already updated.
   * TODO: consider compensation to undo.
   */
  protected saveUpdateOneOptimisticError(collection: EntityCollection<T>, action: EntityAction<Update<T>>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /** optimistic update success; collection already updated.
   * Server may have touched other fields
   * so update the collection again if the server sent different data.
   * payload must be an {Update<T>}
   */
  protected saveUpdateOneOptimisticSuccess(collection: EntityCollection<T>, action: EntityAction<Update<T>>): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    const { unchanged, ...update } = this.guard.mustBeUpdate<T>(action) as UpdateData<T>;
    collection = this.entityChangeTracker.commitOne(update.changes as T, collection);

    // A data service like `DefaultDataService<T>` will add `unchanged:true` to the payload.
    // if the server responded without data, there is no need to update the collection.
    return (<any>update).unchanged ? collection : this.adapter.updateOne(update, collection);
  }

  ///// Cache-only operations /////

  /**
   * Replaces all entities in the collection
   * Sets loaded flag to true.
   * Merges query results, preserving unsaved changes
   */
  protected addAll(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    let entities = this.guard.mustBeEntities<T>(action);
    const changeState = this.entityChangeTracker.mergeQueryResults(entities, collection);
    if (changeState !== collection.changeState) {
      // Some entities have pending changes. Only add entities which do not have pending changes.
      entities = entities.filter(entity => changeState[this.selectId(entity)] == null);
    }
    return {
      ...this.adapter.addAll(entities, collection),
      loading: false,
      loaded: true,
      changeState
    };
  }

  protected addMany(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    const entities = this.guard.mustBeEntities<T>(action);
    if (this.isChangeTracking) {
      collection = this.entityChangeTracker.trackAddMany(entities, collection);
    }
    return this.adapter.addMany(entities, collection);
  }

  protected addOne(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    const entity = this.guard.mustBeEntity<T>(action);
    if (this.isChangeTracking) {
      collection = this.entityChangeTracker.trackAddOne(entity, collection);
    }
    return this.adapter.addOne(entity, collection);
  }

  protected removeMany(collection: EntityCollection<T>, action: EntityAction<number[] | string[]>): EntityCollection<T> {
    // payload must be entity keys
    const keys = this.guard.mustBeKeys(action) as string[];
    if (this.isChangeTracking) {
      collection = this.entityChangeTracker.trackDeleteMany(keys, collection);
    }
    return this.adapter.removeMany(keys, collection);
  }

  protected removeOne(collection: EntityCollection<T>, action: EntityAction<number | string>): EntityCollection<T> {
    // payload must be entity key
    const key = this.guard.mustBeKey(action) as string;
    if (this.isChangeTracking) {
      collection = this.entityChangeTracker.trackDeleteOne(key, collection);
    }
    return this.adapter.removeOne(key, collection);
  }

  protected removeAll(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    return {
      ...this.adapter.removeAll(collection),
      loaded: false, // Only REMOVE_ALL sets loaded to false
      loading: false,
      changeState: {} // Assume clearing the collection and not trying to delete all entities
    };
  }

  protected updateMany(collection: EntityCollection<T>, action: EntityAction<Update<T>[]>): EntityCollection<T> {
    // payload must be an array of `Updates<T>`, not entities
    const updates = this.guard.mustBeUpdates<T>(action);
    const entities = updates.map(up => up.changes as T);
    if (this.isChangeTracking) {
      collection = this.entityChangeTracker.trackUpdateMany(entities, collection);
    }
    return this.adapter.updateMany(updates, collection);
  }

  protected updateOne(collection: EntityCollection<T>, action: EntityAction<Update<T>>): EntityCollection<T> {
    // payload must be an `Update<T>`, not an entity
    const update = this.guard.mustBeUpdate<T>(action);
    if (this.isChangeTracking) {
      collection = this.entityChangeTracker.trackUpdateOne(update.changes as T, collection);
    }
    return this.adapter.updateOne(update, collection);
  }

  protected upsertMany(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    // <v6: payload must be an array of `Updates<T>`, not entities
    // this.guard.mustBeUpdates(action);
    // v6+: payload must be an array of T
    const entities = this.guard.mustBeEntities<T>(action);
    if (this.isChangeTracking) {
      collection = this.entityChangeTracker.trackUpsertMany(entities, collection);
    }
    return this.adapter.upsertMany(extractActionData(action), collection);
  }

  protected upsertOne(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    // <v6: payload must be an `Update<T>`, not an entity
    // this.guard.mustBeUpdate(action);
    // v6+: payload must be a T
    const entity = this.guard.mustBeEntity(action);
    if (this.isChangeTracking) {
      collection = this.entityChangeTracker.trackUpsertOne(entity, collection);
    }
    return this.adapter.upsertOne(entity, collection);
  }

  protected commitAll(collection: EntityCollection<T>) {
    return this.entityChangeTracker.commitAll(collection);
  }

  protected commitMany(collection: EntityCollection<T>, action: EntityAction<T[]>) {
    return this.entityChangeTracker.commitMany(extractActionData(action), collection);
  }

  protected commitOne(collection: EntityCollection<T>, action: EntityAction<T>) {
    return this.entityChangeTracker.commitOne(extractActionData(action), collection);
  }

  protected undoAll(collection: EntityCollection<T>) {
    return this.entityChangeTracker.undoAll(collection);
  }

  protected undoMany(collection: EntityCollection<T>, action: EntityAction<T[]>) {
    return this.entityChangeTracker.undoMany(extractActionData(action), collection);
  }

  protected undoOne(collection: EntityCollection<T>, action: EntityAction<T>) {
    return this.entityChangeTracker.undoOne(extractActionData(action), collection);
  }

  /** Dangerous: Completely replace the collection's ChangeState. Use rarely and wisely. */
  protected setChangeState(collection: EntityCollection<T>, action: EntityAction<ChangeStateMap<T>>) {
    const changeState = extractActionData(action);
    return collection.changeState === changeState ? collection : { ...collection, changeState };
  }

  /**
   * Dangerous: Completely replace the collection.
   * Primarily for testing and rehydration from local storage.
   * Use rarely and wisely.
   */
  protected setCollection(collection: EntityCollection<T>, action: EntityAction<EntityCollection<T>>) {
    const newCollection = extractActionData(action);
    return collection === newCollection ? collection : newCollection;
  }

  protected setFilter(collection: EntityCollection<T>, action: EntityAction<any>): EntityCollection<T> {
    const filter = extractActionData(action);
    return collection.filter === filter ? collection : { ...collection, filter };
  }

  protected setLoaded(collection: EntityCollection<T>, action: EntityAction<boolean>): EntityCollection<T> {
    const loaded = extractActionData(action) === true || false;
    return collection.loaded === loaded ? collection : { ...collection, loaded };
  }

  protected setLoading(collection: EntityCollection<T>, action: EntityAction<boolean>): EntityCollection<T> {
    return this.setLoadingFlag(collection, extractActionData(action));
  }

  protected setLoadingFalse(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingFlag(collection, false);
  }

  protected setLoadingTrue(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingFlag(collection, true);
  }

  /** Set the collection's loading flag */
  protected setLoadingFlag(collection: EntityCollection<T>, loading: boolean) {
    loading = loading === true ? true : false;
    return collection.loading === loading ? collection : { ...collection, loading };
  }
}

/**
 * Creates default {EntityCollectionReducerMethods} for a given entity type.
 */
@Injectable()
export class DefaultEntityCollectionReducerMethodsFactory implements EntityCollectionReducerMethodsFactory {
  constructor(protected entityDefinitionService: EntityDefinitionService) {}

  /** Create the  {EntityCollectionReducerMethods} for the named entity type */
  create<T>(entityName: string): EntityCollectionReducerMethods<T> {
    const definition = this.entityDefinitionService.getDefinition<T>(entityName);
    const methodsClass = new DefaultEntityCollectionReducerMethods(entityName, definition);

    return methodsClass.methods;
  }
}
