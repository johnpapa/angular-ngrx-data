import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { EntityAdapter } from '@ngrx/entity';

import { IdSelector, Update } from '../utils/ngrx-entity-models';
import { defaultSelectId, toUpdateFactory } from '../utils/utilities';

import { EntityAction } from '../actions/entity-action';
import { EntityActionGuard } from '../actions/entity-action-guard';
import { EntityOp } from '../actions/entity-op';

import { EntityChangeTracker } from './entity-change-tracker';
import { EntityCollection } from './entity-collection';
import {
  EntityCollectionReducerMethods,
  EntityCollectionReducerMethodsFactory
} from './entity-collection-reducer';
import { EntityDefinition } from '../entity-metadata/entity-definition';
import { EntityDefinitionService } from '../entity-metadata/entity-definition.service';

/**
 * {EntityCollectionReducerMethods} for a given entity type.
 */
export class DefaultEntityCollectionReducerMethods<T> {
  protected adapter: EntityAdapter<T>;
  protected guard: EntityActionGuard;

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

    [EntityOp.QUERY_MANY]: this.queryMany.bind(this),
    [EntityOp.QUERY_MANY_ERROR]: this.queryManyError.bind(this),
    [EntityOp.QUERY_MANY_SUCCESS]: this.queryManySuccess.bind(this),

    [EntityOp.SAVE_ADD_ONE]: this.saveAddOne.bind(this),
    [EntityOp.SAVE_ADD_ONE_ERROR]: this.saveAddOneError.bind(this),
    [EntityOp.SAVE_ADD_ONE_SUCCESS]: this.saveAddOneSuccess.bind(this),

    [EntityOp.SAVE_ADD_ONE_OPTIMISTIC]: this.saveAddOneOptimistic.bind(this),
    [EntityOp.SAVE_ADD_ONE_OPTIMISTIC_ERROR]: this.saveAddOneOptimisticError.bind(
      this
    ),
    [EntityOp.SAVE_ADD_ONE_OPTIMISTIC_SUCCESS]: this.saveAddOneOptimisticSuccess.bind(
      this
    ),

    [EntityOp.SAVE_DELETE_ONE]: this.saveDeleteOne.bind(this),
    [EntityOp.SAVE_DELETE_ONE_ERROR]: this.saveDeleteOneError.bind(this),
    [EntityOp.SAVE_DELETE_ONE_SUCCESS]: this.saveDeleteOneSuccess.bind(this),

    [EntityOp.SAVE_DELETE_ONE_OPTIMISTIC]: this.saveDeleteOneOptimistic.bind(
      this
    ),
    [EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_ERROR]: this.saveDeleteOneOptimisticError.bind(
      this
    ),
    [EntityOp.SAVE_DELETE_ONE_OPTIMISTIC_SUCCESS]: this.saveDeleteOneOptimisticSuccess.bind(
      this
    ),

    [EntityOp.SAVE_UPDATE_ONE]: this.saveUpdateOne.bind(this),
    [EntityOp.SAVE_UPDATE_ONE_ERROR]: this.saveUpdateOneError.bind(this),
    [EntityOp.SAVE_UPDATE_ONE_SUCCESS]: this.saveUpdateOneSuccess.bind(this),

    [EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC]: this.saveUpdateOneOptimistic.bind(
      this
    ),
    [EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_ERROR]: this.saveUpdateOneOptimisticError.bind(
      this
    ),
    [EntityOp.SAVE_UPDATE_ONE_OPTIMISTIC_SUCCESS]: this.saveUpdateOneOptimisticSuccess.bind(
      this
    ),

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
     * Required for optimistic saves
     * TODO: consider using for all cache updates.
     */
    public entityChangeTracker?: EntityChangeTracker<T>
  ) {
    this.adapter = definition.entityAdapter;
    this.selectId = definition.selectId;

    if (!entityChangeTracker) {
      this.entityChangeTracker = new EntityChangeTracker<T>(
        entityName,
        this.adapter,
        this.selectId
      );
    }

    this.guard = new EntityActionGuard(this.selectId);
    this.toUpdate = toUpdateFactory(this.selectId);
  }

  protected queryAll(collection: EntityCollection<T>): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryAllError(
    collection: EntityCollection<T>
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected queryAllSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    return {
      ...this.adapter.addAll(action.payload, collection),
      loaded: true, // only QUERY_ALL_SUCCESS and ADD_ALL sets loaded to true
      loading: false,
      originalValues: {}
    };
  }

  protected queryByKey(
    collection: EntityCollection<T>,
    action: EntityAction<number | string>
  ): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryByKeyError(
    collection: EntityCollection<T>,
    action: EntityAction<number | string>
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected queryByKeySuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    const upsert = action.payload;
    return upsert == null
      ? collection
      : this.adapter.upsertOne(upsert, collection);
  }

  protected queryMany(
    collection: EntityCollection<T>,
    action: EntityAction
  ): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected queryManyError(
    collection: EntityCollection<T>,
    action: EntityAction
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected queryManySuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    const upserts = action.payload as T[];
    return upserts == null || upserts.length === 0
      ? collection
      : this.adapter.upsertMany(upserts, collection);
  }

  /** pessimistic add upon success */
  protected saveAddOne(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected saveAddOneError(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected saveAddOneSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ) {
    // Ensure the server generated the primary key if the client didn't send one.
    this.guard.mustBeEntity(action);
    collection = this.setLoadingFalse(collection);
    return this.adapter.addOne(action.payload, collection);
  }

  /** optimistic add; add entity immediately
   * Must have pkey to add optimistically
   */
  protected saveAddOneOptimistic(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    // Ensure the server generated the primary key if the client didn't send one.
    this.guard.mustBeEntity(action);
    collection = this.setLoadingTrue(collection);
    return this.adapter.addOne(action.payload, collection);
  }

  /** optimistic add error; item already added to collection.
   * TODO: consider compensation to undo.
   */
  protected saveAddOneOptimisticError(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  // Although already added to collection
  // the server might have added other fields (e.g, concurrency field)
  // Therefore, update with returned value
  // Caution: in a race, this update could overwrite unsaved user changes.
  // Use pessimistic add to avoid this risk.
  /** optimistic add succeeded. */
  protected saveAddOneOptimisticSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    this.guard.mustBeEntity(action);
    collection = this.setLoadingFalse(collection);
    const update = this.toUpdate(action.payload);
    return this.adapter.updateOne(update, collection);
  }

  /** pessimistic delete, after success */
  protected saveDeleteOne(
    collection: EntityCollection<T>,
    action: EntityAction<number | string | T>
  ): EntityCollection<T> {
    return this.setLoadingTrue(collection);
  }

  protected saveDeleteOneError(
    collection: EntityCollection<T>,
    action: EntityAction<number | string | T>
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected saveDeleteOneSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<number | string | T>
  ): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    const toDelete = action.payload;
    const deleteId =
      typeof toDelete === 'object' ? this.selectId(toDelete) : toDelete;
    return this.adapter.removeOne(deleteId as string, collection);
  }

  /** optimistic delete by entity key immediately */
  protected saveDeleteOneOptimistic(
    collection: EntityCollection<T>,
    action: EntityAction<number | string | T>
  ): EntityCollection<T> {
    collection = this.setLoadingTrue(collection);
    const toDelete = action.payload;
    const deleteId =
      typeof toDelete === 'object' ? this.selectId(toDelete) : toDelete;
    return this.adapter.removeOne(deleteId as string, collection);
  }

  /** optimistic delete error; item already removed from collection..
   * TODO: consider compensation to undo.
   */
  protected saveDeleteOneOptimisticError(
    collection: EntityCollection<T>,
    action: EntityAction<number | string | T>
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  protected saveDeleteOneOptimisticSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<number | string | T>
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /**
   * pessimistic update; update entity only upon success
   * payload must be an {Update<T>}
   */
  protected saveUpdateOne(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    this.guard.mustBeUpdate(action);
    return this.setLoadingTrue(collection);
  }

  protected saveUpdateOneError(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /** pessimistic update upon success */
  protected saveUpdateOneSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    return this.adapter.updateOne(action.payload, collection);
  }

  /**
   * optimistic update; update entity immediately
   * payload must be an {Update<T>}
   */
  protected saveUpdateOneOptimistic(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    this.guard.mustBeUpdate(action);
    collection = this.setLoadingTrue(collection);
    return this.adapter.updateOne(action.payload, collection);
  }

  /** optimistic update error; collection already updated.
   * TODO: consider compensation to undo.
   */
  protected saveUpdateOneOptimisticError(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    return this.setLoadingFalse(collection);
  }

  /** optimistic update success; collection already updated.
   * Server may have touched other fields
   * so update the collection again if the server sent different data.
   * payload must be an {Update<T>}
   */
  protected saveUpdateOneOptimisticSuccess(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    collection = this.setLoadingFalse(collection);
    const result = action.payload || { unchanged: true };
    // A data service like `DefaultDataService<T>` will add `unchanged:true`
    // if the server responded without data, meaning there is nothing to update.
    return (<any>result).unchanged
      ? collection
      : this.adapter.updateOne(action.payload, collection);
  }

  ///// Cache-only operations /////

  protected addAll(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    this.guard.mustBeEntities(action);
    return {
      ...this.adapter.addAll(action.payload, collection),
      loaded: true, // only QUERY_ALL_SUCCESS and ADD_ALL sets loaded to true
      originalValues: {}
    };
  }

  protected addMany(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    this.guard.mustBeEntities(action);
    return this.adapter.addMany(action.payload, collection);
  }

  protected addOne(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    this.guard.mustBeEntity(action);
    return this.adapter.addOne(action.payload, collection);
  }

  protected removeAll(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    return {
      ...this.adapter.removeAll(collection),
      loaded: false, // Only REMOVE_ALL sets loaded to false
      loading: false,
      originalValues: {}
    };
  }

  protected removeMany(
    collection: EntityCollection<T>,
    action: EntityAction<number[] | string[]>
  ): EntityCollection<T> {
    // payload must be entity keys
    return this.adapter.removeMany(action.payload as string[], collection);
  }

  protected removeOne(
    collection: EntityCollection<T>,
    action: EntityAction<number | string>
  ): EntityCollection<T> {
    // payload must be entity key
    return this.adapter.removeOne(action.payload as string, collection);
  }

  protected updateMany(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>[]>
  ): EntityCollection<T> {
    // payload must be an array of `Updates<T>`, not entities
    this.guard.mustBeUpdates(action);
    return this.adapter.updateMany(action.payload, collection);
  }

  protected updateOne(
    collection: EntityCollection<T>,
    action: EntityAction<Update<T>>
  ): EntityCollection<T> {
    // payload must be an `Update<T>`, not an entity
    this.guard.mustBeUpdate(action);
    return this.adapter.updateOne(action.payload, collection);
  }

  protected upsertMany(
    collection: EntityCollection<T>,
    action: EntityAction<T[]>
  ): EntityCollection<T> {
    // <v6: payload must be an array of `Updates<T>`, not entities
    // this.guard.mustBeUpdates(action);
    // v6+: payload must be an array of T
    this.guard.mustBeEntities(action);
    return this.adapter.upsertMany(action.payload, collection);
  }

  protected upsertOne(
    collection: EntityCollection<T>,
    action: EntityAction<T>
  ): EntityCollection<T> {
    // <v6: payload must be an `Update<T>`, not an entity
    // this.guard.mustBeUpdate(action);
    // v6+: payload must be a T
    this.guard.mustBeEntity(action);
    return this.adapter.upsertOne(action.payload, collection);
  }

  protected setFilter(
    collection: EntityCollection<T>,
    action: EntityAction
  ): EntityCollection<T> {
    const filter = action.payload;
    return collection.filter === filter
      ? collection
      : { ...collection, filter };
  }

  protected setLoaded(
    collection: EntityCollection<T>,
    action: EntityAction<boolean>
  ): EntityCollection<T> {
    const loaded = action.payload === true || false;
    return collection.loaded === loaded
      ? collection
      : { ...collection, loaded };
  }

  protected setLoading(
    collection: EntityCollection<T>,
    action: EntityAction<boolean>
  ): EntityCollection<T> {
    return this.setLoadingFlag(collection, action.payload);
  }

  protected setLoadingFalse(
    collection: EntityCollection<T>
  ): EntityCollection<T> {
    return this.setLoadingFlag(collection, false);
  }

  protected setLoadingTrue(
    collection: EntityCollection<T>
  ): EntityCollection<T> {
    return this.setLoadingFlag(collection, true);
  }

  /** Set the collection's loading flag */
  protected setLoadingFlag(collection: EntityCollection<T>, loading: boolean) {
    loading = loading === true ? true : false;
    return collection.loading === loading
      ? collection
      : { ...collection, loading };
  }
}

/**
 * Creates default {EntityCollectionReducerMethods} for a given entity type.
 */
@Injectable()
export class DefaultEntityCollectionReducerMethodsFactory
  implements EntityCollectionReducerMethodsFactory {
  constructor(protected entityDefinitionService: EntityDefinitionService) {}

  /** Create the  {EntityCollectionReducerMethods} for the named entity type */
  create<T>(entityName: string): EntityCollectionReducerMethods<T> {
    const definition = this.entityDefinitionService.getDefinition<T>(
      entityName
    );
    const methodsClass = new DefaultEntityCollectionReducerMethods(
      entityName,
      definition
    );

    return methodsClass.methods;
  }
}
