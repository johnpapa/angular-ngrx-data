import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { ChangeStateMap, ChangeType, EntityCollection } from './entity-collection';
import { EntityChangeTrackerBase } from './entity-change-tracker-base';
import { defaultSelectId, toUpdateFactory } from '../utils/utilities';
import { Dictionary, IdSelector, Update, UpdateData } from '../utils/ngrx-entity-models';
import { EntityAction } from '../actions/entity-action';
import { EntityActionDataServiceError } from '../dataservices/data-service-error';
import { EntityActionGuard } from '../actions/entity-action-guard';
import { EntityChangeTracker } from './entity-change-tracker';
import { EntityDefinition } from '../entity-metadata/entity-definition';
import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';
import { EntityOp } from '../actions/entity-op';
import { MergeStrategy } from '../actions/merge-strategy';
import { merge } from 'rxjs/operators';

/**
 * Map of {EntityOp} to reducer method for the operation.
 * If an operation is missing, caller should return the collection for that reducer.
 */
export interface EntityCollectionReducerMethodMap<T> {
  [method: string]: (collection: EntityCollection<T>, action?: EntityAction) => EntityCollection<T>;
}

/**
 * Base implementation of reducer methods for an entity collection.
 */
export class EntityCollectionReducerMethods<T> {
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
  readonly methods: EntityCollectionReducerMethodMap<T> = {
    [EntityOp.CANCEL_PERSIST]: this.cancelPersist.bind(this),

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

    [EntityOp.SAVE_DELETE_ONE]: this.saveDeleteOne.bind(this),
    [EntityOp.SAVE_DELETE_ONE_ERROR]: this.saveDeleteOneError.bind(this),
    [EntityOp.SAVE_DELETE_ONE_SUCCESS]: this.saveDeleteOneSuccess.bind(this),

    [EntityOp.SAVE_UPDATE_ONE]: this.saveUpdateOne.bind(this),
    [EntityOp.SAVE_UPDATE_ONE_ERROR]: this.saveUpdateOneError.bind(this),
    [EntityOp.SAVE_UPDATE_ONE_SUCCESS]: this.saveUpdateOneSuccess.bind(this),

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
    this.selectId = definition.selectId;

    this.guard = new EntityActionGuard(entityName, this.selectId);
    this.toUpdate = toUpdateFactory(this.selectId);

    if (!entityChangeTracker) {
      this.entityChangeTracker = new EntityChangeTrackerBase<T>(this.adapter, this.selectId);
    }
  }

  /** Cancel a persistence operation */
  protected cancelPersist(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  // #region query operations

  protected queryAll(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryAllError(collection: EntityCollection<T>, action: EntityAction<EntityActionDataServiceError>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /**
   * Merges query results per the MergeStrategy
   * Sets loading flag to false and loaded flag to true.
   */
  protected queryAllSuccess(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    const data = this.extractData(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    return {
      ...this.entityChangeTracker.mergeQueryResults(data, collection, mergeStrategy),
      loaded: true,
      loading: false
    };
  }

  protected queryByKey(collection: EntityCollection<T>, action: EntityAction<number | string>): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryByKeyError(collection: EntityCollection<T>, action: EntityAction<EntityActionDataServiceError>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected queryByKeySuccess(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    const data = this.extractData(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = data == null ? collection : this.entityChangeTracker.mergeQueryResults([data], collection, mergeStrategy);
    return this.setLoadingFalse(collection);
  }

  protected queryLoad(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryLoadError(collection: EntityCollection<T>, action: EntityAction<EntityActionDataServiceError>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /**
   * Replaces all entities in the collection
   * Sets loaded flag to true, loading flag to false,
   * and clears changeState for the entire collection.
   */
  protected queryLoadSuccess(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    const data = this.extractData(action);
    return {
      ...this.adapter.addAll(data, collection),
      loading: false,
      loaded: true,
      changeState: {}
    };
  }

  protected queryMany(collection: EntityCollection<T>, action: EntityAction): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryManyError(collection: EntityCollection<T>, action: EntityAction<EntityActionDataServiceError>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected queryManySuccess(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    const data = this.extractData(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    return {
      ...this.entityChangeTracker.mergeQueryResults(data, collection, mergeStrategy),
      loading: false
    };
  }
  // #endregion query operations

  // #region save operations

  /**
   * Save a new entity.
   * If saving pessimistically, delay adding to collection until server acknowledges success.
   * If saving optimistically; add entity immediately.
   * @param collection The collection to which the entity should be added.
   * @param action The action payload holds options, including whether the save is optimistic,
   * and the data, which must be an entity.
   * If saving optimistically, the entity must have a key.
   */
  protected saveAddOne(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    if (this.isOptimistic(action)) {
      const entity = this.guard.mustBeEntity<T>(action); // ensure the entity has a PK
      const mergeStrategy = this.extractMergeStrategy(action);
      collection = this.entityChangeTracker.trackAddOne(entity, collection, mergeStrategy);
      collection = this.adapter.addOne(entity, collection);
    }
    return this.setLoadingTrue(collection);
  }

  /**
   * Attempt to save a new entity failed or timed-out.
   * Action holds the error.
   * If saved pessimistically, the entity is not in the collection and
   * you may not have to compensate for the error.
   * If saved optimistically, the unsaved entity is in the collection and
   * you may need to compensate for the error.
   */
  protected saveAddOneError(collection: EntityCollection<T>, action: EntityAction<EntityActionDataServiceError>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /**
   * Successfully saved a new entity to the server.
   * If saved pessimistically, add the entity from the server to the collection.
   * If saved optimistically, the added entity is already in the collection.
   * However, the server might have set or modified other fields (e.g, concurrency field)
   * Therefore, update the entity in the collection with the returned value (if any)
   * Caution: in a race, this update could overwrite unsaved user changes.
   * Use pessimistic add to avoid this risk.
   */
  protected saveAddOneSuccess(collection: EntityCollection<T>, action: EntityAction<T>) {
    // For pessimistic save, ensure the server generated the primary key if the client didn't send one.
    const entity = this.guard.mustBeEntity<T>(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    if (this.isOptimistic(action)) {
      const update = this.toUpdate(entity);
      collection = this.entityChangeTracker.mergeSaveUpdates([update], collection, mergeStrategy, true /*skip unchanged*/);
    } else {
      collection = this.entityChangeTracker.mergeSaveAdds([entity], collection, mergeStrategy);
    }
    return this.setLoadingFalse(collection);
  }

  /**
   * Delete an entity from the server by key and remove it from the collection (if present).
   * If the entity is an unsaved new entity, remove it from the collection immediately
   * and skip the server delete request.
   * If an existing entity, an optimistic save removes the entity from the collection immediately
   * and a pessimistic save removes it after the server confirms successful delete.
   * @param collection Will remove the entity with this key from the collection.
   * @param action The action payload holds options, including whether the save is optimistic,
   * and the data, which must be a primary key or an entity with a key;
   * this reducer extracts the key from the entity.
   */
  protected saveDeleteOne(collection: EntityCollection<T>, action: EntityAction<number | string | T>): EntityCollection<T> {
    const toDelete = this.extractData(action);
    const deleteId = typeof toDelete === 'object' ? this.selectId(toDelete) : toDelete;
    const change = collection.changeState[deleteId];
    // If entity is already tracked ...
    if (change) {
      if (change.changeType === ChangeType.Added) {
        // Remove the added entity immediately and forget about its changes (via commit).
        collection = this.adapter.removeOne(deleteId as string, collection);
        collection = this.entityChangeTracker.commitOne(deleteId, collection);
        // Should not waste effort trying to delete on the server because it can't be there.
        action.payload.skip = true;
      } else {
        // Re-track it as a delete, even if tracking is turned off for this call.
        collection = this.entityChangeTracker.trackDeleteOne(deleteId, collection);
      }
    }

    // If optimistic delete, track current state and remove immediately.
    if (this.isOptimistic(action)) {
      const mergeStrategy = this.extractMergeStrategy(action);
      collection = this.entityChangeTracker.trackDeleteOne(deleteId, collection, mergeStrategy);
      collection = this.adapter.removeOne(deleteId as string, collection);
    }

    return this.setLoadingTrue(collection);
  }

  /**
   * Attempt to delete the entity on the server failed or timed-out.
   * Action holds the error.
   * If saved pessimistically, the entity could still be in the collection and
   * you may not have to compensate for the error.
   * If saved optimistically, the entity is not in the collection and
   * you may need to compensate for the error.
   */
  protected saveDeleteOneError(collection: EntityCollection<T>, action: EntityAction<EntityActionDataServiceError>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /**
   * Successfully deleted entity on the server. The key of the deleted entity is in the action payload data.
   * If saved pessimistically, if the entity is still in the collection it will be removed.
   * If saved optimistically, the entity has already been removed from the collection.
   */
  protected saveDeleteOneSuccess(collection: EntityCollection<T>, action: EntityAction<number | string>): EntityCollection<T> {
    const deleteId = this.extractData(action);
    if (this.isOptimistic(action)) {
      const mergeStrategy = this.extractMergeStrategy(action);
      collection = this.entityChangeTracker.mergeSaveDeletes([deleteId], collection, mergeStrategy);
    } else {
      // Pessimistic: ignore mergeStrategy. Remove entity from the collection and from change tracking.
      collection = this.adapter.removeOne(deleteId as string, collection);
      collection = this.entityChangeTracker.commitOne(deleteId, collection);
    }
    return this.setLoadingFalse(collection);
  }

  /**
   * Save an update to an existing entity.
   * If saving pessimistically, update the entity in the collection after the server confirms success.
   * If saving optimistically, update the entity immediately, before the save request.
   * @param collection The collection to update
   * @param action The action payload holds options, including if the save is optimistic,
   * and the data which, must be an {Update<T>}
   */
  protected saveUpdateOne(collection: EntityCollection<T>, action: EntityAction<Update<T>>): EntityCollection<T> {
    const update = this.guard.mustBeUpdate<T>(action);
    if (this.isOptimistic(action)) {
      const mergeStrategy = this.extractMergeStrategy(action);
      collection = this.entityChangeTracker.trackUpdateOne(update, collection, mergeStrategy);
      collection = this.adapter.updateOne(update, collection);
    }
    return this.setLoadingTrue(collection);
  }

  /**
   * Attempt to update the entity on the server failed or timed-out.
   * Action holds the error.
   * If saved pessimistically, the entity in the collection is in the pre-save state
   * you may not have to compensate for the error.
   * If saved optimistically, the entity in the collection was updated
   * and you may need to compensate for the error.
   */
  protected saveUpdateOneError(collection: EntityCollection<T>, action: EntityAction<EntityActionDataServiceError>): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /**
   * Successfully saved the updated entity to the server.
   * If saved pessimistically, update the entity in the collection with data from the server.
   * If saved optimistically, the entity was already updated in the collection.
   * However, the server might have set or modified other fields (e.g, concurrency field)
   * Therefore, update the entity in the collection with the returned value (if any)
   * Caution: in a race, this update could overwrite unsaved user changes.
   * Use pessimistic update to avoid this risk.
   * @param collection The collection to update
   * @param action The action payload holds options, including if the save is optimistic,
   * and the data which, must be an {Update<T>}
   */
  protected saveUpdateOneSuccess(collection: EntityCollection<T>, action: EntityAction<UpdateData<T>>): EntityCollection<T> {
    const update = this.guard.mustBeUpdate<T>(action) as UpdateData<T>;
    const isOptimistic = this.isOptimistic(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = this.entityChangeTracker.mergeSaveUpdates([update], collection, mergeStrategy, isOptimistic /*skip unchanged*/);
    return this.setLoadingFalse(collection);
  }
  // #endregion save operations

  // #region cache-only operations

  /**
   * Replaces all entities in the collection
   * Sets loaded flag to true.
   * Merges query results, preserving unsaved changes
   */
  protected addAll(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    const entities = this.guard.mustBeEntities<T>(action);
    return {
      ...this.adapter.addAll(entities, collection),
      loading: false,
      loaded: true,
      changeState: {}
    };
  }

  protected addMany(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    const entities = this.guard.mustBeEntities<T>(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = this.entityChangeTracker.trackAddMany(entities, collection, mergeStrategy);
    return this.adapter.addMany(entities, collection);
  }

  protected addOne(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    const entity = this.guard.mustBeEntity<T>(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = this.entityChangeTracker.trackAddOne(entity, collection, mergeStrategy);
    return this.adapter.addOne(entity, collection);
  }

  protected removeMany(collection: EntityCollection<T>, action: EntityAction<number[] | string[]>): EntityCollection<T> {
    // payload must be entity keys
    const keys = this.guard.mustBeKeys(action) as string[];
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = this.entityChangeTracker.trackDeleteMany(keys, collection, mergeStrategy);
    return this.adapter.removeMany(keys, collection);
  }

  protected removeOne(collection: EntityCollection<T>, action: EntityAction<number | string>): EntityCollection<T> {
    // payload must be entity key
    const key = this.guard.mustBeKey(action) as string;
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = this.entityChangeTracker.trackDeleteOne(key, collection, mergeStrategy);
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
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = this.entityChangeTracker.trackUpdateMany(updates, collection, mergeStrategy);
    return this.adapter.updateMany(updates, collection);
  }

  protected updateOne(collection: EntityCollection<T>, action: EntityAction<Update<T>>): EntityCollection<T> {
    // payload must be an `Update<T>`, not an entity
    const update = this.guard.mustBeUpdate<T>(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = this.entityChangeTracker.trackUpdateOne(update, collection, mergeStrategy);
    return this.adapter.updateOne(update, collection);
  }

  protected upsertMany(collection: EntityCollection<T>, action: EntityAction<T[]>): EntityCollection<T> {
    // <v6: payload must be an array of `Updates<T>`, not entities
    // v6+: payload must be an array of T
    const entities = this.guard.mustBeEntities<T>(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = this.entityChangeTracker.trackUpsertMany(entities, collection, mergeStrategy);
    return this.adapter.upsertMany(entities, collection);
  }

  protected upsertOne(collection: EntityCollection<T>, action: EntityAction<T>): EntityCollection<T> {
    // <v6: payload must be an `Update<T>`, not an entity
    // v6+: payload must be a T
    const entity = this.guard.mustBeEntity(action);
    const mergeStrategy = this.extractMergeStrategy(action);
    collection = this.entityChangeTracker.trackUpsertOne(entity, collection, mergeStrategy);
    return this.adapter.upsertOne(entity, collection);
  }

  protected commitAll(collection: EntityCollection<T>) {
    return this.entityChangeTracker.commitAll(collection);
  }

  protected commitMany(collection: EntityCollection<T>, action: EntityAction<T[]>) {
    return this.entityChangeTracker.commitMany(this.extractData(action), collection);
  }

  protected commitOne(collection: EntityCollection<T>, action: EntityAction<T>) {
    return this.entityChangeTracker.commitOne(this.extractData(action), collection);
  }

  protected undoAll(collection: EntityCollection<T>) {
    return this.entityChangeTracker.undoAll(collection);
  }

  protected undoMany(collection: EntityCollection<T>, action: EntityAction<T[]>) {
    return this.entityChangeTracker.undoMany(this.extractData(action), collection);
  }

  protected undoOne(collection: EntityCollection<T>, action: EntityAction<T>) {
    return this.entityChangeTracker.undoOne(this.extractData(action), collection);
  }

  /** Dangerous: Completely replace the collection's ChangeState. Use rarely and wisely. */
  protected setChangeState(collection: EntityCollection<T>, action: EntityAction<ChangeStateMap<T>>) {
    const changeState = this.extractData(action);
    return collection.changeState === changeState ? collection : { ...collection, changeState };
  }

  /**
   * Dangerous: Completely replace the collection.
   * Primarily for testing and rehydration from local storage.
   * Use rarely and wisely.
   */
  protected setCollection(collection: EntityCollection<T>, action: EntityAction<EntityCollection<T>>) {
    const newCollection = this.extractData(action);
    return collection === newCollection ? collection : newCollection;
  }

  protected setFilter(collection: EntityCollection<T>, action: EntityAction<any>): EntityCollection<T> {
    const filter = this.extractData(action);
    return collection.filter === filter ? collection : { ...collection, filter };
  }

  protected setLoaded(collection: EntityCollection<T>, action: EntityAction<boolean>): EntityCollection<T> {
    const loaded = this.extractData(action) === true || false;
    return collection.loaded === loaded ? collection : { ...collection, loaded };
  }

  protected setLoading(collection: EntityCollection<T>, action: EntityAction<boolean>): EntityCollection<T> {
    return this.setLoadingFlag(collection, this.extractData(action));
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
  // #endregion Cache-only operations

  // #region helpers
  /** Safely extract data from the EntityAction payload */
  protected extractData<D = any>(action: EntityAction<D>): D {
    return action.payload && action.payload.data;
  }

  /** Safely extract MergeStrategy from EntityAction. Set to IgnoreChanges if collection itself is not tracked. */
  protected extractMergeStrategy(action: EntityAction) {
    // If not tracking this collection, always ignore changes
    return this.isChangeTracking ? action.payload && action.payload.mergeStrategy : MergeStrategy.IgnoreChanges;
  }

  protected isOptimistic(action: EntityAction) {
    return action.payload && action.payload.isOptimistic === true;
  }

  // #endregion helpers
}

/**
 * Creates {EntityCollectionReducerMethods} for a given entity type.
 */
@Injectable()
export class EntityCollectionReducerMethodsFactory {
  constructor(private entityDefinitionService: EntityDefinitionService) {}

  /** Create the  {EntityCollectionReducerMethods} for the named entity type */
  create<T>(entityName: string): EntityCollectionReducerMethodMap<T> {
    const definition = this.entityDefinitionService.getDefinition<T>(entityName);
    const methodsClass = new EntityCollectionReducerMethods(entityName, definition);

    return methodsClass.methods;
  }
}
